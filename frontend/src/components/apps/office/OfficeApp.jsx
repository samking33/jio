import React from "react";
import { formatMoney, useLiveMetrics } from "../../../hooks/useLiveMetrics";
import "./OfficeApp.css";

const APP_META = {
  word: { title: "Proposal Narrative", cta: "Refresh" },
  excel: { title: "Contract Value Ledger", cta: "Refresh" },
  powerpoint: { title: "Capture Review Brief", cta: "Refresh" },
  outlook: { title: "Audit Event Inbox", cta: "Refresh" },
  onenote: { title: "Risk & Review Notes", cta: "Refresh" },
};

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
}

function LiveRows({ appId, metrics, derived }) {
  if (appId === "outlook") {
    const logs = metrics.latest_audit_logs || [];
    return (
      <div className="office-app__table">
        <div className="office-app__row office-app__row--head">
          <span>Action</span>
          <span>Detail</span>
          <span>Time</span>
        </div>
        {logs.length === 0 ? (
          <div className="office-app__empty">No audit events are stored yet.</div>
        ) : logs.map((log) => (
          <div className="office-app__row" key={log.log_id}>
            <span>{log.action_type || "Event"}</span>
            <span>{log.action_detail || `RFP ${log.rfp_id}`}</span>
            <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "No time"}</span>
          </div>
        ))}
      </div>
    );
  }

  const rfps = metrics.latest_rfps || [];
  return (
    <div className="office-app__table">
      <div className="office-app__row office-app__row--head">
        <span>RFP</span>
        <span>Status</span>
        <span>Value</span>
      </div>
      {rfps.length === 0 ? (
        <div className="office-app__empty">No RFP records are stored yet.</div>
      ) : rfps.map((rfp) => (
        <div className="office-app__row" key={rfp.rfp_id}>
          <span>{rfp.title || `RFP ${rfp.rfp_id}`}</span>
          <span>{rfp.status || "No status"}</span>
          <span>{formatMoney(rfp.contract_value || 0)}</span>
        </div>
      ))}
      <div className="office-app__summary">
        <span>Active records</span>
        <strong>{derived.activeRfps}</strong>
        <span>Latest deadline</span>
        <strong>{formatDate(rfps[0]?.submission_deadline)}</strong>
      </div>
    </div>
  );
}

export default function OfficeApp({ appId, appLabel }) {
  const meta = APP_META[appId] ?? APP_META.word;
  const { metrics, derived, loading, refresh } = useLiveMetrics();

  return (
    <div className="office-app">
      <header className="office-app__header">
        <div>
          <h2>{appLabel}</h2>
          <p>{meta.title}</p>
        </div>
        <button type="button" className="office-app__cta" onClick={refresh}>
          {loading ? "Refreshing" : meta.cta}
        </button>
      </header>

      <div className="office-app__tabs">
        <span>Live Data</span>
        <span>RFP Records</span>
        <span>Audit Trail</span>
        <span>Review State</span>
      </div>

      <div className="office-app__canvas">
        <div className="office-app__sheet">
          <div className="office-app__sheet-title">PostgreSQL-backed workspace</div>
          <LiveRows appId={appId} metrics={metrics} derived={derived} />
        </div>
      </div>
    </div>
  );
}
