# RFP Discovery Platform

## What ships now

- One React frontend with two entrypoints:
  - `http://localhost:3000/` for the virtual desktop shell
  - `http://localhost:3000/pipeline` for the full-screen pipeline dashboard
- One Flask + Postgres backend on `http://localhost:5000`
- A persisted 10-step pipeline API that restores the latest run after reloads

## Architecture

```text
React SPA (CRA)
  /                       -> desktop shell
  /pipeline               -> standalone pipeline dashboard
  frontend/src/features/pipeline/*

        HTTP / JSON

Flask API
  GET  /health
  GET  /sources
  POST /sources
  PATCH/DELETE /sources/:id
  GET/PATCH /rfps/:id
  POST /run-pipeline                     (legacy wrapper)
  POST /api/pipeline/runs               (canonical)
  GET  /api/pipeline/runs/latest        (canonical)
  GET  /api/pipeline/runs/:run_id       (canonical)
  POST /api/pipeline/runs/:run_id/steps/:step_key

        psycopg2

PostgreSQL
  source_urls
  crawl_runs
  rfp_listings
  rfp_documents
  tasks
  skills
  certifications
  eligibility_assessments
  risk_register
  hil_reviews
  audit_logs
  pipeline_runs
  pipeline_step_runs
```

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Database

Create `rfp_db` first if you are using local Postgres:

```bash
psql -U postgres -c "CREATE DATABASE rfp_db;"
```

Tables are created automatically on backend startup.

## Key environment values

### `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_db
DB_USER=postgres
DB_PASSWORD=password
DB_SSLMODE=prefer
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=false
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

## Canonical pipeline flow

1. `POST /api/pipeline/runs`
2. `POST /api/pipeline/runs/:run_id/steps/crawl`
3. `POST /api/pipeline/runs/:run_id/steps/filter`
4. `POST /api/pipeline/runs/:run_id/steps/download`
5. `POST /api/pipeline/runs/:run_id/steps/extract`
6. `POST /api/pipeline/runs/:run_id/steps/certs`
7. `POST /api/pipeline/runs/:run_id/steps/risk`
8. `POST /api/pipeline/runs/:run_id/steps/convert`
9. `POST /api/pipeline/runs/:run_id/steps/hil`
10. `POST /api/pipeline/runs/:run_id/steps/forward`
11. `POST /api/pipeline/runs/:run_id/steps/log`

Use `GET /api/pipeline/runs/latest` to restore the most recent run state after refresh.

## Verification commands

```bash
cd backend
pytest
```

```bash
cd frontend
npm run build
```
