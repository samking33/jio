/**
 * RfpDecisionPage — Decision screen
 * Approve / reject workflow per RFP, persisted to the backend via:
 *   PATCH /rfps/:id          → sets status to "approved" or "rejected"
 *   POST  /rfps/:id/reviews  → records the HIL review entry
 */
import React, { useState } from "react";
import { useRFPs } from "../../../../../hooks/useRFPs";
import api from "../../../../../api/api";
import "./RfpDecisionPage.css";

const MOCK_RFPS = [
  {
    id: 1,
    rfpId: null,
    title: "Federal Cloud Migration Initiative",
    agency: "Department of Defense",
    deadline: "2026-05-15",
    budget: "$2.5M – $3.2M",
    confidence: 92,
    description: "Comprehensive cloud infrastructure migration for defense systems, including secure data transfer, compliance implementation, and staff training.",
    requirements: ["Active Secret clearance for all team members", "AWS Solutions Architect certification required", "Minimum 5 years cloud migration experience", "NIST 800-53 compliance expertise"],
    deliverables: ["Fully migrated cloud infrastructure", "Security compliance documentation", "Staff training materials and sessions", "90-day post-migration support"],
    matchScore: { technical: 95, experience: 90, certifications: 88, resources: 85 },
  },
  {
    id: 2,
    rfpId: null,
    title: "Municipal IoT Infrastructure",
    agency: "City Public Works",
    deadline: "2026-05-10",
    budget: "$800K – $1.1M",
    confidence: 78,
    description: "Design and deploy IoT sensor network for city-wide infrastructure monitoring including traffic, utilities, and environmental systems.",
    requirements: ["IoT platform development experience", "Smart city project portfolio", "Real-time data processing expertise", "Mobile app development capability"],
    deliverables: ["IoT sensor network deployment", "Central monitoring platform", "Mobile applications for city staff", "12-month warranty and support"],
    matchScore: { technical: 82, experience: 75, certifications: 70, resources: 85 },
  },
];

