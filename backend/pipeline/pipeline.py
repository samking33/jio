from pipeline.service import run_pipeline_legacy


def run_pipeline() -> dict:
    """Backward-compatible wrapper for the live persisted pipeline."""
    return run_pipeline_legacy({})
