# Regex Flow

## Architecture Overview

Regex Flow uses an asynchronous processing pipeline so uploads return quickly and long-running file transformations do not block the web request.

```text
React -> Django API -> Celery task -> Redis -> PySpark/file processor -> result file -> React polling/result view
```

The React frontend uploads a file and natural-language instruction to the Django API. Django validates the request, creates a persisted job record, queues a Celery task, and immediately returns the job ID. Django does not perform heavy parsing, regex generation, or file transformation inside the request/response cycle.

Celery runs the background processing work. Redis is used as the Celery broker/result backend and as the cache for generated regex patterns. The worker validates the input file, converts Excel uploads to CSV when needed, generates or reuses the regex, applies the transformation through the file processor, writes the processed result file, and updates job status/progress. The frontend polls the status endpoint until the job reaches `SUCCESS` or `FAILED`, then displays the paginated result view.

## Run Locally

Create a root `.env` file before starting the app. The frontend, backend, Celery worker, Redis, and Spark settings are all read from this single file.

Required `.env` values:

```env
DEBUG=True
SECRET_KEY=replace-with-local-secret

DOMAIN=localhost
WWW_DOMAIN=localhost
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
REDIS_CACHE_URL=redis://redis:6379/2

SPARK_MASTER_URL=local[*]

VITE_API_URL=http://localhost:8000/api
VITE_ALLOWED_HOSTS=localhost,127.0.0.1

OPENAI_API_KEY=replace-with-openai-key
OPENAI_MODEL=gpt-4o-mini
```

Build and start the stack:

```bash
docker compose build
docker compose up
```

Run database migrations:

```bash
docker compose exec backend python manage.py migrate
```

Open the frontend:

```text
http://localhost:5173
```

Useful logs:

```bash
docker compose logs -f backend
docker compose logs -f worker
docker compose logs -f frontend
```
