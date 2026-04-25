/**
 * StatusBar
 * ─────────
 * Thin top bar showing:  OS label | active window title | clock
 */

import React, { useState, useEffect } from "react";
import { useWindows }        from "../../context/WindowContext";
import { getApp }            from "../../store/appRegistry";
import { useBackendStatus }  from "../../hooks/useBackendStatus";
import "./StatusBar.css";

export default function StatusBar() {
  const { windows, activeWindowId } = useWindows();
  const backendStatus = useBackendStatus();
  const [time, setTime] = useState(new Date());

  // Tick the clock every second
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeWindow = windows.find(w => w.id === activeWindowId);
  const activeApp    = activeWindow ? getApp(activeWindow.appId) : null;

  const formatted = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr   = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="status-bar">
      <span className="status-bar__brand">RFP·OS</span>

      <span className="status-bar__active-app">
        {activeApp ? `${activeApp.icon}  ${activeApp.label}` : "—"}
      </span>

      <div className="status-bar__right">
        {/* Backend connectivity indicator */}
        <span
          className={`status-bar__backend status-bar__backend--${backendStatus}`}
          title={`Backend: ${backendStatus}`}
        >
          <span className="status-bar__backend-dot" />
          API
        </span>
        <span className="status-bar__date">{dateStr}</span>
        <span className="status-bar__time">{formatted}</span>
      </div>
    </div>
  );
}
