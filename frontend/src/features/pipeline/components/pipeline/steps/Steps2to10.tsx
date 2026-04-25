/**
 * Steps 2–10  (all remaining pipeline steps)
 * Each follows the same pattern:
 *   1. StepCard wrapper (handles Run/Next button)
 *   2. Call matching API service function inside runStep()
 *   3. Display results when available
 */

import React, { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Award,
  X, Check, Edit3, ChevronLeft, ChevronRight,
  Calendar, DollarSign, Building2, FileText, ThumbsUp, ThumbsDown, Download,
} from "lucide-react";
import { T } from "../../../utils/tokens";
import { Panel, PanelHd, Badge, Btn, ProgressBar, DonutScore } from "../../common/ui";
import { StepCard } from "../StepCard";
import { usePipeline } from "../../../hooks/usePipeline";
import type { FilterRule, AnalysisRfp, CertRegistryItem, HilRfp } from "../../../types/pipeline.types";

// ═══════════════════════════════════════════════════════════
// STEP 2 — Filter RFPs
// ═══════════════════════════════════════════════════════════
export function Step2Filter() {
  const { executeStep, goNext, state } = usePipeline();
  const [expanded, setExpanded] = useState<number | null>(null);
  const rules: FilterRule[] = state.pipelineData.filterResults?.rules ?? [];
  const totalPassed = state.pipelineData.filterResults?.totalPassed ?? 0;
  const totalFailed = state.pipelineData.filterResults?.totalFailed ?? 0;

  const handleRun = () => executeStep(2);

  return (
    <StepCard stepId={2} onRun={() => void handleRun()} onNext={goNext} runLabel="Run Rule Engine">
      {rules.length > 0 && (
        <Panel>
          <PanelHd title="Rule Engine Decision Log" icon="⚙️" right={<Badge variant="success">{totalPassed} passed all filters</Badge>} />
          <div>
            {rules.map((rule, i) => (
              <div key={i}>
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", textAlign: "left", fontFamily: "Poppins, sans-serif" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: T.textSm, width: 18 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: "0.72rem", fontWeight: 600, color: T.text }}>{rule.filter}</span>
                  <span style={{ fontSize: "0.62rem", color: T.textSm }}>{rule.time}</span>
                  <Badge variant="success">{rule.passed} passed</Badge>
                  {expanded === i ? <ChevronUp size={14} color={T.textSm} /> : <ChevronDown size={14} color={T.textSm} />}
                </button>
                {expanded === i && (
                  <div style={{ padding: "10px 14px 12px 38px", background: "#FAFBFD" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 8, fontSize: "0.7rem" }}>
                      <div>Input: <strong>{rule.input}</strong></div>
                      <div style={{ color: T.success }}>Passed: <strong>{rule.passed}</strong></div>
                      <div style={{ color: T.danger }}>Failed: <strong>{rule.failed}</strong></div>
                    </div>
                    <ProgressBar value={Math.round((rule.passed / rule.input) * 100)} color={T.success} />
                    <div style={{ fontSize: "0.6rem", color: T.textSm, marginTop: 4 }}>{Math.round((rule.passed / rule.input) * 100)}% pass rate</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", background: T.successBg, borderTop: `1px solid #bbf7d0`, display: "flex", gap: 14 }}>
            <div><span style={{ fontSize: "0.6rem", color: T.textSm }}>Final pass: </span><strong style={{ color: T.success }}>{totalPassed} RFPs</strong></div>
            <div><span style={{ fontSize: "0.6rem", color: T.textSm }}>Discarded: </span><strong style={{ color: T.danger }}>{totalFailed} RFPs</strong></div>
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 3 — Download Documents
// ═══════════════════════════════════════════════════════════
export function Step3Download() {
  const { executeStep, goNext, state } = usePipeline();
  const result = state.pipelineData.downloadResults ?? null;
  const filteredCount = state.pipelineData.filterResults?.totalPassed ?? 0;

  const handleRun = () => executeStep(3);

  return (
    <StepCard stepId={3} onRun={() => void handleRun()} onNext={goNext} runLabel="Download Documents">
      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { label: "Downloaded",  val: result.downloaded,       color: T.success },
            { label: "Failed",      val: result.failed,           color: result.failed > 0 ? T.danger : T.success },
            { label: "Total Size",  val: `${result.totalSizeMb} MB`, color: T.primary },
            { label: "Indexed",     val: result.indexedDocuments, color: T.violet  },
          ].map(k => (
            <div key={k.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px", boxShadow: T.shadow }}>
              <div style={{ fontSize: "0.6rem", color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}
      {!result && (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📥</div>
            Ready to index {filteredCount} live RFP listing document(s) from the filtered set.<br />
            Documents will be indexed for AI extraction in the next step.
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 4 — Extract Tasks & Skills
// ═══════════════════════════════════════════════════════════
export function Step4Extract() {
  const { executeStep, goNext, state } = usePipeline();
  const [expanded, setExpanded] = useState<number | null>(null);
  const rfps: AnalysisRfp[] = state.pipelineData.extractResults?.rfps ?? [];
  const indexedCount = state.pipelineData.downloadResults?.indexedDocuments ?? 0;

  const handleRun = () => executeStep(4);

  return (
    <StepCard stepId={4} onRun={() => void handleRun()} onNext={goNext} runLabel="Run AI Extraction">
      {rfps.length > 0 && rfps.map(rfp => {
        const isExpanded = expanded === rfp.id;
        const eligColor = rfp.eligibility === "Eligible" ? T.success : rfp.eligibility === "At Risk" ? T.danger : T.warning;
        const eligBg    = rfp.eligibility === "Eligible" ? T.successBg : rfp.eligibility === "At Risk" ? T.dangerBg : T.warningBg;
        return (
          <Panel key={rfp.id}>
            <button onClick={() => setExpanded(isExpanded ? null : rfp.id)}
              style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "Poppins, sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <DonutScore value={rfp.confidence} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: T.text, marginBottom: 4 }}>{rfp.rfpTitle}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: "0.62rem", fontWeight: 700, background: eligBg, color: eligColor }}>{rfp.eligibility}</span>
                    <span style={{ fontSize: "0.66rem", color: T.textSm }}>{rfp.tasks.length} tasks · {rfp.skills.length} skills</span>
                  </div>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isExpanded && (
              <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.78rem", marginBottom: 8 }}>Tasks</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {rfp.tasks.map((task, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "5px 8px", background: "#F8FAFC", borderRadius: 7, fontSize: "0.68rem" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.primary, marginTop: 5, flexShrink: 0 }} />{task}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.78rem", marginBottom: 8 }}>Skills Breakdown</div>
                  {rfp.skills.map((skill, si) => (
                    <div key={si} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.72rem" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontWeight: 600 }}>{skill.name}</span>
                          <Badge variant="neutral">{skill.level}</Badge>
                          <Badge variant={skill.priority === "Critical" ? "danger" : skill.priority === "High" ? "warning" : "neutral"}>{skill.priority}</Badge>
                        </div>
                        <span style={{ fontWeight: 700 }}>{skill.match}%</span>
                      </div>
                      <ProgressBar value={skill.match} color={skill.match >= 70 ? T.success : skill.match >= 50 ? T.warning : T.danger} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        );
      })}
      {rfps.length === 0 && (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🤖</div>
            Extraction will derive tasks, skills, and confidence scores from {indexedCount} live indexed document(s).
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 5 — Identify Certifications
// ═══════════════════════════════════════════════════════════
export function Step5Certs() {
  const { executeStep, goNext, state } = usePipeline();
  const [search, setSearch]  = useState("");
  const certs: CertRegistryItem[] = state.pipelineData.certResults?.registry ?? [];
  const flagged = state.pipelineData.certResults?.flagged ?? [];

  const handleRun = () => executeStep(5);

  const filtered = certs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <StepCard stepId={5} onRun={() => void handleRun()} onNext={goNext} runLabel="Map Certifications">
      {certs.length > 0 ? (
        <Panel>
          <PanelHd title="Certification Registry" icon="🪪"
            right={
              <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                  style={{ border: "none", background: "transparent", fontSize: "0.68rem", outline: "none", width: 130, fontFamily: "Poppins, sans-serif" }} />
              </div>
            }
          />
          <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {filtered.map((cert, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 8, border: `1px solid ${cert.known ? T.border : "#fcd34d"}`, background: cert.known ? T.bg : "#fef3c7" }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, marginBottom: 3 }}>{cert.name}</div>
                <div style={{ fontSize: "0.6rem", color: T.textSm, marginBottom: 6 }}>Seen in <strong>{cert.freq}</strong> RFPs</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Badge variant={cert.known ? "success" : "warning"}>{cert.known ? "Known" : "⚑ Unknown"}</Badge>
                  {!cert.known && (
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: flagged.includes(cert.name) ? T.warning : T.textSm }}>
                      {flagged.includes(cert.name) ? "Flagged" : "Tracked"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {flagged.length > 0 && (
            <div style={{ padding: "8px 14px", background: T.warningBg, borderTop: `1px solid #fcd34d`, fontSize: "0.68rem", color: T.warning, fontWeight: 600 }}>
              ⚑ {flagged.length} unknown certification(s) flagged for review: {flagged.join(", ")}
            </div>
          )}
        </Panel>
      ) : (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🪪</div>
            Will scan all RFPs for required certifications and map against known registry.
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 6 — Assess Risk & Eligibility
// ═══════════════════════════════════════════════════════════
export function Step6Risk() {
  const { executeStep, goNext, state } = usePipeline();
  const rfps: AnalysisRfp[] = state.pipelineData.riskResults?.rfps ?? [];

  const handleRun = () => executeStep(6);

  return (
    <StepCard stepId={6} onRun={() => void handleRun()} onNext={goNext} runLabel="Assess Risk">
      {rfps.length > 0 ? rfps.map(rfp => (
        <Panel key={rfp.id}>
          <PanelHd title={rfp.rfpTitle} icon={<DonutScore value={rfp.confidence} />}
            right={
              <Badge variant={rfp.eligibility === "Eligible" ? "success" : rfp.eligibility === "At Risk" ? "danger" : "warning"}>
                {rfp.eligibility}
              </Badge>
            }
          />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {rfp.risks.map((risk, i) => (
              <div key={i} style={{ padding: "8px 10px", borderRadius: 8, borderLeft: `4px solid ${risk.type === "success" ? T.success : risk.type === "warning" ? T.warning : T.danger}`, background: risk.type === "success" ? "#f0fdf4" : risk.type === "warning" ? "#fffbeb" : "#fef2f2", display: "flex", alignItems: "center", gap: 8 }}>
                {risk.type === "success" ? <CheckCircle2 size={14} color={T.success} /> : <AlertTriangle size={14} color={risk.type === "warning" ? T.warning : T.danger} />}
                <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: risk.type === "success" ? "#bbf7d0" : risk.type === "warning" ? "#fde68a" : "#fecaca", color: risk.type === "success" ? "#166534" : risk.type === "warning" ? "#92400e" : "#991b1b", marginRight: 4 }}>{risk.level} Risk</span>
                <span style={{ fontSize: "0.7rem" }}>{risk.description}</span>
              </div>
            ))}
            <div style={{ fontSize: "0.68rem", color: T.textMd, marginTop: 4 }}>📝 {rfp.eligibilityNotes}</div>
          </div>
        </Panel>
      )) : (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>⚠️</div>
            Will score risk and determine eligibility for each RFP.
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 7 — Convert to JSON
// ═══════════════════════════════════════════════════════════
export function Step7Convert() {
  const { executeStep, goNext, state } = usePipeline();
  const result = state.pipelineData.jsonOutput ?? null;

  const handleRun = () => executeStep(7);

  return (
    <StepCard stepId={7} onRun={() => void handleRun()} onNext={goNext} runLabel="Convert to JSON">
      {result ? (
        <Panel>
          <PanelHd title="JSON Export" icon="📄" right={<Badge variant="success">Export Ready</Badge>} />
          <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[{ label: "Records", val: result.recordCount, color: T.primary }, { label: "File Size", val: `${result.sizeKb} KB`, color: T.violet }, { label: "Exported At", val: new Date(result.exportedAt).toLocaleTimeString(), color: T.success }].map(k => (
              <div key={k.label} style={{ background: T.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "0.6rem", color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px 14px" }}>
            <Btn variant="secondary" size="xs"><Download size={12} /> Download JSON</Btn>
          </div>
        </Panel>
      ) : (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
            Will serialise all enriched RFP records into a structured JSON export.
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 8 — Human-in-Loop Review (interactive)
// ═══════════════════════════════════════════════════════════
export function Step8HIL() {
  const { executeStep, goNext, persistHilState, state } = usePipeline();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [decisions, setDecisions]   = useState<Record<number, "approve" | "reject">>({});
  const [notes, setNotes]           = useState<Record<number, string>>({});
  const [feedback, setFeedback]     = useState<Record<number, "correct" | "incorrect">>({});
  const hilResults = state.pipelineData.hilResults;
  const hilRFPs: HilRfp[] = hilResults?.pending ?? [];
  const loaded = hilRFPs.length > 0;

  React.useEffect(() => {
    if (hilResults) {
      setDecisions(hilResults.decisions || {});
      setNotes(hilResults.notes || {});
      setFeedback(hilResults.feedback || {});
    }
  }, [hilResults]);

  const handleRun = () => executeStep(8);

  const handleDecide = (decision: "approve" | "reject") => {
    const rfp = hilRFPs[currentIdx];
    if (!rfp) return;
    const nd = { ...decisions, [rfp.id]: decision };
    setDecisions(nd);
    void persistHilState({ decisions: nd, notes, feedback });
    if (currentIdx < hilRFPs.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const allDecided = hilResults?.allDecided || (hilRFPs.length > 0 && hilRFPs.every(r => decisions[r.id]));
  const rfp = hilRFPs[currentIdx];

  return (
    <StepCard stepId={8} onRun={() => void handleRun()} onNext={goNext} runLabel="Load HIL Queue">
      {!loaded && (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>👁️</div>
            RFPs requiring human approval will be presented for review before forwarding.
          </div>
        </Panel>
      )}
      {loaded && rfp && (
        <>
          {/* Progress pills */}
          <div style={{ display: "flex", gap: 6, marginBottom: 2, alignItems: "center" }}>
            {hilRFPs.map((r, i) => (
              <button key={r.id} onClick={() => setCurrentIdx(i)}
                style={{ flex: 1, height: 5, borderRadius: 99, cursor: "pointer", border: "none", background: i === currentIdx ? T.primary : decisions[r.id] === "approve" ? T.success : decisions[r.id] === "reject" ? T.danger : T.border }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {hilRFPs.map((r, i) => (
              <button key={r.id} onClick={() => setCurrentIdx(i)}
                style={{ flex: 1, padding: "3px 4px", borderRadius: 8, fontSize: "0.6rem", fontWeight: 700, cursor: "pointer", border: i === currentIdx ? `2px solid ${T.primary}` : "2px solid transparent", background: decisions[r.id] === "approve" ? T.successBg : decisions[r.id] === "reject" ? T.dangerBg : "#F1F5F9", color: decisions[r.id] === "approve" ? T.success : decisions[r.id] === "reject" ? T.danger : T.textMd, fontFamily: "Poppins, sans-serif" }}>
                {r.title.split(" ").slice(0, 2).join(" ")} {decisions[r.id] === "approve" ? "✓" : decisions[r.id] === "reject" ? "✗" : "·"}
              </button>
            ))}
          </div>

          {/* RFP Detail Card */}
          <Panel>
            <div style={{ padding: "18px 20px", background: "#f8fafc", color: T.text, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{rfp.title}</div>
                  <div style={{ display: "flex", gap: 14, fontSize: "0.68rem", color: T.textMd, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Building2 size={11} /> {rfp.agency}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Calendar size={11} /> Due {rfp.deadline}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><DollarSign size={11} /> {rfp.budget}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", marginLeft: 12 }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: T.primary }}>{rfp.confidence}%</div>
                  <div style={{ fontSize: "0.62rem", color: T.textSm }}>Confidence</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: "0.72rem", color: T.textMd, lineHeight: 1.6 }}>{rfp.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.72rem", marginBottom: 6 }}>Skills Match</div>
                  {rfp.skills.map((sk, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>{sk.name}</span><span style={{ fontWeight: 800 }}>{sk.match}%</span>
                      </div>
                      <ProgressBar value={sk.match} color={sk.match >= 70 ? T.success : sk.match >= 50 ? T.warning : T.danger} />
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.72rem", marginBottom: 6 }}>Match Scores</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {Object.entries(rfp.matchScore).map(([k, v]) => (
                      <div key={k} style={{ textAlign: "center", background: T.bg, borderRadius: 8, padding: "6px" }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: v >= 80 ? T.success : v >= 60 ? T.warning : T.danger }}>{v}</div>
                        <div style={{ fontSize: "0.56rem", color: T.textSm, textTransform: "capitalize" }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Risks */}
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.72rem", marginBottom: 6 }}>Risk Summary</div>
                {rfp.risks.map((r, i) => (
                  <div key={i} style={{ padding: "6px 10px", borderRadius: 8, borderLeft: `4px solid ${r.type === "success" ? T.success : r.type === "warning" ? T.warning : T.danger}`, background: r.type === "success" ? "#f0fdf4" : r.type === "warning" ? "#fffbeb" : "#fef2f2", marginBottom: 4, display: "flex", alignItems: "center", gap: 6, fontSize: "0.68rem" }}>
                    {r.type === "success" ? <CheckCircle2 size={12} color={T.success} /> : <AlertTriangle size={12} color={r.type === "warning" ? T.warning : T.danger} />}
                    <span style={{ fontWeight: 700, marginRight: 4 }}>{r.level}</span> {r.desc}
                  </div>
                ))}
              </div>
              {/* Notes */}
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.72rem", marginBottom: 4 }}>Reviewer Notes</div>
                <textarea value={notes[rfp.id] || ""} onChange={e => {
                  const nextNotes = { ...notes, [rfp.id]: e.target.value };
                  setNotes(nextNotes);
                  void persistHilState({ decisions, notes: nextNotes, feedback });
                }}
                  placeholder="Add notes…" rows={2}
                  style={{ width: "100%", padding: "7px 10px", fontSize: "0.68rem", border: `1.5px solid ${T.border}`, borderRadius: 8, outline: "none", resize: "vertical", fontFamily: "Poppins, sans-serif" }} />
              </div>
              {/* AI feedback */}
              <div style={{ padding: "10px 12px", background: "#F8FAFC", border: `1px solid ${T.border}`, borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "0.68rem", marginBottom: 6 }}>Was AI recommendation correct?</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "0.68rem" }}>AI suggested: <strong>{rfp.confidence >= 70 ? "Approve" : "Review"}</strong></span>
                  {(["correct", "incorrect"] as const).map(val => (
                    <button key={val} onClick={() => {
                      const nextFeedback = { ...feedback, [rfp.id]: val };
                      setFeedback(nextFeedback);
                      void persistHilState({ decisions, notes, feedback: nextFeedback });
                    }}
                      style={{ padding: "3px 10px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700, cursor: "pointer", border: `1.5px solid ${feedback[rfp.id] === val ? (val === "correct" ? T.success : T.danger) : T.border}`, background: feedback[rfp.id] === val ? (val === "correct" ? T.success : T.danger) : "#fff", color: feedback[rfp.id] === val ? "#fff" : T.textMd, fontFamily: "Poppins, sans-serif" }}>
                      {val === "correct" ? "✓ Correct" : "✗ Incorrect"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Decision buttons */}
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                {decisions[rfp.id] ? (
                  <div style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 700, background: decisions[rfp.id] === "approve" ? T.successBg : T.dangerBg, color: decisions[rfp.id] === "approve" ? T.success : T.danger, display: "flex", alignItems: "center", gap: 6 }}>
                    {decisions[rfp.id] === "approve" ? <Check size={16} /> : <X size={16} />}
                    Decision recorded: {decisions[rfp.id] === "approve" ? "Approved" : "Rejected"}
                    {allDecided && <span style={{ marginLeft: "auto", fontSize: "0.68rem" }}>All reviewed — click "Next Step" above ↑</span>}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => handleDecide("reject")} style={{ flex: 1, padding: "10px", background: T.dangerBg, color: T.danger, border: `2px solid #fca5a5`, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 700, fontSize: "0.78rem", fontFamily: "Poppins, sans-serif" }}>
                      <X size={16} /> Reject
                    </button>
                    <button onClick={() => handleDecide("approve")} style={{ flex: 1, padding: "10px", background: T.success, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 700, fontSize: "0.78rem", fontFamily: "Poppins, sans-serif" }}>
                      <Check size={16} /> Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 9 — Forward Approved RFPs
// ═══════════════════════════════════════════════════════════
export function Step9Forward() {
  const { executeStep, goNext, state } = usePipeline();
  const result = state.pipelineData.forwardResults ?? null;

  const decisions = state.pipelineData.hilResults?.decisions ?? {};

  const handleRun = () => executeStep(9);

  return (
    <StepCard stepId={9} onRun={() => void handleRun()} onNext={goNext} runLabel="Forward Approved RFPs">
      {result ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { label: "Forwarded",  val: result.forwarded,      color: T.success },
            { label: "Rejected",   val: result.rejected,       color: T.danger  },
            { label: "Est. Value", val: result.estimatedValue, color: T.warning },
          ].map(k => (
            <div key={k.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px", boxShadow: T.shadow }}>
              <div style={{ fontSize: "0.6rem", color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>
      ) : (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📤</div>
            Approved RFPs will be forwarded to the CRM / proposal team.
          </div>
        </Panel>
      )}
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 10 — Log & Feedback Loop
// ═══════════════════════════════════════════════════════════
export function Step10Log() {
  const { executeStep, goNext, state } = usePipeline();
  const entries = state.pipelineData.logResults?.entries ?? [];
  const accuracy = state.pipelineData.logResults?.accuracy ?? null;
  const improvement = state.pipelineData.logResults?.improvementPct ?? 0;

  const handleRun = () => executeStep(10);

  return (
    <StepCard stepId={10} onRun={() => void handleRun()} onNext={goNext} runLabel="Log Pipeline">
      {entries.length > 0 && (
        <>
          {accuracy !== null && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              <div style={{ background: "#f5f0fd", borderRadius: 12, padding: "14px 16px", border: "1px solid #e9d5ff" }}>
                <div style={{ fontSize: "0.6rem", color: T.textSm, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>AI Accuracy</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: T.primary }}>{accuracy}%</div>
              </div>
              <div style={{ background: T.successBg, borderRadius: 12, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "0.6rem", color: T.textSm, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>Improvement</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: T.success }}>{improvement}%</div>
              </div>
            </div>
          )}
          <Panel>
            <PanelHd title="Pipeline Audit Log" icon="📋" />
            <div style={{ padding: "4px 14px 12px" }}>
              {entries.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: i < entries.length - 1 ? `1px solid #F1F5F9` : "none" }}>
                  <span style={{ fontSize: "0.6rem", fontFamily: "monospace", color: T.textSm, width: 40, flexShrink: 0 }}>{log.time}</span>
                  <span style={{ fontSize: "0.78rem" }}>{log.type === "success" ? "✅" : log.type === "error" ? "❌" : "⚠️"}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, flex: 1 }}>{log.event}</span>
                  <span style={{ fontSize: "0.62rem", color: T.textSm }}>{log.detail}</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
      {entries.length === 0 && (
        <Panel>
          <div style={{ padding: "24px 20px", textAlign: "center", color: T.textSm, fontSize: "0.78rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
            Final step — creates a full audit trail and submits feedback to improve the AI model.
          </div>
        </Panel>
      )}
    </StepCard>
  );
}
