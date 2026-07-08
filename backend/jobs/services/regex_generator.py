import json
import os
import hashlib
from openai import OpenAI
from django.core.cache import cache

from jobs.services.regex_validator import is_safe_regex

LLM_INSTRUCTIONS = (
    "Convert the user's instruction into a regex replacement config. "
    "The regex_pattern must be Python-compatible. "
    "Only include target columns that the user explicitly mentions. "
    "Return JSON matching the schema."
)

REGEX_GENERATION_SCHEMA = {
    "type": "object",
    "properties": {
        "regex_pattern": {
            "type": "string",
            "description": "A Python-compatible regular expression pattern.",
        },
        "replacement": {
            "type": "string",
            "description": "The replacement string to use.",
        },
        "target_columns": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Column names that the regex should be applied to.",
        },
    },
    "additionalProperties": False,
    "required": ["regex_pattern", "replacement", "target_columns"],
}


def get_openai_client() -> OpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    return OpenAI(api_key=api_key)


def get_instruction_cache_key(instruction: str) -> str:
    normalised = " ".join(instruction.strip().lower().split())
    digest = hashlib.sha256(normalised.encode("utf-8")).hexdigest()

    return f"instruction:{digest}"


def convert_instruction(instruction) -> dict:
    cache_key = get_instruction_cache_key(instruction)

    cached_result = cache.get(cache_key)

    if cached_result is not None:
        return cached_result

    client = get_openai_client()

    response = client.responses.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        instructions=LLM_INSTRUCTIONS,
        input=[
            {
                "role": "user",
                "content": instruction,
            },
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "regex_generation",
                "strict": True,
                "schema": REGEX_GENERATION_SCHEMA,
            }
        },
    )

    try:
        parsed = json.loads(response.output_text)
    except json.JSONDecodeError:
        raise ValueError("OpenAI response was not valid JSON.")

    regex_pattern = str(parsed.get("regex_pattern", "")).strip()
    is_safe, error_message = is_safe_regex(regex_pattern)
    if not is_safe:
        raise ValueError(error_message)

    result = {
        "regex_pattern": regex_pattern,
        "replacement": str(parsed.get("replacement", "")),
        "target_columns": [
            str(col).strip()
            for col in parsed.get("target_columns", [])
            if str(col).strip()
        ],
    }

    cache.set(cache_key, result, timeout=60 * 60 * 24)

    return result
