/**
 * Dashboard.tsx — Root page component
 *
 * Renders:
 *  - Sticky operational header
 *  - Sticky pipeline-aware navbar (stage tabs + search)
 *  - PipelineShell (step progress tracker)
 *  - StepContainer (active step content)
 */

import React from "react";
import { Bell, Search, Settings } from "lucide-react";
import { T, STAGE_COLORS } from "../utils/tokens";
import { StepProgress }   from "../components/pipeline/StepProgress";
import { StepContainer }  from "../components/pipeline/StepContainer";
import { usePipeline }    from "../hooks/usePipeline";

export function Dashboard({ standalone = true }: { standalone?: boolean }) {
  const {
    state, STAGE_GROUPS, isPipelineStarted, isPipelineDone,
    completedCount, totalSteps, error, isHydrating,
  } = usePipeline();
  const { currentStepId } = state;
  const data = state.pipelineData;
  const reviewed = Object.keys(data.hilResults?.decisions ?? {}).length;
  const auditEntries = data.logResults?.entries?.length ?? 0;
  const miniCounts = [
    { label: "Detected", val: data.crawlResults?.totalListings ?? 0 },
    { label: "Passed", val: data.filterResults?.totalPassed ?? 0 },
    { label: "Indexed", val: data.downloadResults?.indexedDocuments ?? 0 },
    { label: "Reviewed", val: reviewed },
  ];
  const liveBadges = [
    data.logResults?.accuracy != null ? { label: "Audit accuracy", value: `${data.logResults.accuracy}%` } : null,
    auditEntries ? { label: "Audit entries", value: auditEntries } : null,
  ].filter(Boolean) as { label: string; value: string | number }[];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.bg, minHeight: standalone ? "100vh" : "100%", height: standalone ? "auto" : "100%", overflow: "auto" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "#ffffff",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 22px", minHeight: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(15,23,42,.06)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: T.text, letterSpacing: 0 }}>
            RFP Discovery Operations Console
          </span>
          {isPipelineStarted && !isPipelineDone && (
            <span style={{ background: "#e8f2ff", color: "#1d4ed8", fontSize: "0.62rem", fontWeight: 800, padding: "3px 10px", borderRadius: 6 }}>
              Step {currentStepId} / {totalSteps}
            </span>
          )}
          {isPipelineDone && (
            <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.62rem", fontWeight: 800, padding: "3px 10px", borderRadius: 6 }}>
              Pipeline Complete
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#f8fafc", color: T.textMd, border: `1px solid ${T.border}`, fontSize: "0.68rem", fontWeight: 700, padding: "5px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            {isHydrating ? "Syncing" : isPipelineStarted ? "Pipeline Active" : "Pipeline Ready"}
          </div>
          <div style={{ background: error ? "#fff1f2" : "#ecfdf5", color: error ? "#991b1b" : "#166534", border: `1px solid ${error ? "#fecaca" : "#bbf7d0"}`, fontSize: "0.68rem", fontWeight: 700, padding: "5px 10px", borderRadius: 6 }}>
            {error ? error : "Flask API connected"}
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "#f8fafc", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMd, cursor: "pointer" }} title="Notifications"><Bell size={15} /></div>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "#f8fafc", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMd, cursor: "pointer" }} title="Configuration"><Settings size={15} /></div>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8f2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#1d4ed8", border: "1px solid #bfdbfe" }}>AS</div>
        </div>
      </header>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 56, zIndex: 99,
        display: "flex", alignItems: "center", padding: "8px 16px", gap: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflowX: "auto",
      }}>
        <span style={{ fontSize: "0.55rem", fontWeight: 700, color: T.textSm, textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 6px", whiteSpace: "nowrap" }}>
          Pipeline Stages
        </span>

        {STAGE_GROUPS.map(group => {
          const stageSteps    = state.steps.filter(s => s.stage === group.id);
          const stageComplete = stageSteps.every(s => s.status === "completed");
          const stageCurrent  = !stageComplete && stageSteps.some(s => s.id === currentStepId || s.status === "running");
          const color         = STAGE_COLORS[group.id];

          return (
            <div
              key={group.id}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 12px", fontSize: "0.72rem",
                fontWeight: stageCurrent ? 700 : 600,
                color: stageCurrent ? color : stageComplete ? T.success : T.textMd,
                borderRadius: 6, position: "relative",
                background: stageCurrent ? `${color}15` : "transparent",
                whiteSpace: "nowrap",
              }}
            >
              <span>{group.icon}</span>
              <span>{group.label}</span>
              {stageComplete && <span style={{ fontSize: "0.6rem" }}>✓</span>}
              {stageCurrent && (
                <div style={{ position: "absolute", left: 8, right: 8, bottom: 0, height: 3, background: color, borderRadius: "3px 3px 0 0" }} />
              )}
            </div>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Progress indicator */}
        {isPipelineStarted && !isPipelineDone && (
          <span style={{ fontSize: "0.68rem", color: T.textMd, fontWeight: 600, whiteSpace: "nowrap", marginRight: 8 }}>
            {completedCount}/{totalSteps} steps done
          </span>
        )}

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "5px 10px", minWidth: 200 }}>
          <Search size={13} color={T.textSm} />
          <input type="text" placeholder="Search RFPs, skills, keywords…" style={{ border: "none", background: "transparent", fontSize: "0.68rem", color: T.text, outline: "none", width: "100%", fontFamily: "Inter, sans-serif" }} />
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ padding: "14px 18px", maxWidth: 1400, margin: "0 auto" }}>

        {/* Pipeline Step Progress (hidden on pre-start and overview) */}
        {isPipelineStarted && !isPipelineDone && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow, marginBottom: 12 }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" }}>
              <div>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: T.text }}>
                  Pipeline Execution
                  <span style={{ color: T.textSm, fontWeight: 600 }}> · {completedCount}/{totalSteps} steps complete</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                  {liveBadges.length ? liveBadges.map((badge) => (
                    <span key={badge.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.6rem", fontWeight: 700, color: T.textMd, background: "#F8FAFC", border: `1px solid ${T.border}`, borderRadius: 999, padding: "3px 8px" }}>
                      {badge.label}: <strong style={{ color: T.success }}>{badge.value}</strong>
                    </span>
                  )) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.6rem", fontWeight: 700, color: T.textMd, background: "#F8FAFC", border: `1px solid ${T.border}`, borderRadius: 999, padding: "3px 8px" }}>
                      Waiting for live audit output
                    </span>
                  )}
                </div>
              </div>
              {/* Mini counts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6, textAlign: "center" }}>
                {miniCounts.map(k => (
                  <div key={k.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 9, padding: "6px 10px" }}>
                    <div style={{ fontSize: "0.52rem", color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600 }}>{k.label}</div>
                    <div style={{ marginTop: 2, fontSize: "0.9rem", fontWeight: 800, color: T.text }}>{k.val}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Step dots */}
            <StepProgress />
          </div>
        )}

        {/* Active step / screen */}
        <div key={currentStepId} style={{ animation: "fadeIn .2s ease" }}>
          <StepContainer />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { from { transform: rotate(0deg); }              to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}
