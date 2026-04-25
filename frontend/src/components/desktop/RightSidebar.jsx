import React from "react";
import { useWindows } from "../../context/WindowContext";
import { getApp } from "../../store/appRegistry";
import { useLiveMetrics } from "../../hooks/useLiveMetrics";
import "./RightSidebar.css";

export default function RightSidebar() {
  const { openWindow } = useWindows();
  const { metrics, loading } = useLiveMetrics();
  const rfpApp = getApp("rfp-dashboard");
  const audit = metrics.latest_audit_logs || [];

  const openRfpDashboard = () => {
    if (!rfpApp) return;
    openWindow(rfpApp.id, rfpApp.label, { size: rfpApp.defaultSize });
  };

  return (
    <aside className="right-sidebar" aria-label="Live Operations Feed">
      <header className="right-sidebar__head">
        <h3>Operations Feed</h3>
        <p>Latest audit events from PostgreSQL</p>
      </header>

      <div className="right-sidebar__list">
        {loading && <div className="right-sidebar__empty">Loading live feed...</div>}
        {!loading && audit.length === 0 && (
          <div className="right-sidebar__empty">No audit events yet.</div>
        )}

        {audit.map((item) => (
          <article key={item.log_id} className="meeting-invite">
            <div className="meeting-invite__top">
              <span className="meeting-invite__status">{item.action_type || "event"}</span>
              <span className="meeting-invite__time">
                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>
            <h4>{item.action_detail || `RFP ${item.rfp_id}`}</h4>
            <div className="meeting-invite__actions">
              <button type="button" className="meeting-invite__btn meeting-invite__btn--join" onClick={openRfpDashboard}>
                Open RFPs
              </button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
