import httpx
from datetime import datetime
from app.config import DISCORD_WEBHOOK_URL

async def send_discord_alert(device_name: str, ip: str, alert_type: str, message: str):
    if not DISCORD_WEBHOOK_URL:
        return
    
    color = 0xFF0000 if alert_type == "offline" else 0x00FF00
    emoji = "🔴" if alert_type == "offline" else "🟢"
    
    embed = {
        "embeds": [{
            "title": f"{emoji} NetWatch Alert",
            "description": message,
            "color": color,
            "fields": [
                {"name": "Device", "value": device_name, "inline": True},
                {"name": "IP", "value": ip, "inline": True},
                {"name": "Time", "value": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), "inline": False}
            ],
            "footer": {"text": "NetWatch — Home Lab Monitor"}
        }]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            await client.post(DISCORD_WEBHOOK_URL, json=embed)
    except Exception as e:
        print(f"Failed to send Discord alert: {e}")

async def send_service_alert(service_name: str, ip: str, is_up: bool):
    status = "recovered" if is_up else "went down"
    alert_type = "online" if is_up else "offline"
    message = f"Service **{service_name}** on {ip} has {status}"
    await send_discord_alert(service_name, ip, alert_type, message)