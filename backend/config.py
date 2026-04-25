import os
from dotenv import load_dotenv

# Load variables from .env (no-op if the file doesn't exist, e.g. inside Docker
# where env vars are injected directly).
load_dotenv()

# ─── Database Configuration ───────────────────────────────────────────────────
DB_CONFIG = {
    "host":     os.getenv("DB_HOST",     "localhost"),
    "port":     int(os.getenv("DB_PORT", 5432)),
    "dbname":   os.getenv("DB_NAME",     "rfp_db"),
    "user":     os.getenv("DB_USER",     "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "sslmode":  os.getenv("DB_SSLMODE",  "prefer"),
}

# ─── Flask Configuration ───────────────────────────────────────────────────────
FLASK_HOST  = os.getenv("FLASK_HOST",  "0.0.0.0")
FLASK_PORT  = int(os.getenv("FLASK_PORT", 5000))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
