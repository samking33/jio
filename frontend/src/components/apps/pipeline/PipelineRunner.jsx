/**
 * PipelineRunner  —  Live API version
 * ─────────────────────────────────────
 * Uses the shared useRFPs hook so the RFP table always stays in sync
 * with whatever the RFPDashboard shows.
 *
 * API calls:
 *   GET  /rfps         → results table (via hook)
 *   POST /run-pipeline → Run button (via hook)
 */

import React, { useState } from "react";
import { useRFPs } from "../../../hooks/useRFPs";
import "./PipelineRunner.css";

export default function PipelineRunner() {
  const { rfps, loading, error, triggerPipeline, pipeline, refresh } = useRFPs();
  const [urls, setUrls] = useState("https://sam.gov/rfp/001\nhttps://sam.gov/rfp/002");

  const handleRun = () => {
    const urlList = urls.split("\n").map(u => u.trim()).filter(Boolean);
    triggerPipeline(urlList);
  };

  return (
    <div className="pipeline-runner">
      <div className="pipeline-runner__header">
        <span className="pipeline-runner__icon">⚙️</span>
        <div>
          <div className="pipeline-runner__title">Pipeline Runner</div>
          <div className="pipeline-runner__sub">
            POST /run-pipeline · GET /rfps
            {error && <span className="pipeline-runner__header-err"> · ⚠️ {error}</span>}
          </div>
        </div>
      </div>

      <div className="pipeline-runner__body">
        {/* Left: config + steps + log */}
        <div className="pipeline-runner__left">
          <div className="pipeline-runner__field-label">Source URLs (one per line)</div>
          <textarea
            className="pipeline-runner__urls"
            value={urls}
            onChange={e => setUrls(e.target.value)}
            disabled={pipeline.running}
            rows={4}
          />

          {/* 4-step progression */}
          <div className="pipeline-runner__steps">
            {pipeline.stages.map((s, i) => (
              <div
                key={s}
                className={`pipeline-runner__step ${pipeline.step === i ? "active" : pipeline.step > i ? "done" : ""}`}
              >
                <div className="pipeline-runner__step-dot">
                  {pipeline.step > i ? "✓" : i + 1}
                </div>
                <span>{s}</span>
                {pipeline.step === i && <span className="pipeline-runner__spinner">⟳</span>}
              </div>
            ))}
          </div>

          <button
            className={`pipeline-runner__run-btn ${pipeline.running ? "pipeline-runner__run-btn--running" : ""}`}
            onClick={handleRun}
            disabled={pipeline.running}
          >
            {pipeline.running ? "⟳ Running…" : "▶ Run Pipeline"}
          </button>

          {/* Result badge */}
          {pipeline.result && !pipeline.running && (
            <div className={`pipeline-runner__result ${pipeline.result.status === "success" ? "success" : "error"}`}>
              <strong>{pipeline.result.status === "success" ? "✅" : "❌"}</strong> {pipeline.result.message}
              {pipeline.result.sources_count !== undefined && (
                <div>Sources: {pipeline.result.sources_count} · Stored: {pipeline.result.processed?.length ?? 0}</div>
              )}
            </div>
          )}

          {/* Execution log */}
          <div className="pipeline-runner__field-label">Execution Log</div>
          <div className="pipeline-runner__log">
            {pipeline.log.length === 0
              ? <span className="pipeline-runner__log-empty">No log entries yet — press Run Pipeline</span>
              : pipeline.log.map((l, i) => (
                <div key={i} className={`pipeline-runner__log-entry pipeline-runner__log--${l.type}`}>
                  <span className="pipeline-runner__log-time">{l.time}</span>
                  <span>{l.msg}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Right: live results table from GET /rfps */}
        <div className="pipeline-runner__right">
          <div className="pipeline-runner__table-header">
            <div className="pipeline-runner__field-label">
              Stored RFP Outputs ({rfps.length})
            </div>
            <button
              className="pipeline-runner__refresh-btn"
              onClick={refresh}
              title="Refresh from GET /rfps"
            >
              ↺ Refresh
            </button>
          </div>

          {loading && <div className="pipeline-runner__table-loading">⟳ Loading from /rfps…</div>}

          <div className="pipeline-runner__table-wrap">
            <table className="pipeline-runner__table">
              <thead>
                <tr>
                  <th>RFP ID</th>
                  <th>Source URL</th>
                  <th>Result</th>
                  <th>Score</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rfps.length === 0 && !loading && (
                  <tr><td colSpan={5} className="pipeline-runner__empty">No records yet — run the pipeline</td></tr>
                )}
                {rfps.map(r => (
                  <tr key={r.rfp_id}>
                    <td><span className="pipeline-runner__rfp-id">{r.rfp_id}</span></td>
                    <td className="pipeline-runner__url">{r.source_url}</td>
                    <td>
                      <span className="pipeline-runner__status-dot" />
                      {r.output_json?.result ?? "processed"}
                    </td>
                    <td>
                      {typeof r.output_json?.score === "number"
                        ? <span className="pipeline-runner__score">{r.output_json.score}</span>
                        : "—"}
                    </td>
                    <td className="pipeline-runner__ts">
                      {r.created_at ? new Date(r.created_at).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
