from rest_framework.decorators import api_view, parser_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from pathlib import Path
from typing import Any

from .models import Job

ALLOWED_EXTENSIONS = [".csv", ".xlsx"]


def find_job(job_id: int):
    try:
        job = Job.objects.get(id=job_id)
        return job
    except Job.DoesNotExist:
        return None


def serialize_create_job_response(job: Job) -> dict[str, int | str]:
    return {
        "id": job.id,
        "fileName": job.file_name,
        "status": job.status,
        "createdDate": job.created_at.isoformat(),
    }


def serialize_job_status(job: Job) -> dict[str, int | str]:
    return {
        "id": job.id,
        "fileName": job.file_name,
        "status": job.status,
        "createdDate": job.created_at.isoformat(),
        "instruction": job.instruction,
        "numProcessed": job.num_processed,
        "rowCount": job.row_count,
    }


def serialize_job_result(job: Job) -> dict[str, Any]:
    data = {
        "id": job.id,
        "fileName": job.file_name,
        "status": job.status,
        "createdDate": job.created_at.isoformat(),
        "instruction": job.instruction,
        "regexPattern": job.regex_pattern,
        "replacement": job.replacement,
        "targetColumns": job.target_columns,
        "rowCount": job.row_count,
        "changedRowCount": job.changed_row_count,
        "columnHeaders": job.column_headers,
        "previewRows": getattr(job, "preview_rows", []),
    }

    if job.error_message:
        data["errorMessage"] = job.error_message

    return data


def get_all_jobs(request: Request) -> Response:
    jobs = Job.objects.order_by("-created_at")[:50]
    serialized_jobs = [serialize_job_status(job) for job in jobs]
    return Response(serialized_jobs)


def create_job(request: Request) -> Response:
    instruction = request.data.get("instruction")
    file = request.FILES.get("file")

    if not instruction or not file:
        return Response(
            {"error": "Missing instructions or no file uploaded."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    suffix = Path(file.name).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        return Response(
            {"detail": "Only CSV and Excel files are supported."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    job = Job.objects.create(
        input_file=file,
        file_name=file.name,
        status="QUEUED",
        instruction=instruction,
    )

    return Response(serialize_create_job_response(job), status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@parser_classes([MultiPartParser, FormParser])
def jobs(request: Request) -> Response:
    if request.method == "GET":
        return get_all_jobs(request)

    if request.method == "POST":
        return create_job(request)


@api_view(["GET"])
def get_job_status(request, job_id: int) -> Response:
    job = find_job(job_id)

    if job is None:
        return Response(
            {"detail": "Job not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(serialize_job_status(job))


@api_view(["GET"])
def get_job_result(request, job_id: int) -> Response:
    job = find_job(job_id)

    if job is None:
        return Response(
            {"detail": "Job not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(serialize_job_result(job))
