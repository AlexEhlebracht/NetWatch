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

const typeIcons = {
  router: "🌐",
  switch: "🔀",
  server: "🖥️",
  vm: "💻",
  unknown: "◈",
};

const TIMEFRAMES = [
  { label: "1m", minutes: 1 },
  { label: "5m", minutes: 5 },
  { label: "1h", minutes: 60 },
  { label: "24h", minutes: 1440 },
  { label: "7d", minutes: 10080 },
];

function DeviceChart({ ip, timeframe }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/devices/${ip}/history?minutes=${timeframe.minutes}`)
      .then((r) => {
        const data = r.data
          .filter((h) => h.is_online && h.latency)
          .map((h) => ({
            latency: h.latency,
            time: new Date(h.timestamp + "Z").toLocaleString("en-US", {
              timeZone: "America/Chicago",
              ...(timeframe.minutes <= 60
                ? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                : timeframe.minutes <= 1440
                  ? { hour: "2-digit", minute: "2-digit" }
                  : { month: "short", day: "numeric", hour: "2-digit" }),
            }),
          }));
        setHistory(data);
      })
      .catch(() => {});
  }, [ip, timeframe]);

  if (!history.length)
    return (
      <div
        style={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          No data for this timeframe
        </span>
      </div>
    );

  const maxLatency = Math.max(...history.map((h) => h.latency));
  const minLatency = Math.min(...history.map((h) => h.latency));
  const avgLatency = (
    history.reduce((s, h) => s + h.latency, 0) / history.length
  ).toFixed(2);
  const tickCount =
    { 1: 6, 5: 10, 60: 12, 1440: 12, 10080: 7 }[timeframe.minutes] || 6;
  const tickInterval = Math.max(0, Math.floor(history.length / tickCount) - 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Avg{" "}
          <span
            style={{
              color: "var(--purple-light)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {avgLatency}ms
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Min{" "}
          <span
            style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}
          >
            {minLatency}ms
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Max{" "}
          <span
            style={{
              color: "var(--pink-light)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {maxLatency}ms
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {history.length} samples
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart
          data={history}
          margin={{ top: 5, right: 10, bottom: 5, left: 30 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <XAxis
            dataKey="time"
            tick={{
              fontSize: 9,
              fill: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{
              fontSize: 9,
              fill: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
            tickFormatter={(v) => `${v}ms`}
            width={28}
          />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="var(--purple-light)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--purple-light)",
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
    </div>
  );
}

export default function Devices({ wsData }) {
  const devices = wsData?.devices || [];
  const [deviceDetails, setDeviceDetails] = useState({});
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[3]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/devices`)
      .then((r) => {
        const details = {};
        r.data.forEach((d) => {
          details[d.ip] = d;
        });
        setDeviceDetails(details);
      })
      .catch(() => {});
  }, [wsData]);

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
          Devices
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {devices.length} devices ·{" "}
            {devices.filter((d) => d.is_online).length} online
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background:
                    timeframe.label === tf.label
                      ? "var(--purple-soft)"
                      : "transparent",
                  color:
                    timeframe.label === tf.label
                      ? "var(--purple-light)"
                      : "var(--text-muted)",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  transition: "all 0.2s",
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {devices.length === 0 ? (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            Waiting for scan data...
          </div>
        ) : (
          devices.map((device) => {
            const details = deviceDetails[device.ip] || {};
            const isExpanded = expanded === device.ip;

            return (
              <div
                key={device.ip}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${isExpanded ? "rgba(147,51,234,0.3)" : "var(--border)"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  onClick={() => setExpanded(isExpanded ? null : device.ip)}
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
                      background: device.is_online
                        ? "var(--purple-soft)"
                        : "var(--red-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {typeIcons[device.type] || typeIcons.unknown}
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
                        {device.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 8px",
                          borderRadius: 20,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          background: device.is_online
                            ? "var(--green-soft)"
                            : "var(--red-soft)",
                          color: device.is_online
                            ? "var(--green)"
                            : "var(--red)",
                        }}
                      >
                        {device.is_online ? "online" : "offline"}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {device.ip}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          textTransform: "capitalize",
                        }}
                      >
                        {device.type}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", marginRight: 8 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        color: device.is_online
                          ? "var(--purple-light)"
                          : "var(--red)",
                      }}
                    >
                      {device.is_online ? `${device.latency}ms` : "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      latency
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
                    <div style={{ paddingTop: 16, marginBottom: 14 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        {[
                          {
                            label: "First Seen",
                            value: details.first_seen
                              ? new Date(
                                  details.first_seen + "Z",
                                ).toLocaleDateString("en-US", {
                                  timeZone: "America/Chicago",
                                })
                              : "—",
                          },
                          {
                            label: "Last Seen",
                            value: details.last_seen
                              ? new Date(
                                  details.last_seen + "Z",
                                ).toLocaleTimeString("en-US", {
                                  timeZone: "America/Chicago",
                                })
                              : "—",
                          },
                          { label: "Type", value: device.type || "—" },
                          { label: "MAC", value: details.mac || "unknown" },
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
                                fontSize: 11,
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-mono)",
                                textTransform: "capitalize",
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
                        Latency History — {timeframe.label}
                      </div>
                      <DeviceChart ip={device.ip} timeframe={timeframe} />
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
