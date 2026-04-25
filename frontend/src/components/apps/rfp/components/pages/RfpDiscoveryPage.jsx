/**
 * RfpDiscoveryPage - Discovery screen
 * Live RFP list from useRFPs + pipeline trigger.
 */
import React, { useMemo, useState } from "react";
import { useRFPs } from "../../../../../hooks/useRFPs";
import "./RfpDiscoveryPage.css";

const REFRESH_ICON = (spinning) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: spinning ? "rfp-spin 0.6s linear infinite" : "none" }}>
    <path d="M13.5 2.5A6.5 6.5 0 1 1 2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 5V9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GLOBE = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M7 1.5C7 1.5 5 4 5 7s2 5.5 2 5.5M7 1.5C7 1.5 9 4 9 7s-2 5.5-2 5.5M1.5 7h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CALENDAR = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.5 6h11M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ARROW_RIGHT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString();
}

function formatTimestamp(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
}

export default function RfpDiscoveryPage({ navigate }) {
  const { rfps, loading, error, triggerPipeline, pipeline, refresh } = useRFPs();
  const [seedUrls, setSeedUrls] = useState("");
  const [search, setSearch] = useState("");

  const handleRunPipeline = () => {
    const urls = seedUrls.split("\n").map((u) => u.trim()).filter(Boolean);
    triggerPipeline(urls);
  };

  const displayRFPs = useMemo(() => (
    rfps.map((r, i) => {
      const output = r.output_json || {};
      let source = r.source_url || "-";
      try {
        source = new URL(source).hostname.replace("www.", "") || source;
      } catch {
        source = source || "-";
      }

      return {
        id: r.rfp_id || i + 1,
        title: r.title || output.title || `Opportunity ${i + 1}`,
        source,
        agency: r.agency || output.client || "Unknown Agency",
        deadline: formatDate(r.deadline || output.deadline),
        detected: formatTimestamp(r.created_at || r.detected_at),
        active: true,
      };
    })
  ), [rfps]);

  const filtered = useMemo(() => {
    const text = search.toLowerCase();
    return displayRFPs.filter((r) =>
      r.title.toLowerCase().includes(text) ||
      r.agency.toLowerCase().includes(text) ||
      r.source.toLowerCase().includes(text)
    );
  }, [displayRFPs, search]);

  return (
    <div className="rfp-disc rfp-fade-up">
      <div className="rfp-disc__header rfp-fade-up rfp-fade-up--1">
        <div>
          <h2 className="rfp-disc__header-title">Discovery</h2>
          <p className="rfp-disc__header-sub">Collected {displayRFPs.length} RFPs from automated web crawling</p>
        </div>
        <div className="rfp-disc__header-actions">
          <button className="rfp-fig-btn rfp-fig-btn--outline" onClick={refresh} disabled={loading}>
            {REFRESH_ICON(loading)}
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button className="rfp-fig-btn rfp-fig-btn--primary" onClick={() => navigate("analysis")}>
            Continue to Analysis
            {ARROW_RIGHT}
          </button>
        </div>
      </div>

      <div className="rfp-disc__pipeline-box rfp-fade-up rfp-fade-up--2">
        <div className="rfp-disc__pipeline-box-header">
          <div className="rfp-disc__pipeline-box-title">
            <span className="rfp-disc__pipeline-dot" />
            Run Pipeline
          </div>
          <p className="rfp-disc__pipeline-box-sub">Enter source URLs to seed the pipeline, then click Run</p>
        </div>

        <div className="rfp-disc__pipeline-inputs">
          <textarea
            className="rfp-fig-input rfp-disc__url-input"
            placeholder={"https://sam.gov/rfp/001\nhttps://sam.gov/rfp/002"}
            value={seedUrls}
            onChange={(e) => setSeedUrls(e.target.value)}
            disabled={pipeline.running}
            rows={3}
          />
          <button
            className={`rfp-fig-btn rfp-fig-btn--primary rfp-disc__run-btn ${pipeline.running ? "running" : ""}`}
            onClick={handleRunPipeline}
            disabled={pipeline.running}
          >
            {pipeline.running ? (
              <><span className="rfp-spinner" /> Running...</>
            ) : (
              <><span>?</span> Run Pipeline</>
            )}
          </button>
        </div>

        {(pipeline.running || pipeline.result) && (
          <div className="rfp-disc__steps">
            {pipeline.stages.map((s, i) => (
              <div key={s} className={`rfp-disc__step ${pipeline.step === i ? "active" : pipeline.step > i ? "done" : ""}`}>
                <div className="rfp-disc__step-dot">{pipeline.step > i ? "?" : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {pipeline.result && !pipeline.running && (
          <div className={`rfp-disc__result ${pipeline.result.status === "success" ? "success" : "error"}`}>
            <span>{pipeline.result.status === "success" ? "?" : "?"}</span>
            <div>
              <div className="rfp-disc__result-msg">{pipeline.result.message}</div>
              {pipeline.result.sources_count !== undefined && (
                <div className="rfp-disc__result-sub">
                  Sources: {pipeline.result.sources_count} · Stored: {pipeline.result.processed?.length ?? 0}
                </div>
              )}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rfp-disc__result error">
            <span>??</span>
            <div className="rfp-disc__result-msg">{error}</div>
          </div>
        )}
      </div>

      <div className="rfp-disc__search-wrap rfp-fade-up rfp-fade-up--3">
        <div className="rfp-disc__search-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <input
          className="rfp-fig-input rfp-disc__search"
          type="text"
          placeholder="Search RFPs by title, agency, or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rfp-disc__list rfp-fade-up rfp-fade-up--4">
        {loading && rfps.length === 0 && (
          <div className="rfp-disc__loading">
            <span className="rfp-spinner" /> Loading RFPs from API...
          </div>
        )}

        {!loading && filtered.map((rfp, i) => (
          <div key={rfp.id} className="rfp-disc__rfp-card" style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
            <div className="rfp-disc__rfp-inner">
              <div style={{ flex: 1 }}>
                <h3 className="rfp-disc__rfp-title">{rfp.title}</h3>
                <div className="rfp-disc__rfp-meta">
                  <div className="rfp-disc__rfp-meta-item">{GLOBE}<span>Source: {rfp.source}</span></div>
                  <div className="rfp-disc__rfp-meta-item">{CALENDAR}<span>Deadline: {rfp.deadline}</span></div>
                  <div className="rfp-disc__rfp-meta-item"><span>Agency: {rfp.agency}</span></div>
                  <div className="rfp-disc__rfp-meta-item"><span>Detected: {rfp.detected}</span></div>
                </div>
              </div>
              <div className="rfp-disc__rfp-status">
                <div className={`rfp-disc__status-dot ${rfp.active ? "active" : ""}`} title="Active" />
              </div>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="rfp-disc__empty">
            <p>{displayRFPs.length === 0 ? "No RFP records available yet." : "No RFPs found matching your search."}</p>
          </div>
        )}
      </div>
    </div>
  );
}