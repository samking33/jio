import React from "react";
import { useLiveMetrics } from "../../hooks/useLiveMetrics";
import "./Dashboard.css";

function MetricCard({ title, value, detail, tone = "blue" }) {
  return (
    <article className={`dashboard-card dashboard-card--${tone}`}>
      <div className="dashboard-card__top">
        <span>{title}</span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function Dashboard() {
  const { metrics, derived, loading, error } = useLiveMetrics();
  const latest = metrics.latest_rfps || [];

  return (
    <main className="dashboard" aria-label="RFP Discovery Intelligence">
      <header className="dashboard__head">
        <div>
          <h2>RFP Discovery Intelligence</h2>
        </div>
        <span className={`dashboard__status ${error ? "dashboard__status--error" : ""}`}>
          {loading ? "Loading" : error ? "API issue" : "Live data"}
        </span>
      </header>

      <section className="dashboard__grid">
        <MetricCard title="Stored RFPs" value={derived.totalRfps} detail={`${derived.activeRfps} active records`} tone="blue" />
        <MetricCard title="Rule Pass Rate" value={`${derived.rulePassRate}%`} detail={`${metrics.listings_passed_total || 0} passed of ${metrics.listings_detected_total || 0} detected`} tone="green" />
        <MetricCard title="Avg Confidence" value={derived.avgConfidenceLabel} detail={`${metrics.tasks_total || 0} task records`} tone="indigo" />
        <MetricCard title="HIL Decisions" value={metrics.reviews_total || 0} detail={`${metrics.reviews_approved || 0} approved, ${metrics.reviews_rejected || 0} rejected`} tone="amber" />
        <MetricCard title="Active Sources" value={metrics.sources_active || 0} detail={`${metrics.sources_total || 0} configured sources`} tone="teal" />
        <MetricCard title="High Risks" value={metrics.risks_high || 0} detail={`${metrics.risks_total || 0} risks recorded`} tone="red" />
      </section>

      <section className="dashboard__panel">
        <div className="dashboard__panel-head">
          <h3>Latest RFP Records</h3>
          <span>{latest.length} shown</span>
        </div>
        {latest.length === 0 ? (
          <div className="dashboard__empty">No RFP records are stored yet. Run a crawl to populate this view.</div>
        ) : (
          <div className="dashboard__list">
            {latest.map((rfp) => (
              <article key={rfp.rfp_id} className="dashboard__rfp-row">
                <div>
                  <strong>{rfp.title || `RFP ${rfp.rfp_id}`}</strong>
                  <span>{rfp.industry || "Unclassified source"} · {rfp.status || "No status"}</span>
                </div>
                <a href={rfp.listing_url} target="_blank" rel="noreferrer">Source</a>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
