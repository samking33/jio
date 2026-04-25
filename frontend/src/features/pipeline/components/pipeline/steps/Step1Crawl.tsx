/**
 * Step1Crawl.tsx — Stage: Discovery
 * POST /api/crawl
 */

import React, { useEffect, useState } from "react";
import { Globe, AlertTriangle, CheckCircle2 } from "lucide-react";
import { T } from "../../../utils/tokens";
import { Panel, PanelHd, Badge } from "../../common/ui";
import { StepCard } from "../StepCard";
import { usePipeline } from "../../../hooks/usePipeline";
import { getActiveSources } from "../../../services/api";
import type { SourceCrawlRecord } from "../../../types/pipeline.types";

export function Step1Crawl() {
  const { executeStep, goNext, state } = usePipeline();
  const [sources, setSources] = useState<SourceCrawlRecord[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const crawlResults = state.pipelineData.crawlResults;
  const crawlResult = crawlResults?.sources ?? null;

  const enabled = sources.filter(s => s.enabled);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const activeSources = await getActiveSources();
        if (!cancelled) {
          setSources(activeSources);
        }
      } finally {
        if (!cancelled) {
          setLoadingSources(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRun = () => executeStep(1);

  return (
    <StepCard stepId={1} onRun={() => void handleRun()} onNext={goNext} runLabel="Trigger Crawl">
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {[
          { label: "Active Sources", val: enabled.length, color: T.primary },
          { label: "Listings Found", val: crawlResult ? crawlResult.reduce((a, s) => a + s.listings, 0) : "—", color: T.violet },
          { label: "Passed Filters", val: crawlResult ? crawlResult.reduce((a, s) => a + s.passed, 0) : "—", color: T.success },
          { label: "Error Count",    val: crawlResults?.totalErrors ?? "—", color: T.warning },
        ].map(k => (
          <div key={k.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", boxShadow: T.shadow }}>
            <div style={{ fontSize: "0.6rem", color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Source Management */}
      <Panel>
        <PanelHd
          title="Active Crawl Sources"
          icon={<Globe size={13} />}
          right={<Badge variant="neutral">Source Manager owns URL changes</Badge>}
        />
        <div style={{ padding: "0 14px" }}>
          {loadingSources && (
            <div style={{ padding: "12px 0", fontSize: "0.68rem", color: T.textSm }}>
              Loading active sources from the shared Source Manager...
            </div>
          )}
          {!loadingSources && enabled.length === 0 && (
            <div style={{ padding: "12px 0", fontSize: "0.68rem", color: T.textSm }}>
              No active sources found. Add or enable sources in the Source Manager before running discovery.
            </div>
          )}
          {sources.map((src, i) => (
            <div key={src.id} style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr) 90px 80px 80px", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: i < sources.length - 1 ? `1px solid #F8FAFC` : "none" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: src.enabled ? T.success : T.textSm, opacity: src.enabled ? 1 : 0.45 }} />
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{src.url}</div>
                <div style={{ fontSize: "0.6rem", color: T.textSm }}>{src.category} · {src.freq}</div>
              </div>
              <Badge variant={src.enabled ? "success" : "neutral"}>{src.enabled ? "Active" : "Disabled"}</Badge>
              <div style={{ fontSize: "0.62rem", color: T.textMd, fontFamily: "monospace" }}>Managed</div>
              <button onClick={() => window.open(src.url, "_blank", "noopener,noreferrer")}
                style={{ padding: "3px 8px", fontSize: "0.6rem", border: `1px solid ${T.border}`, borderRadius: 6, background: "#fff", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
                Open Source
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Results table (shown after crawl) */}
      {crawlResult && (
        <Panel>
          <PanelHd title="Crawl Activity Results" icon={<Globe size={13} />}
            right={<Badge variant="success">✓ Crawl Complete</Badge>} />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFBFD" }}>
                  {["Source URL","Start","End","Listings","Passed","Discarded","Errors","Status"].map(h => (
                    <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: "0.6rem", fontWeight: 700, color: T.textSm, textTransform: "uppercase", letterSpacing: ".8px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crawlResult.map((src, i) => (
                  <tr key={src.id} style={{ borderBottom: i < crawlResult.length - 1 ? `1px solid #F1F5F9` : "none" }}>
                    <td style={{ padding: "7px 10px", fontSize: "0.68rem", fontWeight: 600, color: T.primary }}>{src.url}</td>
                    <td style={{ padding: "7px 10px", fontSize: "0.62rem", fontFamily: "monospace" }}>{src.startTime}</td>
                    <td style={{ padding: "7px 10px", fontSize: "0.62rem", fontFamily: "monospace" }}>{src.endTime}</td>
                    <td style={{ padding: "7px 10px", fontWeight: 700, fontSize: "0.7rem" }}>{src.listings}</td>
                    <td style={{ padding: "7px 10px", fontWeight: 700, fontSize: "0.7rem", color: T.success }}>{src.passed}</td>
                    <td style={{ padding: "7px 10px", fontSize: "0.7rem", color: T.danger }}>{src.discarded}</td>
                    <td style={{ padding: "7px 10px", fontSize: "0.7rem" }}><span style={{ color: src.errors > 0 ? T.warning : T.success, fontWeight: 700 }}>{src.errors}</span></td>
                    <td style={{ padding: "7px 10px" }}>
                      {src.errors > 0
                        ? <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", fontWeight: 700, color: T.warning }}><AlertTriangle size={11} /> Warning</span>
                        : <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", fontWeight: 700, color: T.success }}><CheckCircle2 size={11} /> OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </StepCard>
  );
}
