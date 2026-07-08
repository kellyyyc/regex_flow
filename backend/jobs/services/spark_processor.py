from pathlib import Path
import tempfile
import threading
import uuid

from django.conf import settings
from django.core.files import File
from django.db import close_old_connections

from ..models import Job
from .file_processor import (
    JobCancelledError,
    PREVIEW_ROW_LIMIT,
    ensure_job_not_cancelled,
)

SPARK_PROGRESS_POLL_SECONDS = 1


def get_escaped_column(column: str) -> str:
    return f"`{column.replace('`', '``')}`"


def serialize_preview_value(value):
    if value is None:
        return ""

    if isinstance(value, str | int | float | bool):
        return value

    return str(value)


def get_spark_task_progress(spark, job_group: str) -> float | None:
    tracker = spark.sparkContext.statusTracker()
    completed_tasks = 0
    total_tasks = 0

    for spark_job_id in tracker.getJobIdsForGroup(job_group):
        job_info = tracker.getJobInfo(spark_job_id)
        if job_info is None:
            continue

        for stage_id in job_info.stageIds:
            stage_info = tracker.getStageInfo(stage_id)
            if stage_info is None:
                continue

            completed_tasks += stage_info.numCompletedTasks
            total_tasks += stage_info.numTasks

    if total_tasks == 0:
        return None

    return completed_tasks / total_tasks


def clear_spark_job_group(spark) -> None:
    spark.sparkContext.setLocalProperty("spark.jobGroup.id", None)
    spark.sparkContext.setLocalProperty("spark.job.description", None)
    spark.sparkContext.setLocalProperty("spark.job.interruptOnCancel", None)


def run_spark_action_with_progress(job: Job, spark, row_count: int, action) -> None:
    if row_count <= 0:
        action()
        return

    job_group = f"regex-flow-{job.id}-{uuid.uuid4()}"
    stop_event = threading.Event()
    cancel_requested = threading.Event()

    spark.sparkContext.setJobGroup(
        job_group,
        f"regex-flow job {job.id}",
        interruptOnCancel=True,
    )

    def monitor_progress() -> None:
        last_num_processed = 0
        close_old_connections()

        try:
            while not stop_event.wait(SPARK_PROGRESS_POLL_SECONDS):
                current_job = Job.objects.only("cancel_requested").get(pk=job.pk)

                if current_job.cancel_requested:
                    cancel_requested.set()
                    spark.sparkContext.cancelJobGroup(job_group)
                    return

                progress = get_spark_task_progress(spark, job_group)
                if progress is None:
                    continue

                num_processed = min(row_count, int(row_count * progress))
                if num_processed > last_num_processed:
                    Job.objects.filter(pk=job.pk).update(num_processed=num_processed)
                    last_num_processed = num_processed
        finally:
            close_old_connections()

    monitor_thread = threading.Thread(target=monitor_progress, daemon=True)
    monitor_thread.start()

    try:
        action()
    except Exception as error:
        if cancel_requested.is_set():
            raise JobCancelledError("Job was cancelled by the user.") from error

        raise
    finally:
        stop_event.set()
        monitor_thread.join(timeout=SPARK_PROGRESS_POLL_SECONDS + 1)
        clear_spark_job_group(spark)


def process_csv_file_with_spark(job: Job, input_path: str | Path) -> None:
    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F

    spark = (
        SparkSession.builder.appName(f"regex-job-{job.id}")
        .master(settings.SPARK_MASTER_URL)
        .getOrCreate()
    )

    try:
        ensure_job_not_cancelled(job)

        df = (
            spark.read.option("header", True)
            .option("inferSchema", True)
            .csv(str(input_path))
        )

        row_count = df.count()
        job.row_count = row_count
        job.save(update_fields=["row_count"])

        target_columns = job.target_columns or [
            column for column, dtype in df.dtypes if dtype == "string"
        ]
        missing_columns = [
            column for column in target_columns if column not in df.columns
        ]

        if missing_columns:
            raise ValueError(f"Target columns not found: {', '.join(missing_columns)}")

        for column in target_columns:
            escaped_column = get_escaped_column(column)
            original_text = F.col(escaped_column).cast("string")
            df = df.withColumn(
                column,
                F.regexp_replace(original_text, job.regex_pattern, job.replacement),
            )

        ensure_job_not_cancelled(job)

        preview_rows = [
            {column: serialize_preview_value(row[column]) for column in df.columns}
            for row in df.limit(PREVIEW_ROW_LIMIT).collect()
        ]

        result_name = f"{Path(job.file_name).stem}_processed.csv"

        with tempfile.TemporaryDirectory() as output_dir:
            run_spark_action_with_progress(
                job,
                spark,
                row_count,
                lambda: df.coalesce(1)
                .write.mode("overwrite")
                .option("header", True)
                .csv(output_dir),
            )

            part_file = next(Path(output_dir).glob("part-*.csv"), None)
            if part_file is None:
                raise ValueError("Spark did not write a CSV result file.")

            with open(part_file, "rb") as result_file:
                job.result_file.save(result_name, File(result_file), save=False)

        job.row_count = row_count
        job.num_processed = row_count
        job.column_headers = df.columns
        job.preview_rows = preview_rows
        job.save(
            update_fields=[
                "result_file",
                "row_count",
                "num_processed",
                "column_headers",
                "preview_rows",
            ]
        )
    finally:
        spark.stop()
