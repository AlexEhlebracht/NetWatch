from proxmoxer import ProxmoxAPI
from app.config import PROXMOX_HOST, PROXMOX_USER, PROXMOX_PASSWORD
import ssl

def get_proxmox_client():
    return ProxmoxAPI(
        PROXMOX_HOST,
        user=PROXMOX_USER,
        password=PROXMOX_PASSWORD,
        verify_ssl=False
    )

async def get_node_stats() -> dict:
    try:
        proxmox = get_proxmox_client()
        node_status = proxmox.nodes("pve").status.get()
        
        return {
            "cpu_usage": round(node_status["cpu"] * 100, 2),
            "cpu_cores": node_status["cpuinfo"]["cpus"],
            "ram_total": node_status["memory"]["total"],
            "ram_used": node_status["memory"]["used"],
            "ram_free": node_status["memory"]["free"],
            "uptime": node_status["uptime"],
        }
    except Exception as e:
        print(f"Proxmox stats error: {e}")
        return {}

async def get_vm_stats() -> list[dict]:
    try:
        proxmox = get_proxmox_client()
        vms = proxmox.nodes("pve").qemu.get()
        
        vm_stats = []
        for vm in vms:
            vmid = vm["vmid"]
            try:
                status = proxmox.nodes("pve").qemu(vmid).status.current.get()
                vm_stats.append({
                    "vmid": vmid,
                    "name": vm["name"],
                    "status": status["status"],
                    "cpu_usage": round(status.get("cpu", 0) * 100, 2),
                    "ram_used": status.get("mem", 0),
                    "ram_total": status.get("maxmem", 0),
                    "disk_used": status.get("disk", 0),
                    "disk_total": status.get("maxdisk", 0),
                    "uptime": status.get("uptime", 0),
                    "netin": status.get("netin", 0),
                    "netout": status.get("netout", 0),
                })
            except Exception:
                continue
                
        return vm_stats
    except Exception as e:
        print(f"Proxmox VM stats error: {e}")
        return []

async def get_storage_stats() -> list[dict]:
    try:
        proxmox = get_proxmox_client()
        storages = proxmox.nodes("pve").storage.get()
        
        storage_stats = []
        for storage in storages:
            if "used" in storage and "total" in storage:
                storage_stats.append({
                    "name": storage["storage"],
                    "used": storage["used"],
                    "total": storage["total"],
                    "free": storage["avail"],
                    "usage_pct": round((storage["used"] / storage["total"]) * 100, 2)
                })
        return storage_stats
    except Exception as e:
        print(f"Proxmox storage error: {e}")
        return []