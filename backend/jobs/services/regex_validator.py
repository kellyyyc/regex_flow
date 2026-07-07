import regex

TIMEOUT = 0.1
EDGE_CASES = [
    "a" * 100 + "!",
    "a" * 500 + "!",
    "1" * 500 + "!",
    "x" * 500 + "!",
    "_" * 500 + "!",
    " " * 500 + "!",
    "a" * 1000,
    "x" * 1000,
    "ab" * 300 + "!",
]


def is_safe_regex(pattern: str) -> bool:
    if not pattern or not pattern.strip():
        raise ValueError("Regex pattern cannot be empty.")

    try:
        compiled = regex.compile(pattern)
    except regex.error as e:
        return False, f"Invalid regex: {e}"

    for case in EDGE_CASES:
        try:
            compiled.search(case, timeout=TIMEOUT)
        except TimeoutError:
            return False, "Regex timed out on safety check."
        except regex.error as e:
            return False, f"Regex check failed: {e}"
