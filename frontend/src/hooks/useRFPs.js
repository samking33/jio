/**
 * useRFPs
 * Shared hook that fetches RFP data from the backend and exposes
 * pipeline-trigger functionality.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../api/api";

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeRfp(row = {}, index = 0) {
  const output = row.output_json || {};
  const score =
    toNumber(output.score) ??
    toNumber(row.score) ??
    toNumber(row.confidence_score) ??
    null;

  const createdAt = row.created_at || row.detected_at || null;
  const sourceUrl = row.source_url || row.listing_url || row.url || "";

  return {
    ...row,
    output_json: output,
    score,
    created_at: createdAt,
    detected_at: row.detected_at || createdAt,
    source_url: sourceUrl,
    title: output.title || row.title || row.rfp_id || `RFP ${index + 1}`,
    deadline: output.deadline || row.submission_deadline || null,
    agency: output.client || row.agency || row.industry || "Unknown Agency",
    budget: output.budget || (row.contract_value != null ? `$${row.contract_value}` : null),
  };
}

export function deriveKPIs(rfps) {
  if (!rfps.length) return { total: 0, avgScore: "-", active: 0 };

  const scores = rfps
    .map((r) => toNumber(r.score) ?? toNumber(r.output_json?.score))
    .filter((s) => typeof s === "number");

  const avgScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : "-";

  return {
    total: rfps.length,
    active: rfps.length,
    avgScore,
  };
}

export function useRFPs() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [pipelineLog, setPipelineLog] = useState([]);
  const [pipelineStep, setPipelineStep] = useState(-1);

  const logRef = useRef([]);

  const addLog = useCallback((msg, type = "info") => {
    const entry = { msg, type, time: new Date().toLocaleTimeString() };
    logRef.current = [...logRef.current, entry];
    setPipelineLog([...logRef.current]);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await api.getRFPs();

    if (err) {
      setError(err);
    } else {
      const rows = Array.isArray(data) ? data : [];
      setRfps(rows.map(normalizeRfp));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const triggerPipeline = useCallback(async (urls = []) => {
    setPipelineRunning(true);
    setPipelineResult(null);
    logRef.current = [];
    setPipelineLog([]);
    setPipelineStep(0);

    addLog(`Starting live backend pipeline with ${urls.length || "existing"} source(s)...`, "info");

    const { data, error: err } = await api.runPipeline(urls);

    if (err) {
      addLog(`Pipeline error: ${err}`, "error");
      setPipelineResult({ status: "error", message: err });
    } else {
      addLog(`Done: ${data?.message || "Pipeline completed."}`, "success");
      setPipelineResult(data || { status: "success", message: "Pipeline completed." });
      await refresh();
    }

    setPipelineStep(-1);
    setPipelineRunning(false);
  }, [addLog, refresh]);

  const kpis = useMemo(() => deriveKPIs(rfps), [rfps]);

  return {
    rfps,
    loading,
    error,
    kpis,
    refresh,
    triggerPipeline,
    pipeline: {
      running: pipelineRunning,
      result: pipelineResult,
      log: pipelineLog,
      step: pipelineStep,
      stages: [],
    },
  };
}
