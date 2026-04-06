export default function DeviceGrid({ devices }) {
  const typeIcons = {
    router: "🌐",
    switch: "🔀",
    server: "🖥️",
    vm: "💻",
    unknown: "◈",
  };

  return (
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
          Network Devices
        </div>
        <div
          style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
            background: "var(--purple-soft)",
            color: "var(--purple-light)",
          }}
        >
          {devices.filter((d) => d.is_online).length} online
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {devices.length === 0 ? (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              gridColumn: "1/-1",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            Waiting for scan data...
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.ip}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${device.is_online ? "rgba(147,51,234,0.15)" : "rgba(239,68,68,0.15)"}`,
                background: device.is_online
                  ? "rgba(147,51,234,0.04)"
                  : "rgba(239,68,68,0.04)",
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {typeIcons[device.type] || typeIcons.unknown}
                </span>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: device.is_online
                      ? "var(--green)"
                      : "var(--red)",
                    boxShadow: device.is_online
                      ? "0 0 6px var(--green)"
                      : "0 0 6px var(--red)",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                {device.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 6,
                }}
              >
                {device.ip}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: device.is_online
                    ? "var(--purple-light)"
                    : "var(--red)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {device.is_online ? `${device.latency}ms` : "offline"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
