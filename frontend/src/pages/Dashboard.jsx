import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import HealthRing from "../components/HealthRing";
import DeviceGrid from "../components/DeviceGrid";
import ServicePanel from "../components/ServicePanel";
import AlertFeed from "../components/AlertFeed";
import StatCard from "../components/StatCard";

export default function Dashboard({ wsData }) {
  const devices = wsData?.devices || [];
  const services = wsData?.services || [];

  const onlineCount = devices.filter((d) => d.is_online).length;
  const totalCount = devices.length;
  const healthPct =
    totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;
  const avgLatency = useMemo(() => {
    const online = devices.filter((d) => d.is_online && d.latency);
    if (!online.length) return 0;
    return (
      online.reduce((sum, d) => sum + d.latency, 0) / online.length
    ).toFixed(2);
  }, [devices]);
  const servicesUp = services.filter((s) => s.is_up).length;
  const lastUpdate = wsData?.timestamp
    ? new Date(wsData.timestamp + "Z").toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
      })
    : null;

  const [alerts, setAlerts] = useState([]);
  const API_URL = `${window.location.protocol}//${window.location.host}`;

  useEffect(() => {
    const fetchAlerts = () => {
      axios
        .get(`${API_URL}/api/alerts`)
        .then((r) => setAlerts(r.data))
        .catch(() => {});
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const last24h = alerts.filter((a) => {
    const alertTime = new Date(a.created_at + "Z");
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return alertTime > cutoff;
  }).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, var(--glow-pink) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 6,
          }}
        >
          // NetWatch
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Network Overview
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {lastUpdate ? `Last scan: ${lastUpdate}` : "Waiting for data..."}
        </div>
      </div>

      {/* Hero row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: 16,
          marginBottom: 20,
          alignItems: "start",
        }}
      >
        <HealthRing pct={healthPct} online={onlineCount} total={totalCount} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <StatCard
            label="Avg Latency"
            value={`${avgLatency}ms`}
            sub="across online devices"
            color="purple"
          />
          <StatCard
            label="Services"
            value={`${servicesUp}/${services.length}`}
            sub="health checks passing"
            color="blue"
          />
          <StatCard
            label="Alerts"
            value={last24h}
            sub="in last 24 hours"
            color="pink"
          />
        </div>
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DeviceGrid devices={devices} />
          <ServicePanel services={services} />
        </div>
        <AlertFeed wsData={wsData} />
      </div>
    </div>
  );
}
