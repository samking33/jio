import React from "react";
import "./AnalyticsWorkspace.css";

const KPI_DATA = [
  { label: "Opportunity Pipeline", value: "$48.2M", delta: "+6.4%" },
  { label: "Win Probability", value: "68%", delta: "+2.1%" },
  { label: "Qualification Score", value: "84", delta: "+4 pts" },
  { label: "Revenue Forecast", value: "$21.6M", delta: "+9.0%" },
];

const PIPELINE_BARS = [
  { stage: "Lead", pct: 82 },
  { stage: "Qualified", pct: 71 },
  { stage: "Proposal", pct: 58 },
  { stage: "Review", pct: 46 },
  { stage: "Negotiation", pct: 29 },
];

const WIN_CURVE = [18, 26, 34, 39, 52, 61, 68, 73];

export default function AnalyticsWorkspace() {
  return (
    <div className="analytics">
      <header className="analytics__header">
        <div>
          <h2>Analytics Command Center</h2>
          <p>Opportunity pipeline, scoring, trends and forecast signals</p>
        </div>
        <div className="analytics__controls">
          <button type="button">Time Range: 30d</button>
          <button type="button">Export</button>
        </div>
      </header>

      <section className="analytics__kpis">
        {KPI_DATA.map((kpi) => (
          <article key={kpi.label} className="analytics__kpi">
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <em>{kpi.delta}</em>
          </article>
        ))}
      </section>

      <section className="analytics__grid">
        <article className="analytics__panel">
          <h3>Opportunity Pipeline</h3>
          <div className="analytics__bars">
            {PIPELINE_BARS.map((bar) => (
              <div key={bar.stage} className="analytics__bar-row">
                <span>{bar.stage}</span>
                <div className="analytics__bar-track">
                  <div style={{ width: `${bar.pct}%` }} />
                </div>
                <strong>{bar.pct}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics__panel">
          <h3>Win Probability Curve</h3>
          <svg viewBox="0 0 360 180" className="analytics__linechart" aria-hidden="true">
            <polyline
              points={WIN_CURVE.map((v, i) => `${i * 50 + 10},${170 - v * 2}`).join(" ")}
              fill="none"
              stroke="#6f7dff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {WIN_CURVE.map((v, i) => (
              <circle key={`${i}-${v}`} cx={i * 50 + 10} cy={170 - v * 2} r="4" fill="#41c59b" />
            ))}
          </svg>
        </article>

        <article className="analytics__panel">
          <h3>Sector Trend Analytics</h3>
          <ul className="analytics__list">
            <li><span>Public Sector IT</span><strong>+12%</strong></li>
            <li><span>Healthcare Data Systems</span><strong>+8%</strong></li>
            <li><span>Defense Infrastructure</span><strong>+10%</strong></li>
            <li><span>Gov Cloud Security</span><strong>+15%</strong></li>
          </ul>
        </article>

        <article className="analytics__panel">
          <h3>Qualification Scoring</h3>
          <ul className="analytics__list">
            <li><span>Technical Fit</span><strong>89</strong></li>
            <li><span>Compliance</span><strong>92</strong></li>
            <li><span>Pricing Confidence</span><strong>76</strong></li>
            <li><span>Delivery Readiness</span><strong>81</strong></li>
          </ul>
        </article>
      </section>
    </div>
  );
}

