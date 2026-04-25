@echo off
setlocal enabledelayedexpansion

echo =========================================
echo  RFP Frontend - Local Start (Windows)
echo =========================================

:: ── Check Node ───────────────────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: ── Install packages if node_modules is missing ─────────────────────────────
if not exist node_modules (
    echo [INFO] Installing npm packages...
    npm install
)

:: ── Copy .env if it doesn't exist ───────────────────────────────────────────
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [INFO] Created .env from .env.example - edit REACT_APP_API_URL if needed.
    )
)

:: ── Start dev server ────────────────────────────────────────────────────────
echo.
echo [INFO] Starting React dev server on http://localhost:3000
echo [INFO] Standalone pipeline route: http://localhost:3000/pipeline
echo [INFO] Backend must be running on http://localhost:5000
echo [INFO] Press Ctrl+C to stop.
echo.
npm start

endlocal
pause
