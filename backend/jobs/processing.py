from .models import Job
from .services.file_processor import (
    collect_file_metadata,
    mark_job_failed,
    mark_job_running,
    mark_job_success,
    save_job_file_summary,
    validate_input_file,
)
from .services.regex_generator import convert_instruction


def process_job_sync(job_id: int) -> None:
    job = Job.objects.get(id=job_id)

    try:
        mark_job_running(job)

        processed_instruction = convert_instruction(job.instruction)
        job.regex_pattern = processed_instruction["regex_pattern"]
        job.replacement = processed_instruction["replacement"]
        job.target_columns = processed_instruction["target_columns"]
        job.save(update_fields=["regex_pattern", "replacement", "target_columns"])

        input_path = validate_input_file(job)
        row_count, column_headers, preview_rows = collect_file_metadata(input_path)
        save_job_file_summary(job, row_count, column_headers, preview_rows)

        mark_job_success(job)

    except Exception as e:
        mark_job_failed(job, str(e))
