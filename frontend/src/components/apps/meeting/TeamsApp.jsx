import React, { useMemo } from "react";
import { RefreshCw, X } from "lucide-react";
import { useWindows } from "../../../context/WindowContext";
import { useLiveMetrics } from "../../../hooks/useLiveMetrics";
import "./TeamsApp.css";

export default function TeamsApp() {
  const { windows, closeWindow } = useWindows();
  const { metrics, derived, loading, refresh } = useLiveMetrics();

  const meetingWindowId = useMemo(() => {
    const win = windows.find((item) => item.appId === "meeting");
    return win?.id ?? null;
  }, [windows]);

  const latestRfps = metrics.latest_rfps || [];
  const latestAudit = metrics.latest_audit_logs || [];

  const handleClose = () => {
    if (meetingWindowId) {
      closeWindow(meetingWindowId);
    }
  };

  return (
    <div className="teams-app">
      <header className="teams-app__topbar">
        <div>
          <h2>Live Operations Standup</h2>
          <p>{loading ? "Loading backend state" : "PostgreSQL metrics and audit activity"}</p>
        </div>
        <div className="teams-app__actions">
          <button type="button" onClick={refresh}><RefreshCw size={15} /> Refresh</button>
          <button type="button" onClick={handleClose}><X size={15} /> Close</button>
        </div>
      </header>

      <main className="teams-app__main">
        <section className="teams-app__metrics" aria-label="Live metrics">
          <article>
            <span>Stored RFPs</span>
            <strong>{derived.totalRfps}</strong>
          </article>
          <article>
            <span>Active Sources</span>
            <strong>{metrics.sources_active || 0}</strong>
          </article>
          <article>
            <span>Reviews</span>
            <strong>{metrics.reviews_total || 0}</strong>
          </article>
        </section>

        <section className="teams-app__columns">
          <article className="teams-app__panel">
            <h3>Latest RFP Records</h3>
            {latestRfps.length === 0 ? (
              <div className="teams-app__empty">No RFP records are stored yet.</div>
            ) : latestRfps.map((rfp) => (
              <div className="teams-app__row" key={rfp.rfp_id}>
                <strong>{rfp.title || `RFP ${rfp.rfp_id}`}</strong>
                <span>{rfp.status || "No status"}</span>
              </div>
            ))}
          </article>

          <article className="teams-app__panel">
            <h3>Audit Activity</h3>
            {latestAudit.length === 0 ? (
              <div className="teams-app__empty">No audit events are stored yet.</div>
            ) : latestAudit.map((item) => (
              <div className="teams-app__row" key={item.log_id}>
                <strong>{item.action_type || "Event"}</strong>
                <span>{item.action_detail || `RFP ${item.rfp_id}`}</span>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}
