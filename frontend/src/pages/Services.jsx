import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  CartesianGrid,
  XAxis,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.108:8000";

function ServiceChart({ serviceName, deviceIp }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/services/${deviceIp}/${serviceName}/history`)
      .then((r) => {
        const data = r.data
          .filter((s) => s.response_time)
          .slice(-60)
          .map((s) => ({
            response_time: s.response_time,
            time: new Date(s.timestamp + "Z").toLocaleString("en-US", {
              timeZone: "America/Chicago",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          }));
        setHistory(data);
      })
      .catch(() => {});
  }, [serviceName, deviceIp]);

  if (!history.length)
    return (
      <div
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          No history
        </span>
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart
        data={history}
        margin={{ top: 4, right: 8, bottom: 4, left: 28 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <YAxis
          tick={{
            fontSize: 8,
            fill: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
          tickFormatter={(v) => `${v}ms`}
          width={24}
          domain={["auto", "auto"]}
        />
        <XAxis dataKey="time" hide />
        <Line
          type="monotone"
          dataKey="response_time"
          stroke="var(--blue-light)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          isAnimationActive={false}
          cursor={{ stroke: "rgba(59,130,246,0.3)", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "6px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--blue-light)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {payload[0].value}ms
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Services({ wsData }) {
  const [services, setServices] = useState([]);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    const fetch = () => {
      axios
        .get(`${API_URL}/api/services`)
        .then((r) => setServices(r.data))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [wsData]);

  const latest = {};
  services.forEach((s) => {
    const key = `${s.device_ip}:${s.service_name}`;
    if (!latest[key]) latest[key] = s;
  });
  const latestServices = Object.values(latest);

  const upCount = latestServices.filter((s) => s.is_up).length;

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
          Services
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {upCount}/{latestServices.length} services healthy
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {latestServices.length === 0 ? (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            Waiting for service check data...
          </div>
        ) : (
          latestServices.map((svc) => {
            const key = `${svc.device_ip}:${svc.service_name}`;
            const isExpanded = expanded.has(key);

            return (
              <div
                key={key}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${isExpanded ? "rgba(59,130,246,0.3)" : "var(--border)"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(key) ? next.delete(key) : next.add(key);
                      return next;
                    })
                  }
                  style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: svc.is_up
                        ? "var(--blue-soft)"
                        : "var(--red-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {svc.is_up ? "◎" : "✕"}
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
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {svc.service_name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 8px",
                          borderRadius: 20,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          background: svc.is_up
                            ? "var(--green-soft)"
                            : "var(--red-soft)",
                          color: svc.is_up ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {svc.is_up ? "healthy" : "down"}
                      </span>
                      {svc.status_code && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background:
                              svc.status_code < 500
                                ? "var(--blue-soft)"
                                : "var(--red-soft)",
                            color:
                              svc.status_code < 500
                                ? "var(--blue-light)"
                                : "var(--red)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {svc.status_code}
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
                      {svc.device_ip}:{svc.port || "—"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", marginRight: 8 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        color: svc.is_up ? "var(--blue-light)" : "var(--red)",
                      }}
                    >
                      {svc.response_time ? `${svc.response_time}ms` : "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      response
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: "0 20px 20px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ paddingTop: 16 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        {[
                          {
                            label: "Status",
                            value: svc.is_up ? "Healthy" : "Down",
                          },
                          {
                            label: "Response Time",
                            value: svc.response_time
                              ? `${svc.response_time}ms`
                              : "—",
                          },
                          {
                            label: "Last Check",
                            value: new Date(
                              svc.timestamp + "Z",
                            ).toLocaleTimeString("en-US", {
                              timeZone: "America/Chicago",
                            }),
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              padding: "10px 12px",
                              background: "var(--bg-secondary)",
                              borderRadius: 8,
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 9,
                                color: "var(--text-muted)",
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                marginBottom: 4,
                              }}
                            >
                              {item.label}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        Response Time History
                      </div>
                      <ServiceChart
                        serviceName={svc.service_name}
                        deviceIp={svc.device_ip}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
