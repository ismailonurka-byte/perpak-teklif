# Vanto — Teknik Dokümantasyon

> **Bu dosya projenin tek referans noktasıdır.** Başka bir bilgisayardan devam ederken önce bunu oku.
> Konum: depo kökü → `TEKNIK_DOKUMANTASYON.md` · Repo: `github.com/ismailonurka-byte/perpak-teklif`
> Son güncelleme kapsamı: Faz 0 (sağlamlaştırma) + Dinamik RBAC + "Vanto" yeniden adlandırma + `.js` teknik borç temizliği.

---

## 1. Vanto nedir?

Perpak Ambalaj için, mevcut **teklif yönetim** uygulamasından evrilen **kapsayıcı üretim/operasyon portalı**. Hedef kapsam:
- Teklif yönetimi (mevcut), müşteri, fiyat, raporlar
- Üretim planlama & gerçekleşme, duruş/fire takibi (planlanan)
- Haftalık H&M + satış girişi, dashboard raporlama (planlanan)
- ERP entegrasyonu: sipariş / SAS / depo giriş (planlanan)

İsim: **Vanto** ("vantage" = üst bakış/dashboard). Marka her yerde `Vanto`; firma sahibi Perpak.

---

## 2. Teknoloji yığını

| Katman | Teknoloji |
|---|---|
| Backend | FastAPI 0.115 · SQLAlchemy 2.0 · Alembic · Pydantic v2 · python-jose (JWT) · WeasyPrint 68.1 + pydyf 0.12.1 (PDF) |
| Frontend | React 19 · Vite 5 · TypeScript · Tailwind 3 · React Query · Zustand · React Router · react-hook-form + zod |
| Veritabanı | SQLite (varsayılan, yerel/on-prem) — **Postgres'e hazır** (kod DB-tipine göre dallanıyor) |
| Deploy | Tek Docker imajı (frontend build → backend static serve). Render (demo) veya on-prem. |

---

## 3. Dizin yapısı (önemli yollar)

```
backend/
  app/
    main.py                  # FastAPI app, router kayıt, lifespan (RBAC seed), static serve
    core/
      config.py              # Settings (DATABASE_URL, SECRET_KEY, SEED_DEMO ...)
      security.py            # hash/verify, JWT
      deps.py                # get_current_user, require_permission(), require_admin, izin_kapsami()
      permissions.py         # ★ İZİN KATALOĞU (RBAC source of truth) — yeni ekran izni BURAYA
      rbac.py                # katalog senkron, rol seed, etkin_izinler(), kullanici_rolleri()
    db/
      session.py             # engine (SQLite WAL / Postgres pool dallanması), Base, get_db
      models.py              # tüm tablolar + RBAC (Rol, Izin, RolIzin, KullaniciRol)
      migrations/versions/   # 0001 initial, 0002 unvan, 0003 RBAC
    api/v1/                  # auth, kullanici, firma, teklif, master, hesaplama, fiyat, rapor, rol
    schemas/                 # pydantic şemalar (auth, kullanici, rol, firma, teklif ...)
    services/
      pricing/               # registry pattern — kalem tipi hesaplama (genişletilebilir)
      pdf/                   # proforma.py + render_cli.py + runner.py (PDF ayrı süreçte üretilir)
  scripts/                   # create_admin.py, seed_*.py
  requirements.txt
frontend/
  src/
    app/                     # App.tsx (route+guard), Layout.tsx (nav)
    features/                # auth, teklif, musteri, admin (Roller, Kullanıcılar, Fiyat), rapor
    components/ui/           # Modal, Toast, Badge, Confirm
    hooks/                   # useAuth.ts (+ useCan/useIzin), useMaster.ts
    lib/                     # api.ts (axios + token refresh), format.ts
    types/index.ts           # tipler (Kullanici, RolT, IzinKatalog ...)
  tailwind.config.js, index.css   # tasarım sistemi (brand lacivert + accent turuncu)
start.sh                     # deploy boot: alembic upgrade + (SEED_DEMO ise) seed + uvicorn
Dockerfile, render.yaml, docker-compose.yml
```

---

## 4. Yerel kurulum (başka PC'den devam)

> Not: `perpak.db` (SQLite) ve `.env` git'te **yoktur** (gitignore). Yeni makinede sıfırdan kurulur.

