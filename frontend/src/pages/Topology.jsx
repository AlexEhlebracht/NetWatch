import { useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

function getAnimationDuration(latency) {
  if (!latency) return "1s";
  if (latency < 0.5) return "0.4s";
  if (latency < 1) return "0.6s";
  if (latency < 5) return "1s";
  return "2s";
}

const RouterNode = ({ data }) => (
  <div
    style={{
      background: data.online ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.1)",
      border: `2px solid ${data.online ? "rgba(59,130,246,0.5)" : "rgba(239,68,68,0.4)"}`,
      borderRadius: 12,
      padding: "12px 16px",
      minWidth: 140,
      textAlign: "center",
      cursor: "default",
    }}
  >
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ background: "#a855f7", border: "none", width: 8, height: 8 }}
    />
    <div style={{ fontSize: 24, marginBottom: 4 }}>🌐</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e8f0" }}>
      {data.name}
    </div>
    <div style={{ fontSize: 10, color: "#7777aa", fontFamily: "monospace" }}>
      {data.ip}
    </div>
    {data.latency && (
      <div style={{ fontSize: 10, color: "#60a5fa", marginTop: 4 }}>
        {data.latency}ms
      </div>
    )}
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        margin: "6px auto 0",
        background: data.online ? "#10b981" : "#ef4444",
        boxShadow: data.online ? "0 0 6px #10b981" : "0 0 6px #ef4444",
      }}
    />
  </div>
);

const SwitchNode = ({ data }) => (
  <div
    style={{
      background: data.online ? "rgba(147,51,234,0.15)" : "rgba(239,68,68,0.1)",
      border: `2px solid ${data.online ? "rgba(147,51,234,0.5)" : "rgba(239,68,68,0.4)"}`,
      borderRadius: 12,
      padding: "12px 16px",
      minWidth: 140,
      textAlign: "center",
      cursor: "default",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{ background: "#a855f7", border: "none", width: 8, height: 8 }}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ background: "#a855f7", border: "none", width: 8, height: 8 }}
    />
    <div style={{ fontSize: 24, marginBottom: 4 }}>🔀</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e8f0" }}>
      {data.name}
    </div>
    <div style={{ fontSize: 10, color: "#7777aa", fontFamily: "monospace" }}>
      {data.ip}
    </div>
    {data.latency && (
      <div style={{ fontSize: 10, color: "#a855f7", marginTop: 4 }}>
        {data.latency}ms
      </div>
    )}
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        margin: "6px auto 0",
        background: data.online ? "#10b981" : "#ef4444",
        boxShadow: data.online ? "0 0 6px #10b981" : "0 0 6px #ef4444",
      }}
    />
  </div>
);

const ServerNode = ({ data }) => (
  <div
    style={{
      background: data.online ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.1)",
      border: `2px solid ${data.online ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.4)"}`,
      borderRadius: 12,
      padding: "12px 16px",
      minWidth: 140,
      textAlign: "center",
      cursor: "default",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{ background: "#f59e0b", border: "none", width: 8, height: 8 }}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ background: "#f59e0b", border: "none", width: 8, height: 8 }}
    />
    <div style={{ fontSize: 24, marginBottom: 4 }}>🖥️</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e8f0" }}>
      {data.name}
    </div>
    <div style={{ fontSize: 10, color: "#7777aa", fontFamily: "monospace" }}>
      {data.ip}
    </div>
    {data.latency && (
      <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>
        {data.latency}ms
      </div>
    )}
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        margin: "6px auto 0",
        background: data.online ? "#10b981" : "#ef4444",
        boxShadow: data.online ? "0 0 6px #10b981" : "0 0 6px #ef4444",
      }}
    />
  </div>
);

