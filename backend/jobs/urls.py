from django.urls import path
from . import views

urlpatterns = [
    path("", views.jobs, name="jobs"),
    path("<int:job_id>/", views.get_job_status, name="job-status"),
]
