import uuid


def trigger_agent(urls: list) -> list:
    """
    Mock agent client.  In production this would call an external AI service.
    For now it returns a fake "processed" result for every URL supplied.

    Args:
        urls: List of source URL strings to process.

    Returns:
        list[dict]: One result dict per URL:
            {
                "rfp_id":     str   – freshly generated UUID,
                "source_url": str   – the URL that was processed,
                "result":     str   – always "processed" in the mock,
                "summary":    str   – placeholder summary text,
                "score":      float – placeholder relevance score
            }
    """
    results = []

    for url in urls:
        # Generate a unique ID to represent this RFP run
        rfp_id = f"rfp-{uuid.uuid4().hex[:8]}"

        results.append({
            "rfp_id":     rfp_id,
            "source_url": url,
            "result":     "processed",
            # ── Placeholder fields the frontend can display ──────────────────
            "summary":    f"Mock summary for {url}",
            "score":      round(0.75 + (hash(url) % 25) / 100, 2),  # 0.75 – 0.99
        })

    print(f"[Agent] trigger_agent called with {len(urls)} URL(s). Mock results generated.")
    return results