const DeviceNode = ({ data }) => (
  <div
    style={{
      background: data.online
        ? "rgba(16,185,129,0.08)"
        : "rgba(239,68,68,0.08)",
      border: `1px solid ${data.online ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
      borderRadius: 10,
      padding: "10px 14px",
      minWidth: 130,
      textAlign: "center",
      cursor: "default",
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{ background: "#10b981", border: "none", width: 6, height: 6 }}
    />
    <div style={{ fontSize: 20, marginBottom: 3 }}>💻</div>
    <div style={{ fontSize: 11, fontWeight: 600, color: "#e8e8f0" }}>
      {data.name}
    </div>
    <div style={{ fontSize: 9, color: "#7777aa", fontFamily: "monospace" }}>
      {data.ip}
    </div>
    {data.latency && (
      <div
        style={{
          fontSize: 10,
          color: data.online ? "#10b981" : "#ef4444",
          marginTop: 3,
        }}
      >
        {data.online ? `${data.latency}ms` : "offline"}
      </div>
    )}
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        margin: "5px auto 0",
        background: data.online ? "#10b981" : "#ef4444",
        boxShadow: data.online ? "0 0 5px #10b981" : "0 0 5px #ef4444",
      }}
    />
  </div>
);

const GroupNode = ({ data }) => (
  <div
    style={{
      background: "rgba(245,158,11,0.04)",
      border: "1px dashed rgba(245,158,11,0.3)",
      borderRadius: 16,
      width: data.width,
      height: data.height,
      pointerEvents: "none",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -22,
        left: 12,
        fontSize: 10,
        fontWeight: 600,
        color: "#f59e0b",
        letterSpacing: 2,
        textTransform: "uppercase",
        padding: "0 6px",
      }}
    >
      {data.label}
    </div>
  </div>
);

const nodeTypes = {
  router: RouterNode,
  switch: SwitchNode,
  server: ServerNode,
  device: DeviceNode,
  group: GroupNode,
};

function buildGraph(devices) {
  const router = devices.find((d) => d.type === "router");
  const switchDev = devices.find((d) => d.type === "switch");
  const server = devices.find((d) => d.type === "server");
  const vms = devices.filter((d) => d.type === "vm");
  const nodes = [];
  const edges = [];
  const centerX = 350;

  if (router)
    nodes.push({
      id: router.ip,
      type: "router",
      position: { x: centerX, y: 0 },
      data: {
        name: router.name,
        ip: router.ip,
        latency: router.latency,
        online: router.is_online,
      },
    });

  if (switchDev) {
    nodes.push({
      id: switchDev.ip,
      type: "switch",
      position: { x: centerX, y: 180 },
      data: {
        name: switchDev.name,
        ip: switchDev.ip,
        latency: switchDev.latency,
        online: switchDev.is_online,
      },
    });
    if (router)
      edges.push({
        id: `${router.ip}-${switchDev.ip}`,
        source: router.ip,
        target: switchDev.ip,
        label: "ethernet",
        labelStyle: { fontSize: 9, fill: "#7777aa", fontFamily: "monospace" },
        labelBgStyle: { fill: "#080812", fillOpacity: 0.9 },
        labelBgPadding: [3, 6],
        labelBgBorderRadius: 4,
        style: {
          stroke: switchDev.is_online ? "#a855f7" : "#ef4444",
          strokeWidth: 2,
        },
        animated: switchDev.is_online === true,
      });
  }

  if (server) {
    nodes.push({
      id: server.ip,
      type: "server",
      position: { x: centerX, y: 360 },
      data: {
        name: server.name,
        ip: server.ip,
        latency: server.latency,
        online: server.is_online,
      },
    });
    const parent = switchDev || router;
    if (parent)
      edges.push({
        id: `${parent.ip}-${server.ip}`,
        source: parent.ip,
        target: server.ip,
        label: "ethernet",
        labelStyle: { fontSize: 9, fill: "#7777aa", fontFamily: "monospace" },
        labelBgStyle: { fill: "#080812", fillOpacity: 0.9 },
        labelBgPadding: [3, 6],
        labelBgBorderRadius: 4,
        style: {
          stroke: server.is_online ? "#f59e0b" : "#ef4444",
          strokeWidth: 2,
        },
        animated: server.is_online === true,
      });

    const vmSpacing = 200;
    const totalWidth = (vms.length - 1) * vmSpacing;
    const startX = centerX - totalWidth / 2;
    const groupPad = 40;
    const groupWidth = (vms.length - 1) * vmSpacing + 140 + groupPad * 2;
    const groupX = startX - groupPad;

    nodes.unshift({
      id: "vm-group",
      type: "group",
      position: { x: groupX, y: 545 },
      data: {
        label: "Proxmox Hypervisor",
        width: groupWidth,
        height: 132,
      },
      zIndex: -1,
      selectable: false,
      draggable: false,
    });

    vms.forEach((vm, i) => {
      nodes.push({
        id: vm.ip,
        type: "device",
        position: { x: startX + i * vmSpacing, y: 560 },
        data: {
          name: vm.name,
          ip: vm.ip,
          latency: vm.latency,
          online: vm.is_online,
        },
      });
      edges.push({
        id: `${server.ip}-${vm.ip}`,
        source: server.ip,
        target: vm.ip,
        label: "virtual",
        labelStyle: { fontSize: 9, fill: "#7777aa", fontFamily: "monospace" },
        labelBgStyle: { fill: "#080812", fillOpacity: 0.9 },
        labelBgPadding: [3, 6],
        labelBgBorderRadius: 4,
        style: {
          stroke: vm.is_online ? "#10b981" : "#ef4444",
          strokeWidth: 1.5,
          strokeDasharray: vm.is_online ? "none" : "5,5",
        },
        animated: vm.is_online === true,
      });
    });
  }

  return { nodes, edges };
}

export default function Topology({ wsData }) {
  const devices = wsData?.devices || [];

  const { nodes: computedNodes, edges: computedEdges } = useMemo(
    () => buildGraph(devices),
    [
      JSON.stringify(
        devices.map((d) => ({
          ip: d.ip,
          is_online: d.is_online,
          latency: d.latency,
        })),
      ),
    ],
  );

  const [nodes, , onNodesChange] = useNodesState(computedNodes);
  const [edges, , onEdgesChange] = useEdgesState(computedEdges);

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
          Network Topology
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Live network map · ethernet vs virtual · updates every 5 seconds
        </div>
      </div>

      <div
        style={{
          height: 720,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <ReactFlow
          nodes={computedNodes}
          edges={computedEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(147,51,234,0.08)" gap={24} size={1} />
        </ReactFlow>
      </div>

      <div
        style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}
      >
        {[
          { color: "#10b981", label: "Online" },
          { color: "#ef4444", label: "Offline" },
          { color: "#a855f7", label: "Physical ethernet" },
          { color: "#10b981", label: "Virtual connection" },
          { color: "#f59e0b", label: "Proxmox hypervisor boundary" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
              }}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
