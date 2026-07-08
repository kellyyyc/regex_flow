# Regex Flow

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
