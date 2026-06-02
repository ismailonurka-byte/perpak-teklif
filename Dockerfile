# ───────────────────────────────────────────────────────────────────────────
# Stage 1: Frontend build (Node)
# ───────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --silent

COPY frontend ./
RUN npm run build


# ───────────────────────────────────────────────────────────────────────────
# Stage 2: Python backend + frontend statik dosyaları
# ───────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Sistem kütüphaneleri — WeasyPrint PDF için gerekli
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango-1.0-0 libpangoft2-1.0-0 \
    libcairo2 libgdk-pixbuf-2.0-0 \
    libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıkları
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend kodu
COPY backend ./

# Frontend build çıktısını backend/static/'e kopyala
COPY --from=frontend-builder /app/dist ./static

# Startup script — DB migration + seed + admin
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
