def convert_instruction(instruction):
    instruction_parts = instruction.split("|")

    regex_pattern = instruction_parts[0].strip()
    replacement = instruction_parts[1].strip()
    target_columns = [col.strip() for col in instruction_parts[2].split(",")]

    return {
        "regex_pattern": regex_pattern,
        "replacement": replacement,
        "target_columns": target_columns,
    }
