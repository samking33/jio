/**
 * RfpAnalysisPage - Analysis screen
 * Shows live RFPs with AI analysis scores.
 */
import React, { useEffect, useMemo, useState } from "react";
import api from "../../../../../api/api";
import { useRFPs } from "../../../../../hooks/useRFPs";
import "./RfpAnalysisPage.css";

const ARROW_RIGHT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CAPABILITY_DEFAULTS = [
  { name: "Technical", value: 0, color: "#10b981" },
  { name: "Experience", value: 0, color: "#3b82f6" },
  { name: "Resources", value: 0, color: "#8b5cf6" },
  { name: "Timeline", value: 0, color: "#f59e0b" },
];

function scoreFromItem(item) {
  const raw = Number(item.confidence);
  return Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
}

export default function RfpAnalysisPage({ navigate }) {
  const { rfps, loading, error } = useRFPs();
  const [expanded, setExpanded] = useState(null);
  const [detailsByRfpId, setDetailsByRfpId] = useState({});

  const analysisItems = useMemo(() => (
    rfps.map((r, i) => {
      const output = r.output_json || {};
      const score = Number.isFinite(Number(r.score)) ? Number(r.score) : 0;

      return {
        id: r.rfp_id || i + 1,
        rfpId: r.rfp_id,
        rfpTitle: r.title || output.title || `RFP ${i + 1}`,
        confidence: score,
        tasks: Array.isArray(output.tasks) ? output.tasks : [],
        skills: Array.isArray(output.skills) ? output.skills : [],
        certifications: Array.isArray(output.certifications) ? output.certifications : [],
        risks: Array.isArray(output.risks) ? output.risks : [],
      };
    })
  ), [rfps]);

  useEffect(() => {
    if (!analysisItems.length) {
      setExpanded(null);
      return;
    }
    setExpanded((prev) => (prev == null ? analysisItems[0].id : prev));
  }, [analysisItems]);

  useEffect(() => {
    const selected = analysisItems.find((item) => item.id === expanded);
    if (!selected?.rfpId || detailsByRfpId[selected.rfpId]) return;

    let cancelled = false;

    async function loadDetails() {
      const [tasksRes, certsRes, risksRes, eligibilityRes] = await Promise.all([
        api.getRfpTasks(selected.rfpId),
        api.getRfpCertifications(selected.rfpId),
        api.getRfpRisks(selected.rfpId),
        api.getRfpEligibility(selected.rfpId),
      ]);

      if (cancelled) return;

      setDetailsByRfpId((prev) => ({
        ...prev,
        [selected.rfpId]: {
          tasks: Array.isArray(tasksRes.data) ? tasksRes.data : [],
          certifications: Array.isArray(certsRes.data) ? certsRes.data : [],
          risks: Array.isArray(risksRes.data) ? risksRes.data : [],
          eligibility: eligibilityRes.data || {},
        },
      }));
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [analysisItems, expanded, detailsByRfpId]);

  const capabilityData = useMemo(() => {
    if (!analysisItems.length) return CAPABILITY_DEFAULTS;

    const scores = analysisItems.map(scoreFromItem);
    const avg = Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length);

    return [
      { name: "Technical", value: avg, color: "#10b981" },
      { name: "Experience", value: Math.max(0, avg - 5), color: "#3b82f6" },
      { name: "Resources", value: Math.max(0, avg - 8), color: "#8b5cf6" },
      { name: "Timeline", value: Math.max(0, avg - 12), color: "#f59e0b" },
    ];
  }, [analysisItems]);

  return (
    <div className="rfp-ana rfp-fade-up">
      <div className="rfp-ana__header rfp-fade-up rfp-fade-up--1">
        <div>
          <h2 className="rfp-ana__title">Analysis</h2>
          <p className="rfp-ana__sub">AI-powered insights and eligibility assessment</p>
        </div>
        <div className="rfp-ana__header-actions">
          <button className="rfp-fig-btn rfp-fig-btn--outline" onClick={() => navigate("discovery")}>? Back</button>
          <button className="rfp-fig-btn rfp-fig-btn--primary" onClick={() => navigate("decision")}>
            Continue to Decision {ARROW_RIGHT}
          </button>
        </div>
      </div>

      <div className="rfp-ana__chart-card rfp-fade-up rfp-fade-up--2">
        <h3 className="rfp-ana__chart-title">Capability Assessment</h3>
        <div className="rfp-ana__bars">
          {capabilityData.map((d) => (
            <div key={d.name} className="rfp-ana__bar-row">
              <div className="rfp-ana__bar-label">{d.name}</div>
              <div className="rfp-ana__bar-track">
                <div className="rfp-ana__bar-fill" style={{ width: `${d.value}%`, background: d.color }} />
              </div>
              <div className="rfp-ana__bar-val">{d.value}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rfp-ana__list rfp-fade-up rfp-fade-up--3">
        {loading && rfps.length === 0 && (
          <div className="rfp-ana__loading"><span className="rfp-spinner" /> Loading analysis data...</div>
        )}

        {!loading && error && rfps.length === 0 && (
          <div className="rfp-ana__loading">Unable to load analysis: {error}</div>
        )}

        {!loading && !error && analysisItems.length === 0 && (
          <div className="rfp-ana__loading">No RFP records available for analysis.</div>
        )}

        {analysisItems.map((item) => (
          <AnalysisCard
            key={item.id}
            item={item}
            details={detailsByRfpId[item.rfpId]}
            expanded={expanded === item.id}
            onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function mapSkills(item, details) {
  if (item.skills.length) return item.skills;

  const taskCount = details?.tasks?.length || 0;
  const base = Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0;

  return [
    { name: "Technical Fit", match: Math.min(100, base) },
    { name: "Past Performance", match: Math.max(0, base - 10) },
    { name: "Compliance", match: Math.max(0, base - 8) },
    { name: "Delivery Capacity", match: taskCount ? Math.min(100, base + 4) : Math.max(0, base - 15) },
  ];
}

function mapTasks(item, details) {
  if (item.tasks.length) return item.tasks;
  if (!details?.tasks?.length) return [];
  return details.tasks.map((t) => t.task_name || t.description).filter(Boolean);
}

function mapCertifications(item, details) {
  if (item.certifications.length) return item.certifications;
  if (!details?.certifications?.length) return [];
  return details.certifications.map((c) => c.cert_name).filter(Boolean);
}

function mapRisks(item, details) {
  if (item.risks.length) return item.risks;
  if (!details?.risks?.length) return [];

  return details.risks.map((r) => {
    const severity = String(r.severity || "medium").toLowerCase();
    return {
      level: severity === "high" ? "High" : severity === "low" ? "Low" : "Medium",
      description: r.description || r.risk_name || "Risk detail unavailable",
      type: severity === "high" ? "danger" : severity === "low" ? "success" : "warning",
    };
  });
}

function eligibilityLabel(score, details) {
  const apiStatus = details?.eligibility?.eligibility_status;
  if (apiStatus) return String(apiStatus);
  if (score >= 75) return "Eligible";
  if (score >= 50) return "Review Required";
  return "At Risk";
}

function AnalysisCard({ item, details, expanded, onToggle }) {
  const score = Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0;
  const skills = mapSkills(item, details);
  const tasks = mapTasks(item, details);
  const certifications = mapCertifications(item, details);
  const risks = mapRisks(item, details);
  const eligibility = eligibilityLabel(score, details);

  const scoreColor = score >= 75 ? "var(--rfp-green)" : score >= 50 ? "var(--rfp-amber)" : "var(--rfp-red)";
  const eligBadge = eligibility.toLowerCase().includes("eligible") ? "green" : eligibility.toLowerCase().includes("risk") ? "rose" : "amber";

  const circumference = 2 * Math.PI * 28;
  const dash = (score / 100) * circumference;

  return (
    <div className={`rfp-ana__card ${expanded ? "expanded" : ""}`}>
      <button className="rfp-ana__card-header" onClick={onToggle}>
        <div className="rfp-ana__card-left">
          <div className="rfp-ana__card-score">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="var(--rfp-surface)" strokeWidth="5" />
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke={scoreColor}
                strokeWidth="5"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
            </svg>
            <span className="rfp-ana__score-num" style={{ color: scoreColor }}>{score}</span>
          </div>
          <div>
            <h3 className="rfp-ana__card-title">{item.rfpTitle}</h3>
            <div className="rfp-ana__card-meta">
              <span className={`rfp-badge rfp-badge--${eligBadge}`}>{eligibility}</span>
              <span className="rfp-ana__card-tasks">{tasks.length} tasks identified</span>
            </div>
          </div>
        </div>
        <div className={`rfp-ana__card-chevron ${expanded ? "open" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4.5 7l4.5 4.5L13.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="rfp-ana__card-body">
          <div className="rfp-ana__card-grid">
            <div>
              <h4 className="rfp-ana__section-title">Skill Match</h4>
              <div className="rfp-ana__skill-list">
                {skills.map((s) => (
                  <div key={s.name} className="rfp-ana__skill-row">
                    <span className="rfp-ana__skill-name">{s.name}</span>
                    <div className="rfp-ana__skill-bar">
                      <div
                        className="rfp-ana__skill-fill"
                        style={{
                          width: `${s.match}%`,
                          background: s.match >= 75 ? "var(--rfp-green)" : s.match >= 50 ? "var(--rfp-amber)" : "var(--rfp-red)",
                        }}
                      />
                    </div>
                    <span className="rfp-ana__skill-val">{s.match}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="rfp-ana__section-title">Risk Factors</h4>
              <div className="rfp-ana__risks">
                {risks.length === 0 && <div className="rfp-ana__risk rfp-ana__risk--warning">No risk entries available.</div>}
                {risks.map((r, i) => (
                  <div key={i} className={`rfp-ana__risk rfp-ana__risk--${r.type}`}>
                    <span className="rfp-ana__risk-icon">{r.type === "success" ? "?" : r.type === "danger" ? "?" : "!"}</span>
                    <div>
                      <div className="rfp-ana__risk-level">{r.level} Risk</div>
                      <div className="rfp-ana__risk-desc">{r.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="rfp-ana__section-title">Identified Tasks</h4>
              <ul className="rfp-ana__tasks">
                {tasks.length === 0 && <li className="rfp-ana__task-item">No task entries available.</li>}
                {tasks.map((t, i) => (
                  <li key={i} className="rfp-ana__task-item">
                    <span className="rfp-ana__task-dot" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {certifications.length > 0 && (
              <div>
                <h4 className="rfp-ana__section-title">Required Certifications</h4>
                <div className="rfp-ana__certs">
                  {certifications.map((c) => (
                    <span key={c} className="rfp-badge rfp-badge--blue">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}