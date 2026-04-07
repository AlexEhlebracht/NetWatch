import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.108:8000";

export default function Alerts({ wsData }) {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = () => {
      axios
        .get(`${API_URL}/api/alerts`)
        .then((r) => setAlerts(r.data))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [wsData]);

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "offline") return a.alert_type === "offline";
    if (filter === "online") return a.alert_type === "online";
    return true;
  });

  const offlineCount = alerts.filter((a) => a.alert_type === "offline").length;
  const onlineCount = alerts.filter((a) => a.alert_type === "online").length;
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
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
          Alerts
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {alerts.length} total · {unresolvedCount} unresolved
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total Alerts", value: alerts.length, color: "purple" },
          { label: "Offline Events", value: offlineCount, color: "red" },
          { label: "Recovery Events", value: onlineCount, color: "green" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "16px 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background:
                  stat.color === "purple"
                    ? "linear-gradient(90deg, var(--purple-light), transparent)"
                    : stat.color === "red"
                      ? "linear-gradient(90deg, var(--red), transparent)"
                      : "linear-gradient(90deg, var(--green), transparent)",
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color:
                  stat.color === "purple"
                    ? "var(--purple-light)"
                    : stat.color === "red"
                      ? "var(--red)"
                      : "var(--green)",
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "all", label: "All" },
          { id: "offline", label: "Offline" },
          { id: "online", label: "Recovery" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background:
                filter === f.id ? "var(--purple-soft)" : "transparent",
              color:
                filter === f.id ? "var(--purple-light)" : "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
              No alerts
            </div>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${alert.alert_type === "offline" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background:
                    alert.alert_type === "offline"
                      ? "var(--red-soft)"
                      : "var(--green-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                {alert.alert_type === "offline" ? "🔴" : "🟢"}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {alert.device_name}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: "2px 8px",
                      borderRadius: 20,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      background:
                        alert.alert_type === "offline"
                          ? "var(--red-soft)"
                          : "var(--green-soft)",
                      color:
                        alert.alert_type === "offline"
                          ? "var(--red)"
                          : "var(--green)",
                    }}
                  >
                    {alert.alert_type === "offline"
                      ? "went offline"
                      : "came online"}
                  </span>
                  {!alert.resolved && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: "2px 8px",
                        borderRadius: 20,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        background: "var(--amber-soft)",
                        color: "var(--amber)",
                      }}
                    >
                      unresolved
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {alert.device_ip}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-primary)",
                    marginBottom: 2,
                  }}
                >
                  {new Date(alert.created_at + "Z").toLocaleString("en-US", {
                    timeZone: "America/Chicago",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                {alert.resolved_at && (
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    Resolved{" "}
                    {new Date(alert.resolved_at + "Z").toLocaleTimeString(
                      "en-US",
                      {
                        timeZone: "America/Chicago",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
