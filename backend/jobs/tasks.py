from celery import shared_task
from openai import (
    APIConnectionError,
    APITimeoutError,
    InternalServerError,
    RateLimitError,
)

from .processing import process_job_sync

RETRY_ERRORS = (
    APIConnectionError,
    APITimeoutError,
    RateLimitError,
    InternalServerError,
)


@shared_task(bind=True, max_retries=5)
def process_job(self, job_id: int) -> None:
    try:
        process_job_sync(job_id)
    except RETRY_ERRORS as exc:
        retry_number = self.request.retries + 1
        countdown = min(2**retry_number, 60)
        raise self.retry(exc=exc, countdown=countdown)
