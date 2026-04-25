/**
 * api.js  —  Integration Layer
 * ────────────────────────────
 * All backend communication lives here.
 * Components never call fetch() directly — they use these functions.
 *
 * Base URL is read from the environment variable REACT_APP_API_URL
 * (set in .env) so the same build works against local dev, staging,
 * and production without code changes.
 *
 * Every function returns:
 *   { data, error }
 * where exactly one of the two is non-null, making call-sites easy:
 *
 *   const { data, error } = await api.getRFPs();
 *   if (error) { … handle … }
 *   else        { … use data … }
 */

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

// ── Generic fetch wrapper ─────────────────────────────────────────────────────

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    // Treat non-2xx as errors (Flask returns 500 on pipeline errors)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body.message || `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : null;
    return { data, error: null };
  } catch (err) {
    // Network error (backend down, CORS, etc.)
    return { data: null, error: err.message || "Network error" };
  }
}

// ── API surface ───────────────────────────────────────────────────────────────

const api = {
  /**
   * GET /health
   * Quick liveness probe — used by the status indicator in the header.
   * Returns { data: { status: "ok" }, error }
   */
  health() {
    return request("/health");
  },

  getMetrics() {
    return request("/metrics");
  },

  /**
   * GET /rfps
   * Fetches all stored RFP output records, newest first.
   * Returns { data: RFPRecord[], error }
   *
   * RFPRecord shape:
   *   { id, rfp_id, source_url, output_json, created_at }
   */
  getRFPs() {
    return request("/rfps");
  },

  /**
   * POST /run-pipeline
   * Triggers the full backend pipeline.
   *
   * @param {string[]} urls  Optional list of source URLs to seed before running.
   *
   * Returns { data: PipelineResult, error }
   *
   * PipelineResult shape:
   *   { status, sources_count, processed: number[], message }
   */
  runPipeline(urls = []) {
    const sources = urls
      .filter(Boolean)
      .map((url, index) => ({
        source_name: `Source ${index + 1}`,
        url,
        category: null,
        crawl_frequency: null,
      }));

    return request("/run-pipeline", {
      method: "POST",
      body: JSON.stringify({ sources }),
    });
  },

  /**
   * GET /sources
   * Returns all registered source URLs.
   */
  getSources() {
    return request("/sources");
  },

  /**
   * POST /sources
   * Creates a source URL record.
   */
  createSource(payload) {
    return request("/sources", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getRfpTasks(rfpId) {
    return request(`/rfps/${rfpId}/tasks`);
  },

  getRfpCertifications(rfpId) {
    return request(`/rfps/${rfpId}/certifications`);
  },

  getRfpDocuments(rfpId) {
    return request(`/rfps/${rfpId}/documents`);
  },

  getRfpEligibility(rfpId) {
    return request(`/rfps/${rfpId}/eligibility`);
  },

  getRfpRisks(rfpId) {
    return request(`/rfps/${rfpId}/risks`);
  },

  getRfpReviews(rfpId) {
    return request(`/rfps/${rfpId}/reviews`);
  },

  getRfpAuditLogs(rfpId) {
    return request(`/rfps/${rfpId}/audit-logs`);
  },

  /**
   * PATCH /rfps/:rfpId
   * Updates an RFP record.  Pass { status } to change the decision status.
   */
  updateRfp(rfpId, payload) {
    return request(`/rfps/${rfpId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * POST /rfps/:rfpId/reviews
   * Records a human-in-the-loop decision for an RFP.
   *
   * @param {number} rfpId
   * @param {{ reviewer_name: string, review_status: string, corrections?: string }} payload
   */
  createRfpReview(rfpId, payload) {
    return request(`/rfps/${rfpId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * PATCH /sources/:sourceId
   * Updates a source record.  Pass { active_flag: boolean } to toggle it.
   */
  updateSource(sourceId, payload) {
    return request(`/sources/${sourceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * DELETE /sources/:sourceId
   * Permanently removes a source URL.
   */
  deleteSource(sourceId) {
    return request(`/sources/${sourceId}`, { method: "DELETE" });
  },
};

export default api;
