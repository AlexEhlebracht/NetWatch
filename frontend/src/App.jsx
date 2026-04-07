import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Services from "./pages/Services";
import ProxmoxPage from "./pages/ProxmoxPage";
import Alerts from "./pages/Alerts";
import Topology from "./pages/Topology";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [wsData, setWsData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const WS_PROTOCOL = window.location.protocol === "https:" ? "wss:" : "ws:";
    const WS_URL = `${WS_PROTOCOL}//${window.location.host}/ws`;
    let ws;
    let reconnectTimer;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        console.log("NetWatch connected");
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setWsData(data);
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const pages = {
    dashboard: Dashboard,
    devices: Devices,
    services: Services,
    proxmox: ProxmoxPage,
    alerts: Alerts,
    topology: Topology,
  };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        page={page}
        setPage={setPage}
        theme={theme}
        setTheme={setTheme}
        connected={connected}
      />
      <main
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-width)",
          padding: "28px",
          overflowY: "auto",
          minHeight: "100vh",
        }}
      >
        <PageComponent wsData={wsData} />
      </main>
    </div>
  );
}