**Backend**
```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
# .env oluştur (yoksa):
#   DATABASE_URL=sqlite:///./perpak.db
#   SECRET_KEY=degistir-bunu
.venv/bin/alembic upgrade head            # şemayı kurar (RBAC dahil)
.venv/bin/python scripts/create_admin.py  # admin / admin123
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
İstersen demo veri (örnek müşteri/teklif/mehmetdogan): `SEED_DEMO=true` env ile `start.sh` veya `scripts/seed_*.py` çalıştır.

**Frontend**
```bash
cd frontend
npm install
npm run dev        # http://localhost:9009  (API → localhost:8000)
```

**Giriş:** `admin` / `admin123`

> ⚠️ SQLite + alembic damgası: Mevcut bir DB'de `alembic upgrade` "tablo zaten var" derse, şema 0002 seviyesindedir → `alembic stamp 0002 && alembic upgrade head`.

---

## 5. Veritabanı & kalıcılık

- **Karar:** Veri **dışarı gönderilmez** → yerel/on-prem. Harici (Neon/Render Postgres) **kullanılmıyor**.
- **Yerel dev:** SQLite `perpak.db` + **WAL modu** (eşzamanlı okuma; kalıcı diskte veri kaybı yok). `session.py` SQLite'ta pool argümanı vermez, `check_same_thread=False` + `PRAGMA journal_mode=WAL, busy_timeout, foreign_keys`.
- **Postgres'e geçiş hazır:** `DATABASE_URL=postgresql+psycopg://...` ver → `session.py` otomatik pool'lu engine kurar. Migration'lar portable. `requirements.txt`'te `psycopg[binary]` aktif. (Dev makinesinde Homebrew Postgres 16 zaten kurulu, `perpak_teklif` DB mevcut — istenirse anında geçilebilir.)
- **Render free uyarısı:** Diski ephemeral → her restart'ta SQLite sıfırlanır. Bu yüzden Render yalnız **atılabilir demo**dur; gerçek veri on-prem'de tutulacak (karar Perpak sunucu ziyaretinde netleşecek).
- **Production-safe boot:** `start.sh` demo seed'lerini yalnız `SEED_DEMO=true` iken çalıştırır → prod'da gerçek veri resetlenmez. `alembic upgrade` her zaman çalışır.

---

## 6. ★ RBAC — Dinamik Rol & İzin Sistemi (bu sürümün ana işi)

### 6.1 Kavram
- **Roller dinamiktir** — admin "Roller" ekranından oluşturur/siler. Kodda sabit rol yok.
- **Kullanıcı ↔ çoklu rol** — bir kullanıcıya birden fazla rol atanır; izinleri **birleşir**.
- **İzinler bir katalog**tan gelir (`permissions.py`), her ekran/aksiyon için ayrı; admin bunları rollere atar.
- **Aksiyonlar bağımsız** — görme/oluşturma/düzenleme/silme ayrı izinler (ör. "görür+oluşturur+düzenler ama silemez").
- **Kapsam (scope)** — bazı izinler satır bazlı: `own` (kendi kayıtları) / `all` (tümü). Rol-izin atamasında saklanır.

### 6.2 Veri modeli (`backend/app/db/models.py`)
| Tablo | İçerik |
|---|---|
| `rol` | id, ad (uniq), aciklama, **sistem_rol** (korumalı, hep tam yetkili), aktif |
| `izin` | kod (PK), gorunen_ad, modul, ekran, aksiyon, aciklama, kapsam_destekler, sira |
| `rol_izin` | rol_id + izin_kod (PK), **kapsam** (own/all/null) |
| `kullanici_rol` | kullanici_id + rol_id (PK) |

`Kullanici.rol` (eski tekil string) geriye dönük uyum için duruyor; gerçek yetki artık rollerden gelir.

### 6.3 İzin kataloğu (`backend/app/core/permissions.py`) — **TEK KAYNAK**
Her izin: `kod` (`alan.aksiyon`), `gorunen_ad`, `modul`, `ekran`, `aksiyon`, `aciklama`, `kapsam` (own/all destekler mi).
Açılışta (`main.py` lifespan → `rbac.katalog_senkronize`) DB'ye **upsert** edilir; admin UI'da otomatik görünür.

