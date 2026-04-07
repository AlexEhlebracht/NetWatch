import asyncio
import subprocess
import re
from datetime import datetime
from typing import Optional
import httpx
from app.config import KNOWN_DEVICES, SERVICES
import time

async def get_arp_table() -> dict:
    try:
        result = await asyncio.create_subprocess_exec(
            "arp", "-a",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, _ = await result.communicate()
        macs = {}
        for line in stdout.decode().splitlines():
            parts = line.split()
            if len(parts) >= 4:
                ip = parts[1].strip('()')
                mac = parts[3]
                if mac != '<incomplete>':
                    macs[ip] = mac

        # Add local machine MAC
        local = await asyncio.create_subprocess_exec(
            "ip", "link", "show", "enp6s18",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        local_out, _ = await local.communicate()
        for line in local_out.decode().splitlines():
            if 'link/ether' in line:
                local_mac = line.strip().split()[1]
                macs['192.168.1.108'] = local_mac
                break

        return macs
    except Exception:
        return {}

async def ping_device(ip: str) -> tuple[bool, Optional[float]]:
    try:
        result = await asyncio.create_subprocess_exec(
            "ping", "-c", "2", "-W", "2", ip,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(result.communicate(), timeout=5)
        
        if result.returncode == 0:
            output = stdout.decode()
            match = re.search(r'time=(\d+\.?\d*)', output)
            if match:
                latency = round(float(match.group(1)), 2)
                return True, latency
            return True, None
        return False, None
    except Exception:
        return False, None

async def check_tcp_service(ip: str, port: int) -> tuple[bool, Optional[float]]:
    try:
        start = time.perf_counter()
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(ip, port), timeout=3
        )
        elapsed = (time.perf_counter() - start) * 1000
        writer.close()
        await writer.wait_closed()
        return True, elapsed
    except Exception:
        return False, None

async def check_http_service(url: str) -> tuple[bool, Optional[float], Optional[int]]:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            start = time.perf_counter()
            response = await client.get(url)
            elapsed = (time.perf_counter() - start) * 1000
            is_up = response.status_code < 500
            return is_up, elapsed, response.status_code
    except Exception:
        return False, None, None

async def scan_all_devices() -> list[dict]:
    tasks = [ping_device(d["ip"]) for d in KNOWN_DEVICES]
    results = await asyncio.gather(*tasks)
    macs = await get_arp_table()
    
    scan_results = []
    for device, (is_online, latency) in zip(KNOWN_DEVICES, results):
        scan_results.append({
            "name": device["name"],
            "ip": device["ip"],
            "type": device["type"],
            "is_online": is_online,
            "latency": latency,
            "mac": macs.get(device["ip"]),
            "timestamp": datetime.utcnow()
        })
    return scan_results

async def check_all_services() -> list[dict]:
    service_results = []
    
    for service in SERVICES:
        if service["type"] == "http":
            is_up, response_time, status_code = await check_http_service(service["url"])
        else:
            is_up, response_time = await check_tcp_service(service["ip"], service["port"])
            status_code = None
            
        service_results.append({
            "name": service["name"],
            "ip": service["ip"],
            "port": service.get("port"),
            "is_up": is_up,
            "response_time": response_time,
            "status_code": status_code,
            "timestamp": datetime.utcnow()
        })
    
    return service_results