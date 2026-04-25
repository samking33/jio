/**
 * OverviewDashboard.tsx
 *
 * Final screen shown when currentStepId > 10.
 * Full analytics view — preserves all existing design from original dashboard.
 */

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { Download, Play } from "lucide-react";
import { T } from "../../utils/tokens";
import { Panel, PanelHd, Badge, Btn } from "../common/ui";
import { usePipeline } from "../../hooks/usePipeline";

export function OverviewDashboard() {
  const { startPipeline, state } = usePipeline();

  const crawl = state.pipelineData.crawlResults;
  const filter = state.pipelineData.filterResults;
  const extract = state.pipelineData.extractResults;
  const risk = state.pipelineData.riskResults;
  const hil = state.pipelineData.hilResults;
  const forward = state.pipelineData.forwardResults;
  const logEntries = state.pipelineData.logResults?.entries ?? [];
  const accuracy = state.pipelineData.logResults?.accuracy ?? 0;
  const configuredStepCount = state.steps.length;
  const rfps = risk?.rfps ?? extract?.rfps ?? [];
  const passFailData = [
    { name: "Passed", value: filter?.totalPassed ?? 0, color: T.success },
    { name: "Failed", value: filter?.totalFailed ?? 0, color: T.danger },
  ];
  const confidenceDistribution = [
    { range: "0-40%", count: rfps.filter((rfp) => rfp.confidence <= 40).length },
    { range: "41-60%", count: rfps.filter((rfp) => rfp.confidence > 40 && rfp.confidence <= 60).length },
    { range: "61-80%", count: rfps.filter((rfp) => rfp.confidence > 60 && rfp.confidence <= 80).length },
    { range: "81-100%", count: rfps.filter((rfp) => rfp.confidence > 80).length },
  ];
  const accuracyTrend = [{ w: "Run", acc: accuracy }];
  const pipelineStages = [
    { name: "Discovery", count: crawl?.totalListings ?? 0, rate: `${crawl?.sources?.length ?? 0} sources`, color: T.primary },
    { name: "Analysis", count: extract?.rfps?.length ?? 0, rate: `${risk?.overallRisk ?? "No"} risk`, color: T.violet },
    { name: "Decision", count: hil?.pending?.length ?? 0, rate: `${Object.keys(hil?.decisions ?? {}).length} reviewed`, color: T.warning },
    { name: "Feedback", count: logEntries.length, rate: "audit events", color: T.teal },
  ];
  const kpis = [
    { label: "Listings Crawled", value: String(crawl?.totalListings ?? 0), detail: `${crawl?.totalErrors ?? 0} source errors`, color: T.primary },
    { label: "Passed Rules", value: String(filter?.totalPassed ?? 0), detail: `${filter?.totalFailed ?? 0} discarded`, color: T.success },
    { label: "Avg Confidence", value: `${accuracy}%`, detail: "Current run only", color: T.violet },
    { label: "Forwarded", value: String(forward?.forwarded ?? 0), detail: `${forward?.rejected ?? 0} rejected`, color: T.warning },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Completion banner */}
      <div style={{
        background: "#ffffff",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        borderRadius: 8, padding: "18px 24px", color: T.text,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>Pipeline Complete - All {configuredStepCount} Steps Finished</div>
          </div>
          <div style={{ fontSize: "0.72rem", color: T.textMd }}>
            Started {state.startedAt ? new Date(state.startedAt).toLocaleTimeString() : "—"} · Finished {state.completedAt ? new Date(state.completedAt).toLocaleTimeString() : "—"} · AI Accuracy: {accuracy}%
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary">
            <Download size={13} /> Export Report
          </Btn>
          <Btn onClick={() => void startPipeline()} style={{ fontWeight: 700 }}>
            <Play size={13} /> Restart Pipeline
          </Btn>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {kpis.map((kpi) => {
          return (
            <div key={kpi.label} style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, padding: "18px 20px", boxShadow: T.shadow, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: kpi.color, borderRadius: "8px 8px 0 0" }} />
              <div style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textSm, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              </div>
              <div style={{ fontSize: "0.62rem", color: T.textSm, fontWeight: 600 }}>{kpi.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Summary + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Panel>
          <PanelHd title="Pipeline Summary" icon="SYNC" right={<Badge variant="success">All {configuredStepCount} Steps Complete</Badge>} />
          <div style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: "0.62rem", color: T.textSm, marginBottom: 8 }}>Discovery → Analysis → Decision → Feedback</div>
            <div style={{ height: 10, borderRadius: 999, overflow: "hidden", display: "flex", background: "#e7edf6", marginBottom: 10 }}>
              {pipelineStages.map((stage) => (
                <span key={stage.name} style={{ flex: 1, background: stage.color, display: "block" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {pipelineStages.map(s => (
                <div key={s.name} style={{ border: `1px solid ${T.border}`, background: "#fff", borderRadius: 8, padding: "7px 8px" }}>
                  <div style={{ fontSize: "0.56rem", color: T.textSm, textTransform: "uppercase", letterSpacing: ".7px" }}>{s.name}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: T.text, marginTop: 2 }}>{s.count.toLocaleString()}</div>
                  <div style={{ fontSize: "0.58rem", color: T.textMd, marginTop: 2 }}>{s.rate} <span style={{ color: T.success, fontWeight: 700 }}>✓</span></div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel>
          <PanelHd title="Quick Actions" icon="⚡" />
          <div style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <Btn onClick={() => void startPipeline()}><Play size={12} /> New Pipeline Run</Btn>
            <Btn variant="secondary"><Download size={12} /> Export Results</Btn>
          </div>
          <div style={{ padding: "0 14px 12px" }}>
            <div style={{ padding: "10px 12px", background: T.bg, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: T.text, marginBottom: 6 }}>AI Accuracy This Run</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: T.primary, marginBottom: 2 }}>{accuracy}%</div>
              <div style={{ fontSize: "0.62rem", color: T.textSm, fontWeight: 600 }}>Computed from current run</div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Panel>
          <PanelHd title="Pass / Fail Distribution" icon="📊" />
          <div style={{ padding: 12 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={passFailData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={4} dataKey="value">
                  {passFailData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              {passFailData.map(d => (
                <span key={d.name} style={{ fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, display: "inline-block" }} />{d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>
        </Panel>
        <Panel>
          <PanelHd title="Confidence Distribution" icon="📈" />
          <div style={{ padding: "8px 12px" }}>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="count" fill={T.violet} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <PanelHd title="AI Accuracy Trend" icon="🎯" />
          <div style={{ padding: "8px 12px" }}>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="w" tick={{ fontSize: 10 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <defs>
                  <linearGradient id="accOv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.primary} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="acc" stroke={T.primary} strokeWidth={2.5} fill="url(#accOv)" dot={{ fill: T.primary, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Audit Log */}
      <Panel>
        <PanelHd title="Pipeline Audit Log" icon="📋" right={<Badge variant="success">{logEntries.length} events</Badge>} />
        <div style={{ padding: "4px 14px 12px" }}>
          {logEntries.map((log, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: i < logEntries.length - 1 ? `1px solid #F1F5F9` : "none" }}>
              <span style={{ fontSize: "0.6rem", fontFamily: "monospace", color: T.textSm, width: 40, flexShrink: 0 }}>{log.time}</span>
              <span style={{ fontSize: "0.78rem" }}>{log.type === "success" ? "✅" : log.type === "error" ? "❌" : "⚠️"}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, flex: 1 }}>{log.event}</span>
              <span style={{ fontSize: "0.62rem", color: T.textSm }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
