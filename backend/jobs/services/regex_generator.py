from jobs.services.regex_validator import is_safe_regex


def convert_instruction(instruction) -> dict:
    instruction_parts = instruction.split("|")

    regex_pattern = instruction_parts[0].strip()
    is_safe, error_message = is_safe_regex(regex_pattern)
    if not is_safe:
        raise ValueError(error_message)

    replacement = instruction_parts[1].strip()
    target_columns = [col.strip() for col in instruction_parts[2].split(",")]

    return {
        "regex_pattern": regex_pattern,
        "replacement": replacement,
        "target_columns": target_columns,
    }
