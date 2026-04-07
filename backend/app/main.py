from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import asyncio

from app.database import init_db, get_db
from app.models import Device, PingHistory, ServiceCheck, Alert
from app.scanner import scan_all_devices, check_all_services
from app.alerts import send_discord_alert, send_service_alert
from app.proxmox import get_node_stats, get_vm_stats, get_storage_stats
from app.websocket_manager import manager
from app.config import KNOWN_DEVICES, SCAN_INTERVAL

device_states = {}
service_states = {}

async def run_scan():
    from .database import AsyncSessionLocal
    
    scan_results = await scan_all_devices()
    service_results = await check_all_services()
    proxmox_stats = await get_node_stats()
    vm_stats = await get_vm_stats()
    storage_stats = await get_storage_stats()
    
    async with AsyncSessionLocal() as db:
        for result in scan_results:
            ip = result["ip"]
            is_online = result["is_online"]
            
            prev_state = device_states.get(ip)
            if prev_state is not None and prev_state != is_online:
                status = "came online" if is_online else "went offline"
                alert_type = "online" if is_online else "offline"
                message = f"**{result['name']}** ({ip}) has {status}"
                
                await send_discord_alert(result["name"], ip, alert_type, message)
                
                alert = Alert(
                    device_ip=ip,
                    device_name=result["name"],
                    alert_type=alert_type,
                    message=message,
                    resolved=is_online,
                    resolved_at=datetime.utcnow() if is_online else None
                )
                db.add(alert)
            
            device_states[ip] = is_online
            
            existing = await db.execute(select(Device).where(Device.ip == ip))
            device = existing.scalar_one_or_none()
            
            if device:
                device.is_online = is_online
                device.latency = result["latency"]
                if is_online:
                    device.last_seen = datetime.utcnow()
                if result.get("mac"):
                    device.mac = result["mac"]
            else:
                device = Device(
                    name=result["name"],
                    ip=ip,
                    device_type=result["type"],
                    is_online=is_online,
                    latency=result["latency"],
                    mac=result.get("mac"),
                    last_seen=datetime.utcnow() if is_online else None
                )
                db.add(device)
            
            ping = PingHistory(
                device_ip=ip,
                latency=result["latency"],
                is_online=is_online
            )
            db.add(ping)
        
        for result in service_results:
            key = f"{result['ip']}:{result['name']}"
            prev_state = service_states.get(key)
            
            if prev_state is not None and prev_state != result["is_up"]:
                await send_service_alert(result["name"], result["ip"], result["is_up"])
            
            service_states[key] = result["is_up"]
            
            check = ServiceCheck(
                device_ip=result["ip"],
                service_name=result["name"],
                is_up=result["is_up"],
                response_time=result["response_time"],
                status_code=result.get("status_code")
            )
            db.add(check)
        
        await db.commit()
    
    await manager.broadcast({
        "type": "scan_update",
        "devices": scan_results,
        "services": service_results,
        "proxmox": proxmox_stats,
        "vms": vm_stats,
        "storage": storage_stats,
        "timestamp": datetime.utcnow().isoformat()
    })

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    
    from app.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Device))
        existing_devices = result.scalars().all()
        for device in existing_devices:
            device_states[device.ip] = device.is_online
    
    for device in KNOWN_DEVICES:
        if device["ip"] not in device_states:
            device_states[device["ip"]] = None
    
    scheduler.add_job(run_scan, "interval", seconds=SCAN_INTERVAL)
    scheduler.start()
    print(f"NetWatch started — scanning every {SCAN_INTERVAL} seconds")
    yield
    scheduler.shutdown()

app = FastAPI(title="NetWatch", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/devices")
async def get_devices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).order_by(Device.name))
    devices = result.scalars().all()
    return devices

@app.get("/api/devices/{ip}/history")
async def get_device_history(ip: str, minutes: int = 1440, db: AsyncSession = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    result = await db.execute(
        select(PingHistory)
        .where(PingHistory.device_ip == ip)
        .where(PingHistory.timestamp >= cutoff)
        .order_by(PingHistory.timestamp)
    )
    return result.scalars().all()

@app.get("/api/services")
async def get_services(db: AsyncSession = Depends(get_db)):
    from app.config import SERVICES
    port_map = {s["name"]: s.get("port") for s in SERVICES}
    
    result = await db.execute(
        select(ServiceCheck)
        .order_by(desc(ServiceCheck.timestamp))
        .limit(50)
    )
    checks = result.scalars().all()
    
    return [{
        "id": c.id,
        "device_ip": c.device_ip,
        "service_name": c.service_name,
        "is_up": c.is_up,
        "response_time": c.response_time,
        "status_code": c.status_code,
        "timestamp": c.timestamp,
        "port": port_map.get(c.service_name)
    } for c in checks]

@app.get("/api/alerts")
async def get_alerts(limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Alert)
        .order_by(desc(Alert.created_at))
        .limit(limit)
    )
    return result.scalars().all()

@app.get("/api/proxmox")
async def get_proxmox():
    node_stats = await get_node_stats()
    vm_stats = await get_vm_stats()
    storage_stats = await get_storage_stats()
    return {
        "node": node_stats,
        "vms": vm_stats,
        "storage": storage_stats
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/services/{ip}/{name}/history")
async def get_service_history(ip: str, name: str, minutes: int = 60, db: AsyncSession = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    result = await db.execute(
        select(ServiceCheck)
        .where(ServiceCheck.device_ip == ip)
        .where(ServiceCheck.service_name == name)
        .where(ServiceCheck.timestamp >= cutoff)
        .order_by(ServiceCheck.timestamp)
    )
    return result.scalars().all()