export default function RfpDecisionPage({ navigate }) {
  const { rfps, refresh } = useRFPs();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [decisions,  setDecisions]  = useState({});
  const [notes,      setNotes]      = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const items = rfps.length > 0
    ? rfps.map((r, i) => {
        const j = r.output_json || {};
        return {
          id: r.rfp_id ?? i + 1,
          rfpId: r.rfp_id ?? null,
          title: j.title || r.title || r.rfp_id || `RFP ${i + 1}`,
          agency: j.client || r.agency || "Unknown Agency",
          deadline: j.deadline || r.submission_deadline || "—",
          budget: j.budget || (r.contract_value != null ? `$${r.contract_value}` : "—"),
          confidence: typeof j.score === "number" ? j.score : 75,
          description: j.summary || "No summary available.",
          requirements: j.requirements || ["See full document for requirements"],
          deliverables: j.deliverables || ["See full document for deliverables"],
          matchScore: {
            technical:      Math.min(100, (j.score || 75) + 5),
            experience:     Math.max(0,   (j.score || 75) - 8),
            certifications: Math.min(100, (j.score || 75) + 12),
            resources:      Math.max(0,   (j.score || 75) - 4),
          },
        };
      })
    : MOCK_RFPS;

  const current      = items[currentIdx];
  const totalDecided = Object.keys(decisions).length;

  const handleDecision = async (d) => {
    setSaveError(null);

    if (current.rfpId != null) {
      setSaving(true);
      const newStatus = d === "approve" ? "approved" : "rejected";

      const [statusRes, reviewRes] = await Promise.all([
        api.updateRfp(current.rfpId, { status: newStatus }),
        api.createRfpReview(current.rfpId, {
          reviewer_name:  "human",
          review_status:  newStatus,
          corrections:    notes[current.id] || null,
        }),
      ]);

      setSaving(false);

      if (statusRes.error || reviewRes.error) {
        setSaveError(statusRes.error || reviewRes.error);
        return;
      }

      await refresh();
    }

    setDecisions((prev) => ({ ...prev, [current.id]: d }));
    if (currentIdx < items.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowSummary(true);
    }
  };

  if (showSummary) {
    const approved = Object.values(decisions).filter((d) => d === "approve").length;
    const rejected = Object.values(decisions).filter((d) => d === "reject").length;
    return (
      <div className="rfp-dec rfp-fade-up">
        <div className="rfp-dec__summary">
          <div className="rfp-dec__summary-icon">🎉</div>
          <h2 className="rfp-dec__summary-title">Review Complete</h2>
          <p style={{ textAlign: "center", color: "var(--rfp-text-secondary)", marginTop: 8 }}>
            You've reviewed all {items.length} pending RFPs
          </p>
          <div className="rfp-dec__summary-stats">
            <div className="rfp-dec__summary-stat rfp-dec__summary-stat--green">
              <div className="rfp-dec__summary-stat-val">{approved}</div>
              <div className="rfp-dec__summary-stat-label">Approved</div>
            </div>
            <div className="rfp-dec__summary-stat rfp-dec__summary-stat--red">
              <div className="rfp-dec__summary-stat-val">{rejected}</div>
              <div className="rfp-dec__summary-stat-label">Rejected</div>
            </div>
          </div>
          <div className="rfp-dec__summary-actions">
            <button
              className="rfp-fig-btn rfp-fig-btn--outline"
              onClick={() => { setShowSummary(false); setCurrentIdx(0); setDecisions({}); }}
            >
              Start Over
            </button>
            <button className="rfp-fig-btn rfp-fig-btn--primary" onClick={() => navigate("overview")}>
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfp-dec rfp-fade-up">
      {/* Header */}
      <div className="rfp-dec__header rfp-fade-up rfp-fade-up--1">
        <div>
          <h2 className="rfp-dec__title">Decision</h2>
          <p className="rfp-dec__sub">Reviewing {currentIdx + 1} of {items.length} pending RFPs</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {currentIdx > 0 && (
            <button className="rfp-fig-btn rfp-fig-btn--outline" onClick={() => setCurrentIdx(currentIdx - 1)}>
              ← Previous
            </button>
          )}
          <button className="rfp-fig-btn rfp-fig-btn--ghost" onClick={() => navigate("analysis")}>
            ← Back to Analysis
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="rfp-dec__progress rfp-fade-up rfp-fade-up--2">
        <div className="rfp-dec__progress-header">
          <span className="rfp-dec__progress-label">Progress</span>
          <span className="rfp-dec__progress-count">{totalDecided} / {items.length} reviewed</span>
        </div>
        <div className="rfp-dec__progress-bar">
          <div className="rfp-dec__progress-fill" style={{ width: `${(totalDecided / items.length) * 100}%` }} />
        </div>
        <div className="rfp-dec__progress-dots">
          {items.map((item, i) => (
            <button
              key={item.id}
              className={`rfp-dec__progress-dot ${
                i === currentIdx ? "current"
                : decisions[item.id] === "approve" ? "approved"
                : decisions[item.id] === "reject" ? "rejected"
                : ""
              }`}
              onClick={() => setCurrentIdx(i)}
              title={item.title}
            />
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="rfp-fade-up rfp-fade-up--3">
        <div className="rfp-dec__rfp-card">
          <div className="rfp-dec__rfp-header">
            <div>
              <h3 className="rfp-dec__rfp-title">{current.title}</h3>
              <div className="rfp-dec__rfp-meta">
                <span className="rfp-dec__meta-item">📅 {current.deadline}</span>
                <span className="rfp-dec__meta-item">🏛 {current.agency}</span>
                <span className="rfp-dec__meta-item">💰 {current.budget}</span>
              </div>
            </div>
            <div>
              <div className="rfp-dec__confidence" style={{
                color:      current.confidence >= 75 ? "var(--rfp-green-text)"  : current.confidence >= 50 ? "var(--rfp-amber-text)" : "var(--rfp-red-text)",
                background: current.confidence >= 75 ? "var(--rfp-green-pale)" : current.confidence >= 50 ? "var(--rfp-amber-pale)" : "var(--rfp-red-light)",
              }}>
                {current.confidence}%
              </div>
              <div className="rfp-dec__confidence-label">Confidence</div>
            </div>
          </div>

          <p className="rfp-dec__description">{current.description}</p>

          <div className="rfp-dec__cols">
            <div>
              <h4 className="rfp-dec__col-title">Requirements</h4>
              <ul className="rfp-dec__col-list">
                {current.requirements.map((r, i) => (
                  <li key={i} className="rfp-dec__col-item"><span className="rfp-dec__col-dot" />{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="rfp-dec__col-title">Deliverables</h4>
              <ul className="rfp-dec__col-list">
                {current.deliverables.map((d, i) => (
                  <li key={i} className="rfp-dec__col-item"><span className="rfp-dec__col-dot rfp-dec__col-dot--green" />{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rfp-dec__match-scores">
            {Object.entries(current.matchScore).map(([key, val]) => (
              <div key={key} className="rfp-dec__match-score">
                <div className="rfp-dec__match-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div className="rfp-dec__match-bar"><div className="rfp-dec__match-fill" style={{ width: `${val}%` }} /></div>
                <div className="rfp-dec__match-val">{val}%</div>
              </div>
            ))}
          </div>

          <div className="rfp-dec__notes-wrap">
            <label className="rfp-dec__notes-label">Notes (optional)</label>
            <textarea
              className="rfp-fig-input rfp-dec__notes"
              placeholder="Add notes or justification for your decision…"
              value={notes[current.id] || ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [current.id]: e.target.value }))}
              rows={2}
            />
          </div>

          {saveError && (
            <div className="rfp-disc__result error" style={{ marginBottom: 12 }}>
              <span>⚠️</span>
              <div className="rfp-disc__result-msg">Save failed: {saveError}</div>
            </div>
          )}

          <div className="rfp-dec__actions">
            <button
              className="rfp-dec__btn-reject"
              onClick={() => handleDecision("reject")}
              disabled={saving}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {saving ? "Saving…" : "Reject"}
            </button>
            <button
              className="rfp-dec__btn-defer"
              onClick={() => setCurrentIdx(Math.min(currentIdx + 1, items.length - 1))}
              disabled={saving}
            >
              Skip for Now
            </button>
            <button
              className="rfp-dec__btn-approve"
              onClick={() => handleDecision("approve")}
              disabled={saving}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {saving ? "Saving…" : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
