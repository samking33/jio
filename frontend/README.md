# RFP Virtual Work OS — Full Stack

## Architecture

```
browser  ──────────────────────────────────────────────────────
           React (port 3000)
           src/api/api.js          ← single fetch wrapper
           src/hooks/useRFPs.js    ← shared GET /rfps + POST /run-pipeline
           src/hooks/useBackendStatus.js  ← health-check polling

           ↕  HTTP  (CORS enabled)

Flask    (port 5000)
           GET  /health
           GET  /rfps
           POST /run-pipeline

           ↕  psycopg2

PostgreSQL (port 5432)
           tables: sources, rfp_outputs
```

---

## Quick start

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE rfp_db;"
```

Tables are created automatically on first Flask startup via `init_db()`.

### 2. Backend

```bash
cd backend
cp .env.example .env          # edit credentials
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

Verify: `curl http://localhost:5000/health`  → `{"status":"ok"}`

### 3. Frontend

```bash
cd frontend
# .env already has REACT_APP_API_URL=http://localhost:5000
npm install
npm start
# → http://localhost:3000
```

---

## API reference

| Method | Path            | Body                        | Response                            |
|--------|-----------------|-----------------------------|-------------------------------------|
| GET    | `/health`       | —                           | `{ status: "ok" }`                  |
| GET    | `/rfps`         | —                           | `RFPRecord[]`                       |
| POST   | `/run-pipeline` | `{ urls?: string[] }`       | `{ status, sources_count, processed, message }` |

### RFPRecord shape
```json
{
  "id": 1,
  "rfp_id": "rfp-a3f9c12b",
  "source_url": "https://sam.gov/rfp/001",
  "output_json": {
    "rfp_id": "rfp-a3f9c12b",
    "source_url": "https://sam.gov/rfp/001",
    "result": "processed",
    "summary": "Mock summary for ...",
    "score": 0.88
  },
  "created_at": "2024-01-15T10:23:44"
}
```

---

## Integration layer files

| File | Purpose |
|------|---------|
| `frontend/src/api/api.js` | Fetch wrapper — all backend calls go here |
| `frontend/src/hooks/useRFPs.js` | Shared state: rfps, kpis, triggerPipeline |
| `frontend/src/hooks/useBackendStatus.js` | Polls `/health` every 15 s |
| `frontend/.env` | `REACT_APP_API_URL` env var |
| `backend/.env.example` | DB + Flask config template |

---

## Component → API mapping

| Component | API calls |
|-----------|-----------|
| `RFPDashboard` | `GET /rfps` (on mount + after pipeline), `POST /run-pipeline` (header button) |
| `PipelineRunner` | Same shared hook — always in sync with Dashboard |
| `StatusBar` | `GET /health` every 15 s → online/offline dot |
| `SourceManager` | Local state only (no backend endpoint yet) |
| `MeetingRoom` | Local state only |
