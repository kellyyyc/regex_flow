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


def is_safe_regex(pattern: str) -> tuple[bool, str]:
    if not pattern or not pattern.strip():
        return False, "Regex pattern cannot be empty."

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

    if compiled.match("") is not None:
        return False, "Regex pattern should not match an empty string."

    return True, ""
