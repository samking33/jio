import React from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Database, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import { formatMoney, formatPercent, useLiveMetrics } from "../../../hooks/useLiveMetrics";
import "./AnalyticsWorkspace.css";

function ratio(part, total) {
  const numerator = Number(part) || 0;
  const denominator = Number(total) || 0;
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

function chartPoints(values) {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const last = Math.max(values.length - 1, 1);
  return values
    .map((value, index) => {
      const x = 10 + (index / last) * 340;
      const y = 160 - (value / max) * 130;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function AnalyticsWorkspace() {
  const { metrics, derived, loading, error, refresh } = useLiveMetrics();
  const detected = metrics.listings_detected_total || 0;
  const passed = metrics.listings_passed_total || 0;
  const discarded = metrics.listings_discarded_total || 0;
  const reviewed = (metrics.reviews_approved || 0) + (metrics.reviews_rejected || 0);

  const kpis = [
    { label: "Pipeline Value", value: derived.pipelineValueLabel, detail: "Stored contract value", icon: TrendingUp },
    { label: "Stored RFPs", value: derived.totalRfps, detail: `${derived.activeRfps} active records`, icon: Database },
    { label: "Rule Pass Rate", value: formatPercent(derived.rulePassRate / 100), detail: `${passed} passed filters`, icon: CheckCircle2 },
    { label: "High Risks", value: metrics.risks_high || 0, detail: `${metrics.risks_total || 0} total risk records`, icon: AlertTriangle },
  ];

  const funnel = [
    { stage: "Detected", value: detected, pct: detected ? 100 : 0 },
    { stage: "Passed Filters", value: passed, pct: ratio(passed, detected) },
    { stage: "Stored RFPs", value: derived.totalRfps, pct: ratio(derived.totalRfps, detected) },
    { stage: "Reviewed", value: reviewed, pct: ratio(reviewed, derived.totalRfps) },
    { stage: "Approved", value: derived.approvedRfps, pct: ratio(derived.approvedRfps, reviewed) },
  ];

  const chartValues = (metrics.latest_crawl_runs || [])
    .slice()
    .reverse()
    .map((run) => Number(run.listings_passed || 0));
  const trendPoints = chartPoints(chartValues);

  const qualityRows = [
    { label: "Average Confidence", value: derived.avgConfidenceLabel },
    { label: "Review Closure", value: `${derived.reviewClosureRate}%` },
    { label: "Approved Reviews", value: metrics.reviews_approved || 0 },
    { label: "Rejected Reviews", value: metrics.reviews_rejected || 0 },
  ];

  return (
    <div className="analytics">
      <header className="analytics__header">
        <div>
          <h2>Analytics Command Center</h2>
          <p>Live pipeline metrics from PostgreSQL, refreshed from the backend service.</p>
        </div>
        <button type="button" className="analytics__refresh" onClick={refresh} disabled={loading}>
          <RefreshCw size={15} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="analytics__notice" role="alert">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      <section className="analytics__kpis">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="analytics__kpi">
              <div className="analytics__kpi-icon"><Icon size={17} /></div>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <em>{kpi.detail}</em>
            </article>
          );
        })}
      </section>

      <section className="analytics__grid">
        <article className="analytics__panel">
          <div className="analytics__panel-title">
            <h3>Opportunity Funnel</h3>
            <span>{formatMoney(metrics.contract_value_total || 0)}</span>
          </div>
          <div className="analytics__bars">
            {funnel.map((bar) => (
              <div key={bar.stage} className="analytics__bar-row">
                <span>{bar.stage}</span>
                <div className="analytics__bar-track" aria-hidden="true">
                  <div style={{ width: `${bar.pct}%` }} />
                </div>
                <strong>{bar.value}</strong>
                <em>{bar.pct}%</em>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics__panel">
          <div className="analytics__panel-title">
            <h3>Crawl Trend</h3>
            <span>{metrics.crawl_runs_total || 0} runs</span>
          </div>
          {trendPoints ? (
            <svg viewBox="0 0 360 180" className="analytics__linechart" aria-hidden="true">
              <polyline points={trendPoints} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {chartValues.map((value, index) => {
                const max = Math.max(...chartValues, 1);
                const last = Math.max(chartValues.length - 1, 1);
                const x = 10 + (index / last) * 340;
                const y = 160 - (value / max) * 130;
                return <circle key={`${index}-${value}`} cx={x} cy={y} r="4" fill="#0f766e" />;
              })}
            </svg>
          ) : (
            <div className="analytics__empty">No live crawl runs recorded yet.</div>
          )}
        </article>

        <article className="analytics__panel">
          <div className="analytics__panel-title">
            <h3>Source Health</h3>
            <ShieldCheck size={16} />
          </div>
          <ul className="analytics__list">
            <li><span>Active Sources</span><strong>{metrics.sources_active || 0}</strong></li>
            <li><span>Total Sources</span><strong>{metrics.sources_total || 0}</strong></li>
            <li><span>Crawl Errors</span><strong>{metrics.crawl_errors_total || 0}</strong></li>
            <li><span>Discarded Listings</span><strong>{discarded}</strong></li>
          </ul>
        </article>

        <article className="analytics__panel">
          <div className="analytics__panel-title">
            <h3>Review Quality</h3>
            <BarChart3 size={16} />
          </div>
          <ul className="analytics__list">
            {qualityRows.map((row) => (
              <li key={row.label}><span>{row.label}</span><strong>{row.value}</strong></li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
