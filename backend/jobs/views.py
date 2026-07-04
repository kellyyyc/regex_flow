from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .mock_data import MOCK_JOBS


def find_job(job_id: int):
    for job in MOCK_JOBS:
        if job["id"] == job_id:
            return job

    return None


def serialize_create_job_response(job):
    return {
        "id": job["id"],
        "file_name": job["file_name"],
        "status": job["status"],
    }


def serialize_job_status(job):
    return {
        "id": job["id"],
        "file_name": job["file_name"],
        "status": job["status"],
        "num_processed": job["num_processed"],
        "row_count": job["row_count"],
    }


def serialize_job_result(job):
    data = {
        "id": job["id"],
        "file_name": job["file_name"],
        "status": job["status"],
        "regex_pattern": job["regex_pattern"],
        "replacement": job["replacement"],
        "target_columns": job["target_columns"],
        "row_count": job["row_count"],
        "changed_row_count": job["changed_row_count"],
        "column_headers": job["column_headers"],
        "preview_rows": job["preview_rows"],
    }

    if "error_message" in job:
        data["error_message"] = job["error_message"]

    return data


def get_all_jobs(request):
    jobs = [serialize_job_status(job) for job in MOCK_JOBS]
    return Response(jobs)


@api_view(["GET", "POST"])
def jobs(request):
    if request.method == "GET":
        return get_all_jobs(request)

    if request.method == "POST":
        pass


@api_view(["GET"])
def get_job_status(request, job_id):
    job = find_job(job_id)

    if job is None:
        return Response(
            {"detail": "Job not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(serialize_job_status(job))
