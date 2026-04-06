export default function StatCard({ label, value, sub, color }) {
  const colors = {
    purple: {
      text: "var(--purple-light)",
      bg: "var(--purple-soft)",
      border: "rgba(147,51,234,0.2)",
    },
    pink: {
      text: "var(--pink-light)",
      bg: "var(--pink-soft)",
      border: "rgba(236,72,153,0.2)",
    },
    blue: {
      text: "var(--blue-light)",
      bg: "var(--blue-soft)",
      border: "rgba(59,130,246,0.2)",
    },
    green: {
      text: "var(--green)",
      bg: "var(--green-soft)",
      border: "rgba(16,185,129,0.2)",
    },
  };
  const c = colors[color] || colors.purple;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${c.text}, transparent)`,
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
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: c.text,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}
