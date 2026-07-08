# Regex Flow

## Architecture Overview

Regex Flow uses an asynchronous processing pipeline so uploads return quickly and long-running file transformations do not block the web request.

```text
React -> Django API -> Celery task -> Redis -> file processor -> result CSV -> React polling/result view
```

The React frontend uploads a file and natural-language instruction to the Django API. Django validates the request, creates a persisted job record, queues a Celery task, and immediately returns the job ID. Django does not perform heavy parsing, regex generation, or file transformation inside the request/response cycle.

Celery runs the background processing work. Redis is used as the Celery broker/result backend and as the cache for generated regex patterns. The worker validates the input file, converts Excel uploads to CSV when needed, generates or reuses the regex, applies the transformation through the file processor, writes the processed result file, and updates job status/progress. The frontend polls the status endpoint until the job reaches `SUCCESS` or `FAILED`, then displays the stored preview and result download link.

## Implemented Features

- React frontend for file upload, job submission, job status polling, result preview, and result download.
- Django REST API for job creation, job listing, job status, cancellation, result preview, and downloads.
- Celery worker for asynchronous background processing.
- Redis used as the Celery broker/result backend and regex cache.
- LLM-based natural-language to regex generation.
- Regex validation before processing.
- CSV and Excel upload support, with Excel converted to CSV.
- Persisted job status, progress, errors, preview rows, and result files.
- Docker Compose setup for local development and production deployment.
- Caddy-based HTTPS deployment on a single VM.

## Processing Pipeline

1. The user uploads a CSV or Excel file with a natural-language replacement instruction.
2. The Django API creates a persisted `Job` with `QUEUED` status and dispatches the Celery task.
3. The Celery worker validates that the uploaded file exists and has a supported format.
4. Excel uploads are converted to CSV before the processing path runs.
5. The LLM converts the natural-language instruction into a regex pattern, reusing the Redis cache when the same instruction has already been processed.
6. The generated regex is validated before it is applied to the file.
7. The file processor applies the replacement and writes the processed output as a CSV result file.
8. The frontend polls the job status endpoint for progress and then displays the stored preview/result when processing completes.

## API Endpoints

The backend API is mounted under `/api/jobs/`.

| Method | Route                    | Purpose                                                                                                  |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/jobs/`             | List existing jobs.                                                                                      |
| `POST` | `/api/jobs/`             | Upload a file and instruction, create a queued job, and return the job ID.                               |
| `GET`  | `/api/jobs/{id}/`        | Fetch job status, progress, metadata, and errors.                                                        |
| `GET`  | `/api/jobs/{id}/result/` | Fetch the processed result metadata, stored preview rows, and result download URL once the job succeeds. |
| `POST` | `/api/jobs/{id}/cancel/` | Request cancellation for a queued or running job.                                                        |

## Run Locally

Create a root `.env` file before starting the app. The frontend, backend, Celery worker, and Redis settings are all read from this single file.

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

VITE_API_URL=/api
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
http://localhost
```

Useful logs:

```bash
docker compose logs -f backend
docker compose logs -f worker
docker compose logs -f frontend
```

## Production Deployment

Use the production compose file when running behind Caddy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

Caddy serves HTTPS on ports `80` and `443`. It proxies `/api/*` and `/admin*` to the Django backend container, serves `/media/*` directly from the shared media volume, and proxies `/` plus all other frontend routes to the React frontend container.

## Tradeoffs / Limitations

- The active Celery path currently uses the file processor instead of PySpark. This keeps the demo reliable end-to-end, but does not provide distributed processing for million-row files.
- A single `Job` model stores upload, processing, result, status, progress, and preview data. This keeps the API simple, but a larger system would split uploads from transformation jobs.
- The frontend uses a single-step upload/instruction flow. This is fast to use, but users cannot preview columns or manually choose target columns before processing.
- Redis is used for Celery broker/result backend and regex caching. Cancellation is app-level through `cancel_requested`; the app does not persist Celery task IDs for direct retries.
- Regex validation uses runtime timeout checks and rejects empty-matching patterns. This reduces ReDoS risk, but it is not a complete static regex safety analyser.
- LLM results are cached by normalized instruction text. A stronger cache key would also include the model and available columns.
- The production Compose setup is demo-friendly on one VM. The frontend still uses Vite dev server, so a stronger setup would serve a built static bundle.
- SQLite keeps the demo small, but Postgres would be better for concurrent users, larger job history, and frequent progress updates.
- The result endpoint returns stored preview rows plus a CSV download URL. It does not provide true pagination through the full output.

## Future Improvements

- Replace the Vite dev server in production with a built static frontend served through Caddy or Nginx.
- Move the regex replacement step into Spark DataFrame operations for distributed processing.
- Split the current `Job` model into separate upload, transformation job, and result models.
- Add column preview and target-column selection before processing.
- Replace SQLite with Postgres for stronger concurrent write support.
