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
    try:
        compiled = regex.compile(pattern)
    except regex.error:
        return False

    for case in EDGE_CASES:
        try:
            compiled.search(case, timeout=TIMEOUT)
        except TimeoutError:
            return False
        except regex.error:
            return False

    return True
