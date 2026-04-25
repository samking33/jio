/**
 * RfpOverviewPage — Figma Overview screen
 * Shows live KPIs from useRFPs + static charts (Recharts).
 */
import React from "react";
import { useRFPs } from "../../../../../hooks/useRFPs";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import "./RfpOverviewPage.css";

// ── Static chart data ─────────────────────────────────────────────────────────

const WIN_RATE_DATA = [
  { week: "W1", rate: 58 }, { week: "W2", rate: 62 }, { week: "W3", rate: 59 },
  { week: "W4", rate: 65 }, { week: "W5", rate: 61 }, { week: "W6", rate: 68 },
  { week: "W7", rate: 71 }, { week: "W8", rate: 68 },
];

const PIPELINE_DATA = [
  { stage: "Ingest",    count: 24 }, { stage: "Parse",  count: 22 },
  { stage: "Analyze",  count: 19 }, { stage: "Score",  count: 17 },
  { stage: "Decision", count: 14 },
];

// ── SVG icons ─────────────────────────────────────────────────────────────────

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3.75 9h10.5M9.75 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CLOCK = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="#f59e0b" strokeWidth="1.5"/>
    <path d="M9 5.5V9l2.5 2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TREND = (color) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 12l5-5 3 3 6-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CHECK = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="#059669" strokeWidth="1.5"/>
    <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ALERT = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2L16.5 15H1.5L9 2z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 7.5v3M9 12.5v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function RfpOverviewPage({ navigate }) {
  const { rfps, loading, kpis, pipeline } = useRFPs();

  const kpiCards = [
    { label: "Total RFPs",       value: loading ? "…" : String(kpis.total),    change: "+12%", icon: TREND("#3b82f6"), color: "blue"   },
    { label: "Pass Rate",        value: "68%",                                  change: "+5%",  icon: CHECK,           color: "green"  },
    { label: "Avg. Confidence",  value: loading ? "…" : `${kpis.avgScore}%`,   change: "+2%",  icon: TREND("#8b5cf6"), color: "purple" },
    { label: "Pending Reviews",  value: "14",                                   change: "3 urgent", icon: ALERT,       color: "amber"  },
  ];

  const recentActivity = [
    pipeline.result && {
      rfp:        "Pipeline Run",
      status:     pipeline.result.status === "success" ? "Approved" : "Failed",
      time:       "just now",
      confidence: pipeline.result.sources_count ? pipeline.result.sources_count * 10 : 80,
    },
    ...rfps.slice(0, 4).map((r, i) => ({
      rfp:        r.rfp_id || `RFP-${i + 1}`,
      status:     (r.output_json?.score >= 70) ? "Approved" : (r.output_json?.score >= 50) ? "Pending" : "Rejected",
      time:       r.created_at ? new Date(r.created_at).toLocaleDateString() : `${i + 1} hours ago`,
      confidence: r.output_json?.score ?? 70 - i * 5,
    })),
  ].filter(Boolean).slice(0, 4);

  const fallbackActivity = [
    { rfp: "Federal Cloud Migration Initiative", status: "Approved", time: "2 hours ago", confidence: 92 },
    { rfp: "State Healthcare Data Platform",     status: "Rejected", time: "4 hours ago", confidence: 45 },
    { rfp: "Municipal IoT Infrastructure",       status: "Pending",  time: "6 hours ago", confidence: 78 },
    { rfp: "Defense Communication Systems",      status: "Approved", time: "1 day ago",   confidence: 89 },
  ];

  const activity = recentActivity.length >= 2 ? recentActivity : fallbackActivity;

  return (
    <div className="rfp-ov rfp-fade-up">
      {/* Hero */}
      <div className="rfp-ov__hero rfp-fade-up rfp-fade-up--1">
        <h1 className="rfp-ov__hero-h1">RFP Discovery</h1>
        <p className="rfp-ov__hero-sub">
          Intelligent pipeline for opportunity analysis and decision support
        </p>
      </div>

      {/* KPI Grid */}
      <div className="rfp-ov__kpis rfp-fade-up rfp-fade-up--2">
        {kpiCards.map((k, i) => (
          <div key={k.label} className="rfp-ov__kpi-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="rfp-ov__kpi-top">
              {k.icon}
              <span className="rfp-ov__kpi-change">{k.change}</span>
            </div>
            <div className="rfp-ov__kpi-value">{k.value}</div>
            <div className="rfp-ov__kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="rfp-ov__charts rfp-fade-up rfp-fade-up--3">
        {/* Win rate area chart */}
        <div className="rfp-ov__chart-card">
          <div className="rfp-ov__chart-title">Win Rate Trend</div>
          <div className="rfp-ov__chart-sub">Last 8 weeks (%)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={WIN_RATE_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="rfpWinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[50, 80]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v) => [`${v}%`, "Win Rate"]}
              />
              <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} fill="url(#rfpWinGrad)" dot={{ r: 3, fill: "#8b5cf6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline bar chart */}
        <div className="rfp-ov__chart-card">
          <div className="rfp-ov__chart-title">Pipeline Throughput</div>
          <div className="rfp-ov__chart-sub">RFPs per stage (current cycle)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PIPELINE_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v) => [v, "RFPs"]}
              />
              <Bar dataKey="count" fill="#0f1629" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CTA row */}
      <div className="rfp-ov__ctas rfp-fade-up rfp-fade-up--4">
        <div className="rfp-ov__cta rfp-ov__cta--dark">
          <div>
            <h2 className="rfp-ov__cta-title">Continue Pipeline</h2>
            <p className="rfp-ov__cta-sub">Resume the automated discovery and analysis workflow</p>
          </div>
          <button className="rfp-ov__cta-btn rfp-ov__cta-btn--light" onClick={() => navigate("discovery")}>
            <span>Start Discovery</span>
            {ARROW}
          </button>
        </div>

        <div className="rfp-ov__cta rfp-ov__cta--amber">
          <div>
            <div className="rfp-ov__cta-icon-row">
              {CLOCK}
              <h2 className="rfp-ov__cta-title" style={{ color: "var(--rfp-text-primary)" }}>Pending Review</h2>
            </div>
            <p className="rfp-ov__cta-sub" style={{ color: "var(--rfp-text-secondary)" }}>
              14 RFPs require human validation before proceeding
            </p>
          </div>
          <button className="rfp-ov__cta-btn rfp-ov__cta-btn--amber" onClick={() => navigate("decision")}>
            <span>Review Now</span>
            {ARROW}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rfp-ov__activity rfp-fade-up rfp-fade-up--5">
        <h2 className="rfp-ov__activity-title">Recent Activity</h2>
        <div className="rfp-ov__activity-list">
          {activity.map((a, i) => (
            <div key={i} className="rfp-ov__activity-row">
              <div>
                <h3 className="rfp-ov__activity-name">{a.rfp}</h3>
                <p className="rfp-ov__activity-time">{a.time}</p>
              </div>
              <div className="rfp-ov__activity-meta">
                <div className="rfp-ov__activity-conf">
                  <div className="rfp-ov__activity-conf-label">Confidence</div>
                  <div className="rfp-ov__activity-conf-val">{a.confidence}%</div>
                </div>
                <span className={`rfp-badge rfp-badge--${a.status === "Approved" ? "green" : a.status === "Rejected" ? "rose" : "amber"}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
