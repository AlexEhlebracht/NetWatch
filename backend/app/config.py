from dotenv import load_dotenv
import os

load_dotenv()

KNOWN_DEVICES = [
    {"name": "Netgear Router", "ip": "192.168.1.1", "type": "router"},
    {"name": "TP-Link Switch", "ip": "192.168.1.2", "type": "switch"},
    {"name": "Proxmox Host", "ip": "192.168.1.105", "type": "server"},
    {"name": "Webserver VM", "ip": "192.168.1.126", "type": "vm"},
    {"name": "Postgres VM", "ip": "192.168.1.125", "type": "vm"},
    {"name": "MinIO VM", "ip": "192.168.1.120", "type": "vm"},
    {"name": "Redis VM", "ip": "192.168.1.127", "type": "vm"},
    {"name": "NetWatch VM", "ip": "192.168.1.108", "type": "vm"},
]

SERVICES = [
    {"name": "Nginx", "ip": "192.168.1.126", "port": 80, "type": "http", "url": "http://192.168.1.126"},
    {"name": "Daphne", "ip": "192.168.1.126", "port": 80, "type": "http", "url": "http://192.168.1.126/chat/api/token/"},
    {"name": "PostgreSQL", "ip": "192.168.1.125", "port": 5432, "type": "tcp"},
    {"name": "MinIO API", "ip": "192.168.1.120", "port": 9000, "type": "http", "url": "http://192.168.1.120:9000/minio/health/live"},
    {"name": "Redis", "ip": "192.168.1.127", "port": 6379, "type": "tcp"},
]

DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
SCAN_INTERVAL = int(os.environ.get("SCAN_INTERVAL", "5"))
PROXMOX_HOST = os.environ.get("PROXMOX_HOST", "192.168.1.105")
PROXMOX_USER = os.environ.get("PROXMOX_USER", "root@pam")
PROXMOX_PASSWORD = os.environ.get("PROXMOX_PASSWORD")