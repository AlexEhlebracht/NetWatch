import { useState, useEffect } from "react";
import axios from "axios";

export default function AlertFeed({ wsData }) {
  const [alerts, setAlerts] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.108:8000";

  useEffect(() => {
    axios
      .get(`${API_URL}/api/alerts`)
      .then((r) => setAlerts(r.data))
      .catch(() => {});
  }, [wsData]);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        position: "sticky",
        top: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Alert Feed
        </div>
        {alerts.length > 0 && (
          <div
            style={{
              fontSize: 10,
              padding: "3px 10px",
              borderRadius: 20,
              background: "var(--pink-soft)",
              color: "var(--pink-light)",
            }}
          >
            {alerts.length}
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            No alerts
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 500,
            overflowY: "auto",
          }}
        >
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background:
                  alert.alert_type === "offline"
                    ? "var(--red-soft)"
                    : "var(--green-soft)",
                border: `1px solid ${alert.alert_type === "offline" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 12 }}>
                  {alert.alert_type === "offline" ? "🔴" : "🟢"}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {alert.device_name}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                {alert.message.replace(/\*\*/g, "")}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {new Date(alert.created_at + "Z").toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
