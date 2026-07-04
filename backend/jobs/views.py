from rest_framework.decorators import api_view
from rest_framework.response import Response

from .mock_data import MOCK_JOBS


def find_job(job_id: int):
    for job in MOCK_JOBS:
        if job["id"] == job_id:
            return job

    return None


def serialize_job_status(job):
    return {
        "id": job["id"],
        "file_name": job["file_name"],
        "status": job["status"],
        "num_processed": job["num_processed"],
        "row_count": job["row_count"],
    }


def get_all_jobs(request):
    jobs = [serialize_job_status(job) for job in MOCK_JOBS]
    return Response(jobs)


@api_view(["GET", "POST"])
def jobs(request):
    if request.method == "GET":
        return get_all_jobs(request)

    if request.method == "POST":
        pass
