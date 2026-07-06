from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from pathlib import Path

from .models import Job

ALLOWED_EXTENSIONS = [".csv", ".xlsx"]


def find_job(job_id: int):
    job = Job.objects.get(id=job_id)
    return job


def serialize_create_job_response(job):
    return {
        "id": job.id,
        "file_name": job.file_name,
        "status": job.status,
    }


def serialize_job_status(job):
    return {
        "id": job.id,
        "file_name": job.file_name,
        "status": job.status,
        "instruction": job.instruction,
        "num_processed": job.num_processed,
        "row_count": job.row_count,
    }


def serialize_job_result(job):
    data = {
        "id": job.id,
        "file_name": job.file_name,
        "status": job.status,
        "instruction": job.instruction,
        "regex_pattern": job.regex_pattern,
        "replacement": job.replacement,
        "target_columns": job.target_columns,
        "row_count": job.row_count,
        "changed_row_count": job.changed_row_count,
        "column_headers": job.column_headers,
        "preview_rows": job.preview_rows,
    }

    if "error_message" in job:
        data["error_message"] = job.error_message

    return data


def get_all_jobs(request):
    jobs = Job.objects.order_by("-created_at")[:50]
    serialized_jobs = [serialize_job_status(job) for job in jobs]
    return Response(serialized_jobs)


@parser_classes([MultiPartParser, FormParser])
def create_job(request):
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
def jobs(request):
    if request.method == "GET":
        return get_all_jobs(request)

    if request.method == "POST":
        return create_job(request)


@api_view(["GET"])
def get_job_status(request, job_id):
    job = find_job(job_id)

    if job is None:
        return Response(
            {"detail": "Job not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(serialize_job_status(job))


@api_view(["GET"])
def get_job_result(request, job_id):
    job = find_job(job_id)

    if job is None:
        return Response(
            {"detail": "Job not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(serialize_job_result(job))
