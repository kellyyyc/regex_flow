import os
import tempfile
from pathlib import Path

import pandas as pd
import regex
from django.core.files import File
from django.utils import timezone

from ..models import Job

SUPPORTED_EXTENSIONS = {".csv", ".xlsx"}
PREVIEW_ROW_LIMIT = 25
REGEX_TIMEOUT = 0.1
PROGRESS_UPDATE_INTERVAL = 1000


class JobCancelledError(Exception):
    pass


def mark_job_running(job: Job) -> None:
    job.refresh_from_db(fields=["cancel_requested"])

    if job.cancel_requested:
        raise JobCancelledError("Job was cancelled before it started.")

    job.status = Job.Status.RUNNING
    job.error_message = ""
    job.num_processed = 0
    job.changed_row_count = 0
    job.started_at = timezone.now()
    job.save(
        update_fields=[
            "status",
            "error_message",
            "num_processed",
            "changed_row_count",
            "started_at",
        ]
    )


def mark_job_success(job: Job) -> None:
    job.status = Job.Status.SUCCESS
    job.error_message = ""
    job.completed_at = timezone.now()
    job.save(update_fields=["status", "error_message", "completed_at"])


def mark_job_failed(job: Job, error_message: str) -> None:
    job.status = Job.Status.FAILED
    job.error_message = error_message
    job.completed_at = timezone.now()
    job.save(update_fields=["status", "error_message", "completed_at"])


def mark_job_cancelled(job: Job) -> None:
    job.status = Job.Status.CANCELLED
    job.error_message = "Job was cancelled by the user."
    job.completed_at = timezone.now()
    job.save(update_fields=["status", "error_message", "completed_at"])


def ensure_job_not_cancelled(job: Job) -> None:
    job.refresh_from_db(fields=["cancel_requested"])

    if job.cancel_requested:
        raise JobCancelledError("Job was cancelled by the user.")


def validate_input_file(job: Job) -> str:
    input_path = job.input_file.path
    extension = Path(input_path).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. Only CSV and XLSX files are supported."
        )

    return input_path


def convert_xlsx_to_csv(input_path: str) -> str:
    if Path(input_path).suffix.lower() != ".xlsx":
        return input_path

    df = pd.read_excel(input_path)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    temp_path = temp_file.name
    temp_file.close()

    df.to_csv(temp_path, index=False)

    return temp_path


def load_dataframe(file_path: str) -> pd.DataFrame:
    extension = Path(file_path).suffix.lower()

    if extension == ".csv":
        return pd.read_csv(file_path)

    if extension == ".xlsx":
        return pd.read_excel(file_path)

    raise ValueError("Unsupported file type. Only CSV and XLSX files are supported.")


def get_target_columns(df: pd.DataFrame, target_columns: list[str]) -> list[str]:
    if target_columns:
        missing_columns = [
            column for column in target_columns if column not in df.columns
        ]

        if missing_columns:
            raise ValueError(f"Target columns not found: {', '.join(missing_columns)}")

        return target_columns

    return list(df.select_dtypes(include=["object", "string"]).columns)


def apply_regex_replacement(
    df: pd.DataFrame,
    pattern: str,
    replacement: str,
    target_columns: list[str],
    job: Job,
) -> tuple[pd.DataFrame, int]:
    compiled_pattern = regex.compile(pattern)
    ensure_job_not_cancelled(job)

    for column in target_columns:
        if not pd.api.types.is_string_dtype(df[column]):
            df[column] = df[column].astype("string")

    changed_row_count = 0
    total_rows = len(df)

    for index, row_index in enumerate(df.index, start=1):
        row_changed = False

        for column in target_columns:
            value = df.at[row_index, column]

            if pd.isna(value):
                continue

            original_text = str(value)
            try:
                updated_text = compiled_pattern.sub(
                    replacement,
                    original_text,
                    timeout=REGEX_TIMEOUT,
                )
            except TimeoutError as error:
                raise ValueError(
                    f"Regex timed out while processing column '{column}'. "
                    "Try a simpler pattern."
                ) from error

            if updated_text != original_text:
                df.at[row_index, column] = updated_text
                row_changed = True

        if row_changed:
            changed_row_count += 1

        if index % PROGRESS_UPDATE_INTERVAL == 0 or index == total_rows:
            ensure_job_not_cancelled(job)
            job.num_processed = index
            job.changed_row_count = changed_row_count
            job.save(update_fields=["num_processed", "changed_row_count"])

    return df, changed_row_count


def save_processed_result(
    job: Job,
    df: pd.DataFrame,
) -> tuple[list[str], list[dict[str, str | int | float | bool]], int]:
    result_name = f"{Path(job.file_name).stem}_processed.csv"

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    temp_path = temp_file.name
    temp_file.close()

    try:
        df.to_csv(temp_path, index=False)

        with open(temp_path, "rb") as result_file:
            job.result_file.save(result_name, File(result_file), save=False)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    preview_rows = df.head(PREVIEW_ROW_LIMIT).fillna("").to_dict(orient="records")

    return list(df.columns), preview_rows, len(df)


def save_processed_job_result(
    job: Job,
    row_count: int,
    changed_row_count: int,
    column_headers: list[str],
    preview_rows: list[dict[str, str | int | float | bool]],
) -> None:
    job.row_count = row_count
    job.num_processed = row_count
    job.changed_row_count = changed_row_count
    job.column_headers = column_headers
    job.preview_rows = preview_rows
    job.save(
        update_fields=[
            "result_file",
            "row_count",
            "num_processed",
            "changed_row_count",
            "column_headers",
            "preview_rows",
        ]
    )
