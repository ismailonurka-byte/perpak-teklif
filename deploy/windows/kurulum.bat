@echo off
REM ============================================================
REM  Vanto - Tam Otomatik Kurulum (Windows)
REM  Yonetici izni alir ve kurulum.ps1'i calistirir.
REM ============================================================
title Vanto Kurulum

REM Yonetici mi? Degilse yukseltilmis olarak yeniden baslat.
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Yonetici izni gerekiyor, onay penceresi acilacak...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kurulum.ps1"
echo.
echo Bitti. Kapatmak icin bir tusa basin.
pause >nul
