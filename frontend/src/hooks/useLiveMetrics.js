import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/api";

const EMPTY_METRICS = {
  sources_total: 0,
  sources_active: 0,
  rfps_total: 0,
  rfps_active: 0,
  rfps_approved: 0,
  rfps_rejected: 0,
  contract_value_total: 0,
  crawl_runs_total: 0,
  listings_detected_total: 0,
  listings_passed_total: 0,
  listings_discarded_total: 0,
  crawl_errors_total: 0,
  tasks_total: 0,
  skills_total: 0,
  certifications_total: 0,
  certifications_flagged: 0,
  risks_total: 0,
  risks_high: 0,
  reviews_total: 0,
  reviews_approved: 0,
  reviews_rejected: 0,
  audit_logs_total: 0,
  avg_task_confidence: null,
  latest_rfps: [],
  latest_audit_logs: [],
  latest_crawl_runs: [],
};

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(value) {
  const amount = normalizeNumber(value);
  if (!amount) return "$0";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount)}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "0%";
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";
  return `${Math.round(number * 100)}%`;
}

export function useLiveMetrics(refreshMs = 30000) {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await api.getMetrics();
    if (err) {
      setError(err);
    } else {
      setMetrics({ ...EMPTY_METRICS, ...(data || {}) });
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) await refresh();
    };
    load();
    const id = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refresh, refreshMs]);

  const derived = useMemo(() => {
    const total = normalizeNumber(metrics.rfps_total);
    const approved = normalizeNumber(metrics.rfps_approved);
    const rejected = normalizeNumber(metrics.rfps_rejected);
    const reviewed = approved + rejected;
    const pass = normalizeNumber(metrics.listings_passed_total);
    const detected = normalizeNumber(metrics.listings_detected_total);
    const avgConfidence = metrics.avg_task_confidence;

    return {
      totalRfps: total,
      activeRfps: normalizeNumber(metrics.rfps_active),
      approvedRfps: approved,
      rejectedRfps: rejected,
      reviewClosureRate: reviewed ? Math.round((approved / reviewed) * 100) : 0,
      rulePassRate: detected ? Math.round((pass / detected) * 100) : 0,
      avgConfidenceLabel: formatPercent(avgConfidence),
      pipelineValueLabel: formatMoney(metrics.contract_value_total),
    };
  }, [metrics]);

  return { metrics, derived, loading, error, refresh };
}
