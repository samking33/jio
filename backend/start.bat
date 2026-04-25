@echo off
setlocal enabledelayedexpansion

echo =========================================
echo  RFP Backend - Local Start (Windows)
echo =========================================

:: ── Check Python ──────────────────────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

:: ── Create virtual environment if it doesn't exist ───────────────────────────
if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

:: ── Activate venv ─────────────────────────────────────────────────────────────
call venv\Scripts\activate.bat

:: ── Install / upgrade dependencies ───────────────────────────────────────────
echo [INFO] Installing dependencies...
pip install -r requirements.txt -q

:: ── Start Flask ───────────────────────────────────────────────────────────────
echo.
echo [INFO] Starting Flask on http://localhost:5000
echo [INFO] Press Ctrl+C to stop.
echo.
python app.py

endlocal
pause
