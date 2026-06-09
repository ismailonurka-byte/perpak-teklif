#!/usr/bin/env bash
# ============================================================
#  Vanto teslim paketi olusturur (Mac/Linux'ta calistir).
#  - frontend'i build eder
#  - backend + hazir frontend (static) + Windows kurulum scriptlerini toplar
#  - vanto-kurulum.zip ureticir  (Cumartesi sunucuya goturulecek)
#
#  Kullanim:  bash deploy/paket-yap.sh
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMPPARENT="$(mktemp -d)"
STAGE="$TMPPARENT/vanto"
OUT="$ROOT/vanto-kurulum.zip"

echo "==> Frontend build (production)..."
( cd "$ROOT/frontend" && npm install --silent && npm run build )

echo "==> Dosyalar toplaniyor..."
mkdir -p "$STAGE/backend" "$STAGE/deploy/windows"

# Backend kodu (gereksizleri haric)
rsync -a --delete \
  --exclude '.venv' --exclude '__pycache__' --exclude '*.pyc' \
  --exclude '*.db' --exclude '*.db-shm' --exclude '*.db-wal' \
  --exclude '.env' --exclude 'static' \
  "$ROOT/backend/" "$STAGE/backend/"

# Hazir frontend -> backend/static
mkdir -p "$STAGE/backend/static"
cp -R "$ROOT/frontend/dist/." "$STAGE/backend/static/"

# Windows kurulum scriptleri
cp "$ROOT/deploy/windows/"*.bat "$ROOT/deploy/windows/"*.ps1 "$ROOT/deploy/windows/OKUBENI.txt" "$STAGE/deploy/windows/"

echo "==> ZIP olusturuluyor..."
rm -f "$OUT"
( cd "$TMPPARENT" && zip -rq "$OUT" "vanto" )
rm -rf "$TMPPARENT"

echo ""
echo "HAZIR -> $OUT"
echo "Sunucuda: ZIP'i ac, deploy\\windows\\kurulum.bat'i Yonetici olarak calistir."
