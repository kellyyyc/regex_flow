import json
import os

from openai import OpenAI

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


def convert_instruction(instruction) -> dict:
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

    replacement = str(parsed.get("replacement", ""))
    raw_target_columns = parsed.get("target_columns", [])

    if not isinstance(raw_target_columns, list):
        raise ValueError("OpenAI response must return target_columns as a list.")

    target_columns = [
        str(col).strip() for col in raw_target_columns if str(col).strip()
    ]

    print(
        {
            "regex_pattern": regex_pattern,
            "replacement": replacement,
            "target_columns": target_columns,
        }
    )

    return {
        "regex_pattern": regex_pattern,
        "replacement": replacement,
        "target_columns": target_columns,
    }
