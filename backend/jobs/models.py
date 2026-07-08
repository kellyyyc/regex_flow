from django.db import models


class Job(models.Model):
    class Status(models.TextChoices):
        QUEUED = "QUEUED", "Queued"
        RUNNING = "RUNNING", "Running"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"

    input_file = models.FileField(upload_to="uploads/")
    result_file = models.FileField(upload_to="results/", blank=True)

    file_name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.QUEUED,
    )

    instruction = models.TextField()
    regex_pattern = models.TextField(blank=True)
    replacement = models.TextField(blank=True)
    target_columns = models.JSONField(default=list, blank=True)

    num_processed = models.PositiveBigIntegerField(default=0)
    row_count = models.PositiveBigIntegerField(default=0)
    column_headers = models.JSONField(default=list, blank=True)
    preview_rows = models.JSONField(default=list, blank=True)
    cancel_requested = models.BooleanField(default=False)

    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Job #{self.id} ({self.status})"
