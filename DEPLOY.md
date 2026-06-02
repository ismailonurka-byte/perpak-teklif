# Render.com Ücretsiz Demo Yayınlama — Adım Adım

Bu kılavuz; projeyi GitHub'a yükleyip Render.com'da **ücretsiz** bir public URL ile firmaya açmanı sağlar.

## 0. Ön Hazırlık (Senden Geliyor)

İhtiyacın olanlar:
- **GitHub hesabı** (yoksa: https://github.com/signup)
- **Render hesabı** (yoksa: https://render.com — GitHub ile giriş yapabilirsin)
- Bilgisayarda `git` yüklü (Mac'te genelde var, `git --version` ile kontrol)

## 1. Projeyi Git Repo'su Olarak Başlat

Terminal'de proje klasörüne git ve şunları çalıştır:

```bash
cd ~/Documents/Proje/teklif

# Git başlat
git init

# Tüm dosyaları stage'le (.gitignore zaten gereksizleri dışta tutar)
git add .

# İlk commit
git commit -m "ilk yukleme — perpak teklif demo"
```

> **Not:** Render'a yüklenecek tek bir DB dosyası olmasın diye `.gitignore`'da `*.db` zaten dışlanıyor. Demo verisi `start.sh` her başlangıçta otomatik hazırlanır (admin + mehmetdogan + master tablolar). Bu sayede demo "temiz" durumda açılır.

## 2. GitHub'da Repo Aç + Yükle

1. https://github.com/new adresine git
2. **Repository name:** `perpak-teklif` (veya istediğin isim)
3. **Public** seçili kalsın (Render free tier public ister)
4. ⚠️ **README, .gitignore, license eklemek için kutucukları İŞARETLEME** (zaten dosyalar lokalde var)
5. **Create repository** tıkla

Sonra GitHub sana komut gösterir, terminale yapıştır:

```bash
git remote add origin https://github.com/SENIN_KULLANICI_ADIN/perpak-teklif.git
git branch -M main
git push -u origin main
```

GitHub kullanıcı adı/şifre sorarsa: GitHub son yıllarda **Personal Access Token** istiyor. Şifre yerine token kullanırsın:
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
- Yetki: `repo` işaretli
- Token'ı kopyala, şifre olarak yapıştır

## 3. Render.com'da Web Service Oluştur

İki yol var — birini seç:

### Yol A — Otomatik (render.yaml ile, ÖNERİLEN)

Proje kökündeki `render.yaml` dosyasını Render kendisi okur ve tüm ayarları yapar.

1. https://dashboard.render.com → **+ New** → **Blueprint**
2. **Connect a repository** → GitHub'ı bağla (izin ver) → `perpak-teklif` reposunu seç
3. Render `render.yaml`'i bulur, ayarları gösterir → **Apply**
4. Build başlar (~5-10 dk). Loglarda şunu görmelisin:
   ```
   Stage 1: Frontend build...
   Stage 2: Python backend + frontend statik dosyaları...
   [1/4] Alembic migration...
   [2/4] Master verisi...
   [3/4] Admin kullanıcı...
   [4/4] Demo kullanıcı: mehmetdogan...
   uvicorn başlatılıyor (port: 10000)
   ```
5. Üstte yeşil **Live** yazınca hazır. URL'in örnek: `https://perpak-teklif.onrender.com`

### Yol B — Manuel (render.yaml olmadan)

1. **+ New** → **Web Service**
2. **Build and deploy from a Git repository** → GitHub'ı bağla → repo seç
3. Ayarlar:
   - **Name:** perpak-teklif
   - **Region:** Frankfurt
   - **Branch:** main
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** **Free**
4. **Environment Variables** kısmında ekle:
   - `SECRET_KEY` → Generate (Render rastgele üretir)
   - `DATABASE_URL` → `sqlite:///./perpak.db`
   - `CORS_ORIGINS` → `*`
   - `SMTP_ENABLED` → `false`
5. **Create Web Service**

## 4. İlk Açılışı Test Et

URL'i tıkla (örnek: `https://perpak-teklif.onrender.com`). Karşına PERPAK login ekranı çıkmalı.

**Giriş bilgileri:**

| Rol | Kullanıcı Adı | Şifre |
|---|---|---|
| **Yönetici** | `admin` | `admin123` |
| **Satış Temsilcisi** | `mehmetdogan` | `mehmetdogan` |

İçeri girince:
- Sol menü: Panel, Teklifler, Kanban (admin), Müşteriler, Raporlar, Kullanıcılar (admin), Fiyatlar (admin)
- Demo veri olmadığı için boş — istersen 1-2 müşteri + örnek teklif ekleyip görüntüye katkı yapabilirsin

## 5. Firmaya Linki Gönder

URL'i WhatsApp/e-posta ile gönder. Mesaj örneği:

> Merhaba, PERPAK Teklif Sistemi'nin demo'sunu açtım.
> 🔗 https://perpak-teklif.onrender.com
> Giriş: kullanıcı **mehmetdogan** · şifre **mehmetdogan**
> Açılış yavaş olabilir (15 dk kullanılmayınca ücretsiz katmanda "uykuya" giriyor, ilk açılış ~30 saniye). Veriler demo amaçlı — ekleyebilirsin, sıfırlanabilir.

## 6. Bilmen Gerekenler — Ücretsiz Katman Sınırları

| Sınır | Açıklama |
|---|---|
| **15 dk inaktivite** | Hiç istek gelmezse uyur. Sonraki açılış ~30 sn yavaş. |
| **Aylık 750 saat** | Bir tek service için sınır rahat — endişe etme. |
| **Veri kalıcılığı YOK** | Container yeniden başlayınca SQLite sıfırlanır. Demo verisi `start.sh` ile her seferinde tekrar üretilir. |
| **SSL ücretsiz** | `https://` Render kendisi sağlar. |
| **Build süresi** | İlk build 5-10 dk. Sonraki commit'lerde 2-3 dk. |

## 7. Güncelleme Yapma (Sonraki Değişiklikler)

Lokalde değişiklik yap → commit + push:

```bash
git add .
git commit -m "değişiklik açıklaması"
git push
```

Render bunu görüp **otomatik** yeniden deploy yapar (~3-5 dk). Dashboard'da "Deploys" sekmesinden ilerlemeyi izleyebilirsin.

## 8. Sorun Giderme

### Açılış sırasında 502 / 503 hatası
- Çoğunlukla ilk uyandırma. **30 sn bekle**, sayfayı yenile.
- Hala olmazsa Render dashboard → Logs sekmesine bak.

### "Application failed to respond"
- Build log'unda hatayı ara. En sık:
  - **WeasyPrint kurulumu uzun sürmüş** → tekrar dene
  - **Frontend build başarısız** → `npm install` log'una bak

### "PDF üretilemedi"
- WeasyPrint için pango/cairo'nun Dockerfile'da yüklü olması lazım. Mevcut Dockerfile'da ekli (libpango-1.0-0, libcairo2).

### Giriş yapamıyorum
- `admin/admin123` veya `mehmetdogan/mehmetdogan` denedin mi?
- Hala olmazsa Render → Manual Deploy → "Clear build cache & deploy" → DB sıfırdan kurulur.

## 9. Kalıcı Veri İstersem (İleride)

Şu an demo amaçlı SQLite kullanıyorsun, container'la birlikte sıfırlanıyor. Veriler kalıcı olsun istersen:

1. Render → **+ New** → **PostgreSQL** → Free tier (90 gün, sonra silinir)
2. Oluşturulan **Internal Database URL**'i kopyala
3. Web Service → Environment → `DATABASE_URL` → o URL ile değiştir
4. `requirements.txt`'de `psycopg[binary]==3.2.3` satırını aktif et (`#` kaldır)
5. Push → Render yeniden build eder, artık veri kalıcı

## 10. Domain Bağlamak (Opsiyonel — Daha Profesyonel)

`perpak.com.tr` gibi bir alan adın varsa:
- Render → Web Service → Settings → Custom Domains
- Alan adını yaz, Render sana DNS ayarlarını gösterir
- Alan adı sağlayıcında (Natro vs.) CNAME kaydı ekle
- Ücretsiz SSL otomatik

---

## Özet — 5 Dakikalık Yapılacaklar

```bash
# 1. Git başlat ve push
cd ~/Documents/Proje/teklif
git init && git add . && git commit -m "ilk yukleme"
git remote add origin https://github.com/KULLANICI/perpak-teklif.git
git push -u origin main
```

```
# 2. Render'da Blueprint
https://dashboard.render.com → New → Blueprint → repoyu seç → Apply

# 3. Bekle (5-10 dk)
# 4. URL'i kopyala, firmaya gönder
```

İyi yayınlar! 🚀
