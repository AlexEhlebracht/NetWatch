import { useState, useEffect, useMemo } from "react";
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
const HISTORY_MINUTES = 60;
const X_TICK_MINUTES = 10;
const Y_TICK_COUNT = 6;

function formatMs(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  if (n < 10) return `${n.toFixed(2)}ms`;
  if (n < 100) return `${n.toFixed(1)}ms`;
  return `${Math.round(n)}ms`;
}

function formatAxisMs(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  if (n < 10) return `${n.toFixed(2)}`;
  if (n < 100) return `${n.toFixed(1)}`;
  return `${Math.round(n)}`;
}

function formatServiceAxisTime(value) {
  return new Date(value).toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatServiceTooltipTime(value) {
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function buildTimeTicks(startMs, endMs, stepMinutes = 10) {
  const stepMs = stepMinutes * 60 * 1000;
  const firstTick = Math.ceil(startMs / stepMs) * stepMs;
  const ticks = [];

  for (let t = firstTick; t <= endMs; t += stepMs) {
    ticks.push(t);
  }

  return ticks;
}

function niceStep(rawStep) {
  if (rawStep <= 0) return 0.1;

  const exponent = Math.floor(Math.log10(rawStep));
  const fraction = rawStep / 10 ** exponent;

  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * 10 ** exponent;
}

function buildYAxis(history) {
  if (!history.length) {
    return {
      domain: [0, 5],
      ticks: [0, 1, 2, 3, 4, 5],
    };
  }

  const values = history
    .map((p) => Number(p.response_time))
    .filter((v) => !Number.isNaN(v));

  if (!values.length) {
    return {
      domain: [0, 5],
      ticks: [0, 1, 2, 3, 4, 5],
    };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    const pad = Math.max(min * 0.1, min < 10 ? 0.1 : 1);
    min = Math.max(0, min - pad);
    max = max + pad;
  } else {
    const pad = (max - min) * 0.12;
    min = Math.max(0, min - pad);
    max = max + pad;
  }

  const rawStep = (max - min) / (Y_TICK_COUNT - 1);
  const step = niceStep(rawStep);

  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  const ticks = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(4)));
  }

  return {
    domain: [start, end],
    ticks,
  };
}

function ServiceChart({ serviceName, deviceIp }) {
  const [history, setHistory] = useState([]);
  const [domain, setDomain] = useState([
    Date.now() - HISTORY_MINUTES * 60 * 1000,
    Date.now(),
  ]);

  useEffect(() => {
    axios
      .get(
        `${API_URL}/api/services/${deviceIp}/${serviceName}/history?minutes=${HISTORY_MINUTES}`,
      )
      .then((r) => {
        const now = Date.now();
        const oneHourAgo = now - HISTORY_MINUTES * 60 * 1000;
        let lastTime = null;

        const data = r.data
          .filter((s) => s.response_time != null)
          .map((s) => {
            const ts = new Date(s.timestamp + "Z").getTime();
            return {
              response_time: Number(s.response_time),
              ts,
            };
          })
          .filter(
            (s) => !Number.isNaN(s.ts) && s.ts >= oneHourAgo && s.ts <= now,
          )
          .filter((s) => {
            if (lastTime === null || s.ts - lastTime >= 30 * 1000) {
              lastTime = s.ts;
              return true;
            }
            return false;
          });

        setHistory(data);
        setDomain([oneHourAgo, now]);
      })
      .catch(() => {});
  }, [serviceName, deviceIp]);

  const xTicks = useMemo(
    () => buildTimeTicks(domain[0], domain[1], X_TICK_MINUTES),
    [domain],
  );

  const yAxisConfig = useMemo(() => buildYAxis(history), [history]);

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
    <div className="service-chart-shell" style={{ width: "100%", height: 200 }}>
      <style>
        {`
          .service-chart-shell .recharts-wrapper:focus,
          .service-chart-shell .recharts-surface:focus,
          .service-chart-shell svg:focus,
          .service-chart-shell *:focus {
            outline: none !important;
          }

          .service-chart-shell .recharts-layer:focus,
          .service-chart-shell .recharts-active-dot:focus,
          .service-chart-shell .recharts-dot:focus {
            outline: none !important;
          }
        `}
      </style>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={history}
          margin={{ top: 4, right: 12, bottom: 4, left: 36 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.29)"
          />

          <YAxis
            type="number"
            allowDecimals={true}
            domain={yAxisConfig.domain}
            ticks={yAxisConfig.ticks}
            width={36}
            tick={{
              fontSize: 8,
              fill: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
            tickFormatter={formatAxisMs}
          />

          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={domain}
            ticks={xTicks}
            interval={0}
            minTickGap={20}
            tick={{
              fontSize: 8,
              fill: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.15)" }}
            padding={{ left: 0, right: 0 }}
            tickFormatter={formatServiceAxisTime}
          />

          <Line
            type="monotone"
            dataKey="response_time"
            stroke="var(--blue-light)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{
              r: 3,
              stroke: "var(--blue-light)",
              strokeWidth: 1,
              fill: "var(--bg-card)",
            }}
            isAnimationActive={false}
            connectNulls={false}
          />

          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: "rgba(59,130,246,0.3)", strokeWidth: 1 }}
            labelFormatter={formatServiceTooltipTime}
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
                    {formatMs(payload[0].value)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {formatServiceTooltipTime(label)}
                  </div>
                </div>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
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

  const latestServices = Object.values(latest).sort((a, b) => {
    if (a.device_ip !== b.device_ip) {
      return a.device_ip.localeCompare(b.device_ip);
    }
    return a.service_name.localeCompare(b.service_name);
  });

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
                  border: `1px solid ${
                    isExpanded ? "rgba(59,130,246,0.3)" : "var(--border)"
                  }`,
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
                      {svc.response_time != null
                        ? formatMs(svc.response_time)
                        : svc.is_up
                          ? "< 1ms"
                          : "—"}
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
                            value:
                              svc.response_time != null
                                ? formatMs(svc.response_time)
                                : svc.is_up
                                  ? "< 1ms"
                                  : "—",
                          },
                          {
                            label: "Last Check",
                            value: new Date(svc.timestamp).toLocaleTimeString(
                              "en-US",
                              {
                                timeZone: "America/Chicago",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              },
                            ),
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
