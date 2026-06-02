# İskelet Durumu — Faz 1

## ✅ Tamamlanan

### Backend
- FastAPI iskelet + Docker
- PostgreSQL bağlantısı + SQLAlchemy 2.0
- JWT auth (access + refresh) + bcrypt
- Tüm SQLAlchemy modelleri (kullanıcı, firma, master tablolar, teklif, kalem, durum log)
- Pydantic schemas
- API endpoint'leri:
  - `POST /api/v1/auth/login`, `/refresh`, `GET /me`
  - `GET/POST/PATCH/DELETE /api/v1/kullanici` (admin)
  - `GET/POST/PATCH /api/v1/firma`
  - `GET/POST/PATCH/DELETE /api/v1/teklif`, `GET /_/ozet`
  - `GET /api/v1/master/all`
  - `POST /api/v1/hesaplama/preview`
- Hesaplama servisleri — Excel formüllerinden birebir:
  - `calc_kutu_ofset` (OFSET KUTU HESAPLAMA bloğu)
  - `calc_kutu_flekso` (FLEKSO KUTU HESAPLAMA bloğu)
  - `calc_koli` (KOLİ HESAPLAMA bloğu)
- Alembic migration (`0001_initial.py`)
- Seed scriptleri:
  - `create_admin.py` (admin / admin123)
  - `seed_master_data.py` (Excel'den taşınmış tüm dropdown verisi + birim fiyatlar + kalem tipi şemaları)

### Frontend
- Vite + React 19 + TypeScript + Tailwind + shadcn temelleri
- TanStack Query setup
- Axios + JWT interceptor + otomatik refresh
- Zustand auth store (kullanıcı persistlenir)
- Login sayfası (gradient bg, eye toggle, hata mesajları)
- Layout — masaüstü sidebar + mobil drawer (responsive)
- Dashboard iskeleti (4 KPI kartı + son teklifler placeholder)

## ⏳ Sıradakiler (Faz 2)

- Teklif liste sayfası (filtreler + tablo/kart görünüm)
- Teklif editör sayfası (polimorfik satır ekleme + dinamik form)
- Müşteri yönetimi (CRUD)
- Proforma PDF üretimi (WeasyPrint + HTML şablon)
- Yönetici Kanban görünümü (durum bazlı kart akışı)
- Açık teklif uyarıları (renk badge'leri)

## 🔐 İlk Giriş

```
Kullanıcı adı: admin
Şifre        : admin123
```
İlk giriş sonrasında değiştirin (Ayarlar → Profil).
