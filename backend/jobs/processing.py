from openai import (
    APIConnectionError,
    APITimeoutError,
    InternalServerError,
    RateLimitError,
)

from .models import Job
from .services.file_processor import (
    JobCancelledError,
    apply_regex_replacement,
    convert_xlsx_to_csv,
    ensure_job_not_cancelled,
    get_target_columns,
    load_dataframe,
    mark_job_cancelled,
    mark_job_failed,
    mark_job_running,
    mark_job_success,
    save_processed_job_result,
    save_processed_result,
    validate_input_file,
)
from .services.regex_generator import convert_instruction

RETRY_ERRORS = (
    APIConnectionError,
    APITimeoutError,
    RateLimitError,
    InternalServerError,
)


def process_job_sync(job_id: int) -> None:
    job = Job.objects.get(id=job_id)

    try:
        mark_job_running(job)

        processed_instruction = convert_instruction(job.instruction)
        ensure_job_not_cancelled(job)

        job.regex_pattern = processed_instruction["regex_pattern"]
        job.replacement = processed_instruction["replacement"]
        job.target_columns = processed_instruction["target_columns"]
        job.save(update_fields=["regex_pattern", "replacement", "target_columns"])

        input_path = validate_input_file(job)
        input_path = convert_xlsx_to_csv(input_path)
        df = load_dataframe(input_path)
        ensure_job_not_cancelled(job)

        job.row_count = len(df)
        job.save(update_fields=["row_count"])

        target_columns = get_target_columns(df, job.target_columns)
        processed_df = apply_regex_replacement(
            df=df,
            pattern=job.regex_pattern,
            replacement=job.replacement,
            target_columns=target_columns,
            job=job,
        )
        ensure_job_not_cancelled(job)

        column_headers, preview_rows, row_count = save_processed_result(
            job,
            processed_df,
        )
        save_processed_job_result(
            job,
            row_count=row_count,
            column_headers=column_headers,
            preview_rows=preview_rows,
        )

        ensure_job_not_cancelled(job)
        mark_job_success(job)

    except JobCancelledError:
        mark_job_cancelled(job)
    except RETRY_ERRORS:
        raise
    except Exception as e:
        mark_job_failed(job, str(e))
