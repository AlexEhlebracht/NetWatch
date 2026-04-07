import { useState, useEffect } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}`;

function ResourceBar({ label, used, total, unit, color }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const colors = {
    purple: "var(--purple-light)",
    pink: "var(--pink-light)",
    blue: "var(--blue-light)",
    green: "var(--green)",
    amber: "var(--amber)",
  };
  const c = colors[color] || colors.purple;

  const format = (val) => {
    if (unit === "GB") return `${(val / 1073741824).toFixed(1)}GB`;
    if (unit === "%") return `${val}%`;
    return val;
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span
          style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: c }}
        >
          {unit === "%" ? `${pct}%` : `${format(used)} / ${format(total)}`}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--border)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct > 80 ? "var(--red)" : pct > 60 ? "var(--amber)" : c,
            borderRadius: 3,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes) {
  if (bytes > 1073741824) return `${(bytes / 1073741824).toFixed(1)}GB`;
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)}MB`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

export default function ProxmoxPage({ wsData }) {
  const [proxmox, setProxmox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = () => {
      axios
        .get(`${API_URL}/api/proxmox`)
        .then((r) => {
          setProxmox(r.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const node = proxmox?.node || {};
  const vms = proxmox?.vms || [];
  const storage = proxmox?.storage || [];

  const statusColors = {
    running: "var(--green)",
    stopped: "var(--red)",
    paused: "var(--amber)",
  };

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
          Proxmox
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {loading
            ? "Connecting to Proxmox API..."
            : `${vms.length} VMs · Host uptime ${formatUptime(node.uptime || 0)}`}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          Loading Proxmox data...
        </div>
      ) : !node.cpu_cores ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--red)",
            fontSize: 13,
          }}
        >
          Could not connect to Proxmox API — check credentials in .env
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Host stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 150,
                  height: 150,
                  background:
                    "radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Host — Surface Laptop Studio
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: "CPU Cores", value: node.cpu_cores },
                  { label: "CPU Usage", value: `${node.cpu_usage}%` },
                  { label: "Uptime", value: formatUptime(node.uptime || 0) },
                  {
                    label: "VMs Running",
                    value: vms.filter((v) => v.status === "running").length,
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
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--purple-light)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <ResourceBar
                label="CPU"
                used={node.cpu_usage}
                total={100}
                unit="%"
                color="purple"
              />
              <ResourceBar
                label="RAM"
                used={node.ram_used}
                total={node.ram_total}
                unit="GB"
                color="pink"
              />
            </div>

            {/* Storage */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Storage
              </div>
              {storage.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  No storage data
                </div>
              ) : (
                storage.map((s) => (
                  <ResourceBar
                    key={s.name}
                    label={s.name}
                    used={s.used}
                    total={s.total}
                    unit="GB"
                    color="blue"
                  />
                ))
              )}
            </div>
          </div>

          {/* VM list */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Virtual Machines
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vms.length === 0 ? (
                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No VMs found
                </div>
              ) : (
                vms.map((vm) => (
                  <div
                    key={vm.vmid}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "var(--bg-secondary)",
                      border: `1px solid ${vm.status === "running" ? "rgba(147,51,234,0.15)" : "var(--border)"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {vm.name}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              padding: "2px 8px",
                              borderRadius: 20,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              background:
                                vm.status === "running"
                                  ? "var(--green-soft)"
                                  : "var(--red-soft)",
                              color:
                                statusColors[vm.status] || "var(--text-muted)",
                            }}
                          >
                            {vm.status}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          vmid {vm.vmid} · up {formatUptime(vm.uptime || 0)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          ↑ {formatBytes(vm.netout || 0)} ↓{" "}
                          {formatBytes(vm.netin || 0)}
                        </div>
                      </div>
                    </div>
                    <ResourceBar
                      label={`CPU — ${vm.cpu_usage}%`}
                      used={vm.cpu_usage}
                      total={100}
                      unit="%"
                      color="purple"
                    />
                    <ResourceBar
                      label="RAM"
                      used={vm.ram_used}
                      total={vm.ram_total}
                      unit="GB"
                      color="pink"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
