import type { PipelineRunState, SourceCrawlRecord } from "../types/pipeline.types";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  return body as T;
}

export async function getLatestPipelineRun(): Promise<PipelineRunState | null> {
  try {
    return await request<PipelineRunState>("/api/pipeline/runs/latest");
  } catch (error) {
    if (error instanceof Error && error.message === "No pipeline run found") {
      return null;
    }
    throw error;
  }
}

export function getPipelineRun(runId: number): Promise<PipelineRunState> {
  return request<PipelineRunState>(`/api/pipeline/runs/${runId}`);
}

export function createPipelineRun(): Promise<PipelineRunState> {
  return request<PipelineRunState>("/api/pipeline/runs", { method: "POST" });
}

export function executePipelineStep(runId: number, stepKey: string, payload: Record<string, unknown> = {}): Promise<PipelineRunState> {
  return request<PipelineRunState>(`/api/pipeline/runs/${runId}/steps/${stepKey}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getActiveSources(): Promise<SourceCrawlRecord[]> {
  const sources = await request<any[]>("/sources");
  return (Array.isArray(sources) ? sources : [])
    .filter((source) => source.active_flag !== false)
    .map((source) => ({
      id: source.source_id,
      url: source.url || "",
      category: source.category || "General",
      freq: source.crawl_frequency || "Manual",
      enabled: source.active_flag !== false,
      credential: "",
      listings: 0,
      passed: 0,
      discarded: 0,
      errors: 0,
      startTime: "—",
      endTime: "—",
    }));
}
