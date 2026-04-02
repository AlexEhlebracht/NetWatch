from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from sqlalchemy import String, Float, Boolean, DateTime, Text, Integer
from datetime import datetime
from typing import Optional

class Base(DeclarativeBase):
    pass

class Device(Base):
    __tablename__ = "devices"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    ip: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    mac: Mapped[Optional[str]] = mapped_column(String(17), nullable=True)
    device_type: Mapped[str] = mapped_column(String(50), default="unknown")
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    latency: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class PingHistory(Base):
    __tablename__ = "ping_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_ip: Mapped[str] = mapped_column(String(15), nullable=False)
    latency: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_online: Mapped[bool] = mapped_column(Boolean, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ServiceCheck(Base):
    __tablename__ = "service_checks"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_ip: Mapped[str] = mapped_column(String(15), nullable=False)
    service_name: Mapped[str] = mapped_column(String(50), nullable=False)
    is_up: Mapped[bool] = mapped_column(Boolean, nullable=False)
    response_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_ip: Mapped[str] = mapped_column(String(15), nullable=False)
    device_name: Mapped[str] = mapped_column(String(100), nullable=False)
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)