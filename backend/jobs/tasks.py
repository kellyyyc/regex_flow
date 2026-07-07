from celery import shared_task

from .processing import process_job_sync


@shared_task
def process_job(job_id: int) -> None:
    process_job_sync(job_id)
