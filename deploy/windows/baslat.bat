@echo off
REM Vanto'yu elle baslatir (servis yerine manuel calistirmak icin).
title Vanto
cd /d "%~dp0..\..\backend"
if not exist ".venv\Scripts\python.exe" (
  echo Once kurulum.bat calistirin.
  pause
  exit /b
)
echo Vanto baslatiliyor... (http://localhost:8000)  Durdurmak icin: Ctrl+C
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