Mevcut izinler (18): `dashboard.read`, `teklif.read*`, `teklif.create`, `teklif.update*`, `teklif.delete*`, `teklif.durum*`, `teklif.pdf*`, `maliyet.read`, `firma.read/create/update`, `rapor.read`, `fiyat.read/update`, `master.read/update`, `kullanici.manage`, `rol.manage`  (`*` = scope destekler).

### 6.4 Zorlama (enforcement)
- Backend: her endpoint `Depends(require_permission("kod"))` (`deps.py`). Satır bazlı için `izin_kapsami(db, user, kod)` → `own`/`all`/`None` (örn. `teklif.py` `_teklif_hepsi()`).
- `etkin_izinler(db, user)` → tüm rollerin izin birleşimi `{kod: kapsam}`. Sistem rolü → tüm katalog `all`.
- `require_admin` / `require_satis_or_admin` artık RBAC üzerinden çalışır (geriye dönük).
- Frontend: `/auth/login` ve `/auth/me` kullanıcının `roller` + `izinler` (kod listesi) döndürür → Zustand `useAuth`. `useCan()`/`useIzin(kod)` ile ekran/aksiyon gizlenir; `App.tsx` `RequirePermission`, `Layout.tsx` nav izne göre filtreler.

### 6.5 Seed / başlangıç
- `rbac.rolleri_seed_et`: **"Yönetici"** sistem rolü (tüm izinler, silinemez) + **"Satış"** yardımcı rolü (yoksa). Mevcut `rol="ADMIN"` kullanıcı → Yönetici, `rol="SATIS"` → Satış otomatik atanır.
- Admin API: `backend/app/api/v1/rol.py` → `GET /rol/izinler` (katalog), `GET/POST/PATCH/DELETE /rol`, `PUT /rol/{id}/izinler`, `GET/PUT /rol/kullanici/{user_id}` (kullanıcıya rol atama).
- Frontend: `features/admin/RollerPage.tsx` (rol + izin matrisi, modül/ekran gruplu, kapsam seçer), `KullaniciListPage.tsx` (kullanıcıya çoklu rol).

### 6.6 ⚖️ PROJE KURALI (kalıcı)
> **Bir ekran (sayfa/route) veya endpoint yazıldığında, izni AYNI ANDA tanımlanır.**
> - Backend: endpoint'e `require_permission("alan.aksiyon")` + izni `permissions.py` kataloğuna ekle.
> - Frontend: route'a `RequirePermission`, nav'a `izin` alanı.
> Yetkisiz ekran/endpoint merge edilmez.

**Yeni ekran eklerken checklist:**
1. `permissions.py`'ye izin(ler)i ekle (modul/ekran/aksiyon/aciklama).
2. Backend endpoint(ler)ine `require_permission(...)`.
3. Frontend: sayfa + `App.tsx` route guard + `Layout.tsx` nav `izin`.
4. (Gerekirse) yeni domain için `models.py` + Alembic migration; hesaplama gerekiyorsa pricing **registry** desenini kopyala.

---

## 7. PDF üretimi

`teklif.py` `/{id}/pdf` → `services/pdf/runner.py` PDF'i **ayrı alt-süreçte** (`render_cli.py`, WeasyPrint) üretir. Böylece ana uvicorn süreci weasyprint'i hiç yüklemez (sabit ~86 MB), bellek her PDF sonrası geri döner — Render free 512 MB'a takılmaz. Hata olursa gerçek sebep loglanır + istemciye döner.
Sürüm kilidi kritik: **weasyprint==68.1 + pydyf==0.12.1** (uyumsuzluk "super has no attribute transform" hatası verir).

