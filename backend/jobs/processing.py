from .models import Job
from .services.file_processor import (
    apply_regex_replacement,
    get_target_columns,
    load_dataframe,
    mark_job_failed,
    mark_job_running,
    mark_job_success,
    save_processed_job_result,
    save_processed_result,
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
        df = load_dataframe(input_path)
        target_columns = get_target_columns(df, job.target_columns)
        processed_df, changed_row_count = apply_regex_replacement(
            df=df,
            pattern=job.regex_pattern,
            replacement=job.replacement,
            target_columns=target_columns,
            job=job,
        )
        column_headers, preview_rows, row_count = save_processed_result(
            job,
            processed_df,
        )
        save_processed_job_result(
            job,
            row_count=row_count,
            changed_row_count=changed_row_count,
            column_headers=column_headers,
            preview_rows=preview_rows,
        )

        mark_job_success(job)

    except Exception as e:
        mark_job_failed(job, str(e))
