export default function ServicePanel({ services }) {
  const machineNames = {
    "192.168.1.126": "Webserver VM",
    "192.168.1.125": "Postgres VM",
    "192.168.1.120": "MinIO VM",
    "192.168.1.127": "Redis VM",
    "192.168.1.108": "NetWatch VM",
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
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-secondary)",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Service Health
      </div>
      {services.length === 0 ? (
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: 12,
            padding: "20px 0",
            textAlign: "center",
          }}
        >
          Waiting for service checks...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {services.map((svc, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: svc.is_up ? "var(--green)" : "var(--red)",
                  boxShadow: svc.is_up
                    ? "0 0 6px var(--green)"
                    : "0 0 6px var(--red)",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {svc.service_name || svc.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {machineNames[svc.device_ip] || svc.device_ip}
                  {svc.port ? `:${svc.port}` : ""}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: svc.is_up ? "var(--purple-light)" : "var(--red)",
                }}
              >
                {svc.is_up ? `${svc.response_time}ms` : "DOWN"}
              </div>
              {svc.status_code && (
                <div
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background:
                      svc.status_code < 500
                        ? "var(--green-soft)"
                        : "var(--red-soft)",
                    color:
                      svc.status_code < 500 ? "var(--green)" : "var(--red)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {svc.status_code}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