**İki belge türü** (TeklifEditorPage'de "PDF / Belge ▾" menüsü):
- **Proforma** (`/{id}/pdf`, izin `teklif.pdf`) — müşteri teklifi. Baskı sütunu makine adı değil **renk isimleri** gösterir; Satış Temsilcisi bloğu yoktur.
- **Sipariş Formu** (`/{id}/siparis-pdf`, izin `teklif.siparis`) — iç/ERP belgesi. `siparis_formu.html`; her kalem ayrı blokta **tüm spec alanları** (şema etiketleriyle) + Adet/Birim/Toplam + Açıklama + **Maliyet Kırılımı**. Çok kalemli, ERP girişine uygun. `render_cli.py <id> siparis` ile aynı alt-süreçte üretilir.

---

## 8. Deployment

- **Tek Docker imajı:** kök `Dockerfile` (node ile frontend build → python backend, `dist` → `backend/static`). `start.sh` = `alembic upgrade head` + (SEED_DEMO ise seed) + `uvicorn`.
- **Render (demo):** `render.yaml` blueprint, `plan: free`, SQLite (ephemeral — demo). Manuel deploy. CORS prod'da tek origin'e indirilmeli (`CORS_ORIGINS`).
- **On-prem (hedef, Perpak):** Cumartesi sunucu/ERP incelemesinde netleşecek. Windows sunucu olası → Docker'sız: Python + SQLite/Postgres ile `start.sh` benzeri tek komut; veya taşınabilir Postgres. Docker tercih edilirse Windows'ta WSL2/Linux VM + ücretsiz Docker Engine (Desktop gerekmez).

---

## 9. Bu sürümde yapılan değişiklikler (özet)

**Faz 0 — sağlamlaştırma**
- `session.py`: DB-tipine göre engine dallanması + SQLite WAL.
- `config.py`: `SEED_DEMO` bayrağı. `start.sh`: demo seed'ler yalnız `SEED_DEMO=true`.
- `.js` teknik borcu: kaynak ağacındaki derlenmiş `.js`'ler silindi, `tsconfig.json` `noEmit:true`, build `tsc --noEmit && vite build`, `.gitignore` + `vite.config.ts resolve.extensions`. (Artık eski `.js` paketlenip "Render'da hâlâ eski kod" sorunu olmaz.)

**Dinamik RBAC**
- Modeller + migration `0003`, katalog (`permissions.py`), servis (`rbac.py`), `require_permission` (`deps.py`), tüm endpoint'lere granular izin, admin API (`rol.py`), `/auth/me` izin döndürür.
- Frontend: `useAuth` izinler + `useCan`, `App` route guard, `Layout` nav, `RollerPage` (yeni), `KullaniciListPage` rol atama.

**Yeniden adlandırma:** Perpak Teklif → **Vanto** (index.html, login, Layout, package.json, APP_NAME, env, render.yaml).

---

## 10. Yol haritası (sonraki fazlar)

- **Faz 1 (kalan):** ortak `TimestampMixin`/`SoftDeleteMixin`, jenerik `DegisiklikLog` (field-level audit), `React.lazy` kod bölme, pytest test altyapısı.
- **Faz 2 (tasarım sistemi):** Recharts (dashboard grafikleri), yeniden kullanılabilir `DataTable` (TanStack Table), react-hook-form+zod devreye alma, ek UI (combobox/date-picker/tabs/pagination).
- **Faz 3 (domain modülleri):** Üretim Planlama → Duruş/Fire → Satış/H&M → Dashboard'lar (her biri modül şablonu + RBAC izniyle).
- **Faz 4 (ERP):** `services/erp/` adapter (anti-corruption layer) + registry; sipariş/SAS/depo. Cumartesi ERP incelemesine bağlı.

Detaylı plan (yerel, repo dışı): `~/.claude/plans/d-n-netle-en-konu-bizim-prancy-wozniak.md`

---

## 11. Hızlı referans

| Ne | Nerede |
|---|---|
| Yeni izin tanımı | `backend/app/core/permissions.py` |
| İzin zorlama / scope | `backend/app/core/deps.py` (`require_permission`, `izin_kapsami`) |
| Rol/izin mantığı | `backend/app/core/rbac.py` |
| Rol yönetim API | `backend/app/api/v1/rol.py` |
| Rol yönetim ekranı | `frontend/src/features/admin/RollerPage.tsx` |
| Kullanıcıya rol atama | `frontend/src/features/admin/KullaniciListPage.tsx` |
| Frontend izin kontrolü | `frontend/src/hooks/useAuth.ts` (`useCan`, `useIzin`) |
| Route guard | `frontend/src/app/App.tsx` (`RequirePermission`) |
| Nav | `frontend/src/app/Layout.tsx` |
| Admin giriş | `admin` / `admin123` |
| Backend | `localhost:8000` · Frontend `localhost:9009` |
