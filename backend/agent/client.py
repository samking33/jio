def trigger_agent(urls: list) -> list:
    """
    Disabled legacy agent connector.

    The live pipeline no longer synthesizes agent output from this module. Any
    caller still using this legacy function should be moved to pipeline.service.
    """
    raise RuntimeError(
        "Legacy agent connector is disabled. Use pipeline.service live pipeline steps."
    )
