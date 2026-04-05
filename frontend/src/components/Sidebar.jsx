export default function Sidebar({ page, setPage, theme, setTheme, connected }) {
  const nav = [
    { id: "dashboard", label: "Overview", icon: "⬡" },
    { id: "devices", label: "Devices", icon: "◈" },
    { id: "services", label: "Services", icon: "◎" },
    { id: "proxmox", label: "Proxmox", icon: "▣" },
    { id: "alerts", label: "Alerts", icon: "◬" },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        zIndex: 100,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ marginBottom: 32, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--purple), var(--pink))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: 0.5,
              }}
            >
              Net<span style={{ color: "var(--purple-light)" }}>Watch</span>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Home Lab
            </div>
          </div>
        </div>
      </div>

      {/* Connection status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          borderRadius: 8,
          background: connected ? "var(--green-soft)" : "var(--red-soft)",
          border: `1px solid ${connected ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: connected ? "var(--green)" : "var(--red)",
            boxShadow: connected
              ? "0 0 6px var(--green)"
              : "0 0 6px var(--red)",
            animation: connected ? "pulse 2s infinite" : "none",
          }}
        />
        <span
          style={{
            fontSize: 10,
            color: connected ? "var(--green)" : "var(--red)",
            fontWeight: 500,
          }}
        >
          {connected ? "Live" : "Connecting..."}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background:
                page === item.id ? "var(--purple-soft)" : "transparent",
              color:
                page === item.id
                  ? "var(--purple-light)"
                  : "var(--text-secondary)",
              fontSize: 13,
              fontWeight: page === item.id ? 600 : 400,
              marginBottom: 2,
              textAlign: "left",
              transition: "all 0.2s",
              borderLeft:
                page === item.id
                  ? "2px solid var(--purple-light)"
                  : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          color: "var(--text-secondary)",
          fontSize: 12,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.2s",
        }}
      >
        {theme === "dark" ? "☀️" : "🌙"}{" "}
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        button:hover { opacity: 0.85; }
      `}</style>
    </aside>
  );
}
