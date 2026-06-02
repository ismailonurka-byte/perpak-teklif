# PERPAK Teklif Yönetim Sistemi

Karton kutu + oluklu koli üretimi için teklif/proforma yönetim platformu.

## Mimari

```
backend/    FastAPI + SQLAlchemy + Alembic + PostgreSQL
frontend/   React 19 + Vite + TypeScript + Tailwind + shadcn/ui
docker/     Postgres + Nginx
```

## Hızlı Başlangıç

```bash
# 1. Ortam değişkenleri
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Tüm servisleri başlat
docker compose up -d

# 3. Master verileri yükle (Excel'den taşıma)
docker compose exec backend python scripts/seed_master_data.py

# 4. İlk admin kullanıcı oluştur (admin / admin123)
docker compose exec backend python scripts/create_admin.py
```

URL'ler:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Dökümanı: http://localhost:8000/docs
- Postgres: localhost:5432 (kullanıcı: perpak, şifre: perpak)

## Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam yetki — kullanıcı, fiyat, atama yönetimi |
| SATIS | Kendi teklifleri — CRUD, proforma, müşteri ekleme |
| URETIM | Onaylanan teklifler — sadece okuma |

## Kalem Tipleri (extensible)

Şu an: `KUTU_OFSET`, `KUTU_FLEKSO`, `KOLI`

Yeni tip eklemek için `kalem_tipi` tablosuna kayıt + `services/pricing/`
içine hesaplama fonksiyonu eklenir. Migration gerekmez.

## Dökümanlar

- `docs/data-model.md` — Veri modeli ve ER şeması
- `docs/pricing.md` — Hesaplama formülleri (Excel'den birebir)
- `docs/api.md` — API endpoint listesi
