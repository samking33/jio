from db.queries import get_all_sources, insert_rfp_listing, insert_audit_log
from agent.client import trigger_agent


def run_pipeline() -> dict:
    """
    Orchestrates the full RFP processing pipeline:

        1. Fetch all active source URLs from the database.
        2. Send each URL to the agent (mocked).
        3. Persist each agent result as an rfp_listing row.
        4. Write an audit log entry for every inserted RFP.

    Returns:
        dict with keys:
            "status"        – "success" or "error"
            "sources_count" – how many source URLs were fetched
            "processed"     – list of inserted rfp_ids (None entries mean DB insert failed)
            "message"       – human-readable summary
    """

    # ── Step 1: Load sources ─────────────────────────────────────────────────
    sources = get_all_sources()
    if not sources:
        return {
            "status":        "success",
            "sources_count": 0,
            "processed":     [],
            "message":       "No source URLs found in the database. Nothing to process.",
        }

    print(f"[Pipeline] Loaded {len(sources)} source(s).")

    # ── Step 2 & 3: Per-source agent call + persistence ──────────────────────
    inserted_ids = []

    for source in sources:
        url       = source["url"]
        source_id = source["source_id"]
        print(f"[Pipeline] Processing source_id={source_id}: {url}")

        try:
            agent_results = trigger_agent([url])
        except Exception as e:
            print(f"[Pipeline] Agent error for {url}: {e}")
            continue

        for result in agent_results:
            rfp_id = insert_rfp_listing(
                source_id=source_id,
                title=result.get("summary", f"RFP from {url}"),
                listing_url=url,
                status="new",
            )

            if rfp_id:
                score = result.get("score", 0)
                insert_audit_log(
                    rfp_id=rfp_id,
                    action_type="pipeline_run",
                    action_detail=f"Agent processed url={url} score={score}",
                )
                inserted_ids.append(rfp_id)
                print(f"[Pipeline] Saved as rfp_id={rfp_id} (score={score}).")
            else:
                print(f"[Pipeline] WARNING: Failed to save result for {url}.")

    return {
        "status":        "success",
        "sources_count": len(sources),
        "processed":     inserted_ids,
        "message":       f"Pipeline complete. {len(inserted_ids)} RFP(s) stored.",
    }
