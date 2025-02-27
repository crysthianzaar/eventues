def filter_none_values(data: dict) -> dict:
    """Remove keys with None values from a dictionary."""
    return {k: v for k, v in data.items() if v is not None}
