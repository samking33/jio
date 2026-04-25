/**
 * StartScreen.tsx
 *
 * Pre-pipeline landing screen shown when currentStepId === 0.
 * Uses the same panel/KPI design as the rest of the dashboard.
 */

import React from "react";
import { Play, ShieldCheck } from "lucide-react";
import { T } from "../../utils/tokens";
import { Panel, Btn } from "../common/ui";
import { usePipeline } from "../../hooks/usePipeline";

export function StartScreen() {
  const { startPipeline, state } = usePipeline();
  const crawl = state.pipelineData.crawlResults;
  const filter = state.pipelineData.filterResults;
  const hil = state.pipelineData.hilResults;
  const log = state.pipelineData.logResults;
  const liveKpis = [
    { label: "Live Listings", value: String(crawl?.totalListings ?? 0), detail: `${crawl?.sources?.length ?? 0} active source runs`, color: T.primary },
    { label: "Passed Rules", value: String(filter?.totalPassed ?? 0), detail: `${filter?.totalFailed ?? 0} discarded`, color: T.success },
    { label: "Avg Confidence", value: `${log?.accuracy ?? 0}%`, detail: "Calculated from current run", color: T.violet },
    { label: "HIL Queue", value: String(hil?.pending?.length ?? 0), detail: `${Object.keys(hil?.decisions ?? {}).length} decisions captured`, color: T.warning },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Hero */}
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${T.primary}`,
        borderRadius: 8, padding: "24px 28px", color: T.text,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: T.shadow,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.68rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", letterSpacing: ".9px", marginBottom: 8 }}>
            <ShieldCheck size={15} /> AG-OF-0426-001
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: 8 }}>
            RFP Discovery Review Console
          </div>
          <div style={{ fontSize: "0.82rem", color: T.textMd, maxWidth: 720, lineHeight: 1.6 }}>
            Proactively discovers RFP opportunities from approved portals, applies auditable rule filters,
            extracts tasks, skills, certifications, eligibility, and risk, then holds every package at
            human review before downstream bid handoff.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {["Approved source control", "Versioned schema output", "Mandatory HIL gate", "Audit trail"].map(tag => (
              <span key={tag} style={{ padding: "3px 9px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: "0.65rem", fontWeight: 700, color: T.textMd }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: 24 }}>
          <Btn onClick={() => void startPipeline()} size="md" style={{ fontWeight: 800, fontSize: "0.84rem", padding: "11px 24px" }}>
            <Play size={15} /> Start Run
          </Btn>
        </div>
      </div>

      {/* Pipeline map */}
      <Panel>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: T.text, marginBottom: 12 }}>BRD Workflow Coverage</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { stage: "Discovery",  color: T.primary, steps: ["1. Crawl Websites", "2. Filter RFPs", "3. Download Docs"] },
              { stage: "Analysis",   color: T.violet,  steps: ["4. Extract Tasks & Skills", "5. Identify Certifications", "6. Assess Risk"] },
              { stage: "Decision",   color: T.warning, steps: ["7. Convert to JSON", "8. Human-in-Loop Review", "9. Forward Approved"] },
              { stage: "Feedback",   color: T.teal,    steps: ["10. Log & Feedback Loop"] },
            ].map(g => (
              <div key={g.stage} style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#F8FAFC", borderBottom: `2px solid ${g.color}`, color: T.text, fontSize: "0.7rem", fontWeight: 800 }}>{g.stage}</div>
                <div style={{ padding: "8px 12px" }}>
                  {g.steps.map(s => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: "0.65rem", color: T.textMd, borderBottom: `1px solid #F8FAFC` }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: g.color, flexShrink: 0 }} />{s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Live run KPIs */}
      <div>
        <div style={{ fontSize: "0.68rem", fontWeight: 600, color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>Current Live Run Metrics</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {liveKpis.map((kpi) => (
            <div key={kpi.label} style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, padding: "16px 18px", boxShadow: T.shadow, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: kpi.color, borderRadius: "8px 8px 0 0" }} />
              <div style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textSm, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: kpi.color, lineHeight: 1, marginBottom: 6 }}>{kpi.value}</div>
              <div style={{ fontSize: "0.62rem", color: T.textSm, fontWeight: 600 }}>{kpi.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
