from flask import Flask, jsonify, request
from flask_cors import CORS

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from db.connection import init_db
from db.queries import (
    get_all_sources, insert_source, get_source_by_id,
    update_source_active_flag, delete_source,
    get_all_rfp_listings, get_rfp_listing_by_id, insert_rfp_listing,
    update_rfp_status,
    insert_crawl_run, get_crawl_runs,
    insert_task, get_tasks,
    insert_skill, get_skills,
    insert_certification, get_certifications,
    insert_eligibility_assessment, get_eligibility_assessment,
    insert_risk, get_risks,
    insert_hil_review, get_hil_reviews,
    insert_audit_log, get_audit_logs,
    insert_rfp_document, get_rfp_documents,
)
from pipeline.pipeline import run_pipeline

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ─── Startup: initialise tables ───────────────────────────────────────────────
with app.app_context():
    init_db()


# ─── Health ───────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"message": "RFP Backend Running"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# ─── Pipeline ─────────────────────────────────────────────────────────────────

@app.route("/run-pipeline", methods=["POST"])
def api_run_pipeline():
    """
    Triggers the full RFP processing pipeline.

    Optional JSON body:
        { "sources": [{"source_name": "...", "url": "...", "category": "...", "crawl_frequency": "..."}, ...] }

    Returns 200 with the pipeline result dict, or 500 on unexpected error.
    """
    body = request.get_json(silent=True) or {}
    for source in body.get("sources", []):
        insert_source(
            source_name=source.get("source_name", ""),
            url=source.get("url", ""),
            category=source.get("category"),
            crawl_frequency=source.get("crawl_frequency"),
        )

    try:
        result = run_pipeline()
        status_code = 200 if result["status"] == "success" else 500
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─── RFP Listings ─────────────────────────────────────────────────────────────

@app.route("/rfps", methods=["GET"])
def api_get_rfps():
    """Returns all stored RFP listings, newest first."""
    return jsonify(get_all_rfp_listings()), 200


@app.route("/rfps/<int:rfp_id>", methods=["GET"])
def api_get_rfp(rfp_id):
    """Returns a single RFP listing by ID."""
    rfp = get_rfp_listing_by_id(rfp_id)
    if rfp is None:
        return jsonify({"status": "error", "message": "RFP not found"}), 404
    return jsonify(rfp), 200


@app.route("/rfps/<int:rfp_id>", methods=["PATCH"])
def api_update_rfp(rfp_id):
    """
    Updates an RFP listing.

    Accepted fields in JSON body:
        status  – e.g. "approved", "rejected", "in_progress"
    """
    data = request.get_json(silent=True) or {}
    updated = False

    if "status" in data:
        ok = update_rfp_status(rfp_id, data["status"])
        if not ok:
            return jsonify({"status": "error", "message": "Update failed"}), 500
        insert_audit_log(rfp_id, "status_change", f"status set to {data['status']}")
        updated = True

    if not updated:
        return jsonify({"status": "error", "message": "No updatable fields provided"}), 400

    rfp = get_rfp_listing_by_id(rfp_id)
    return jsonify(rfp), 200


# ─── RFP Sub-resources ────────────────────────────────────────────────────────

@app.route("/rfps/<int:rfp_id>/tasks", methods=["GET"])
def api_get_rfp_tasks(rfp_id):
    return jsonify(get_tasks(rfp_id)), 200


@app.route("/rfps/<int:rfp_id>/certifications", methods=["GET"])
def api_get_rfp_certifications(rfp_id):
    return jsonify(get_certifications(rfp_id)), 200


@app.route("/rfps/<int:rfp_id>/documents", methods=["GET"])
def api_get_rfp_documents(rfp_id):
    return jsonify(get_rfp_documents(rfp_id)), 200


@app.route("/rfps/<int:rfp_id>/eligibility", methods=["GET"])
def api_get_rfp_eligibility(rfp_id):
    return jsonify(get_eligibility_assessment(rfp_id) or {}), 200


@app.route("/rfps/<int:rfp_id>/risks", methods=["GET"])
def api_get_rfp_risks(rfp_id):
    return jsonify(get_risks(rfp_id)), 200


@app.route("/rfps/<int:rfp_id>/reviews", methods=["GET"])
def api_get_rfp_reviews(rfp_id):
    return jsonify(get_hil_reviews(rfp_id)), 200


@app.route("/rfps/<int:rfp_id>/reviews", methods=["POST"])
def api_create_rfp_review(rfp_id):
    """
    Records a human-in-the-loop review decision.

    Required JSON body:
        { "reviewer_name": "...", "review_status": "approved|rejected|pending", "corrections": "..." }
    """
    data = request.get_json(silent=True) or {}
    reviewer_name  = data.get("reviewer_name", "human")
    review_status  = data.get("review_status", "pending")
    corrections    = data.get("corrections")

    review_id = insert_hil_review(
        rfp_id=rfp_id,
        reviewer_name=reviewer_name,
        review_status=review_status,
        corrections=corrections,
    )
    if review_id is None:
        return jsonify({"status": "error", "message": "Failed to save review"}), 500

    insert_audit_log(rfp_id, "hil_review", f"reviewer={reviewer_name} decision={review_status}")
    return jsonify({"review_id": review_id, "status": "created"}), 201


@app.route("/rfps/<int:rfp_id>/audit-logs", methods=["GET"])
def api_get_rfp_audit_logs(rfp_id):
    return jsonify(get_audit_logs(rfp_id)), 200


# ─── Sources ──────────────────────────────────────────────────────────────────

@app.route("/sources", methods=["GET"])
def api_get_sources():
    return jsonify(get_all_sources()), 200


@app.route("/sources", methods=["POST"])
def api_create_source():
    data = request.get_json(silent=True) or {}
    source_id = insert_source(
        source_name=data.get("source_name", ""),
        url=data.get("url", ""),
        category=data.get("category"),
        crawl_frequency=data.get("crawl_frequency"),
    )
    if source_id:
        return jsonify({"source_id": source_id, "status": "created"}), 201
    return jsonify({"status": "error", "message": "Failed to create source"}), 500


@app.route("/sources/<int:source_id>", methods=["PATCH"])
def api_update_source(source_id):
    """
    Updates a source record.

    Accepted fields in JSON body:
        active_flag  – boolean
    """
    data = request.get_json(silent=True) or {}
    if "active_flag" not in data:
        return jsonify({"status": "error", "message": "No updatable fields provided"}), 400

    ok = update_source_active_flag(source_id, bool(data["active_flag"]))
    if not ok:
        return jsonify({"status": "error", "message": "Update failed"}), 500

    source = get_source_by_id(source_id)
    return jsonify(source), 200


@app.route("/sources/<int:source_id>", methods=["DELETE"])
def api_delete_source(source_id):
    """Deletes a source URL record."""
    ok = delete_source(source_id)
    if not ok:
        return jsonify({"status": "error", "message": "Delete failed"}), 500
    return jsonify({"status": "deleted", "source_id": source_id}), 200


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
