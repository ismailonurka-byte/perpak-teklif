# PERPAK Teklif Sistemi — Kullanım Kılavuzu & Eğitim Dokümanı

Bu belge hem **kullanım kılavuzu** hem de **adım adım eğitim materyali**dir. **Hiç bilgisayar/yazılım deneyimi olmayan** bir kullanıcının bile sistemi tek başına öğrenip kullanmasını hedefler.

> 📚 **Bu kılavuzu nasıl okuyalım?**
> - **İlk kez kullanan satış temsilcisi:** Bölüm 1 → 3 → 14 (Eğitim Senaryosu) → 5 → 6 sırasıyla okuyun.
> - **Yönetici:** Tüm bölümler, özellikle 2, 9, 12.
> - **Sadece günlük kullanım için referans:** 4–8 arasını işaretleyip aklınızda kalsın.
> - **Sorun yaşıyorsanız:** Doğrudan Bölüm 12'e gidin.

---

## İçindekiler

1. [Sistem Hakkında Genel Bilgi](#1-sistem-hakkında-genel-bilgi)
2. [İlk Kurulum (Bilgisayar Yöneticisi İçin)](#2-i̇lk-kurulum-bilgisayar-yöneticisi-i̇çin)
3. [Sisteme Giriş ve İlk Adımlar](#3-sisteme-giriş-ve-i̇lk-adımlar)
4. [Ana Ekran (Panel)](#4-ana-ekran-panel)
5. [Müşteri Yönetimi](#5-müşteri-yönetimi)
6. [Teklif Oluşturma — Tam Akış](#6-teklif-oluşturma--tam-akış)
7. [Teklifleri Takip Etme](#7-teklifleri-takip-etme)
8. [Kanban — Yönetici Görünümü](#8-kanban--yönetici-görünümü)
9. [Raporlar — Teklif → Sipariş Dönüşüm](#9-raporlar--teklif--sipariş-dönüşüm)
10. [Kullanıcı Yönetimi (Yönetici)](#10-kullanıcı-yönetimi-yönetici)
11. [Mobil ve Tablet Kullanımı](#11-mobil-ve-tablet-kullanımı)
12. [Sık Karşılaşılan Sorunlar](#12-sık-karşılaşılan-sorunlar)
13. [Yedekleme ve Bakım](#13-yedekleme-ve-bakım)
14. [Teknik Detaylar (İleri Düzey)](#14-teknik-detaylar-i̇leri-düzey)
15. [Eğitim Senaryoları — Birlikte Yapalım](#15-eğitim-senaryoları--birlikte-yapalım)
16. [Günlük / Haftalık Rutin Önerileri](#16-günlük--haftalık-rutin-önerileri)
17. [Klavye Kısayolları ve İpuçları](#17-klavye-kısayolları-ve-i̇puçları)
18. [Sözlük — Sistemde Geçen Terimler](#18-sözlük--sistemde-geçen-terimler)
19. [Sonuç ve Yardım](#19-sonuç-ve-yardım)

---

## 1. Sistem Hakkında Genel Bilgi

**PERPAK Teklif Sistemi** karton kutu, oluklu koli ve benzeri ambalaj ürünleri için **fiyat teklifi (proforma)** hazırlamanızı, kaydetmenizi, takip etmenizi ve PDF olarak indirmenizi sağlar.

### Ne yapar?
- Müşteri kayıtlarını tutar.
- Bir teklifte farklı tipte ürünler (Kutu Ofset, Kutu Flekso, Koli) **aynı anda** olabilir.
- Excel'deki birim fiyat tablosuna göre **otomatik fiyat hesaplar**.
- Yatay A4 PDF olarak indirilebilir profesyonel **proforma** üretir.
- Açık (henüz kapanmamış) teklifleri kullanıcı veya yönetici bazında takip eder.
- 7 gün hareketsiz kalan teklifler için uyarı verir.

### Kimler kullanır?
- **Yönetici (ADMIN):** Her şeyi görür, kullanıcı ekler, fiyatları değiştirir.
- **Satış Temsilcisi (SATIS):** Kendi tekliflerini açar, düzenler, gönderir.
- **Üretim (URETIM):** Onaylanan teklifleri görür (sadece okuma).

### Hangi cihazlarda çalışır?
Herhangi bir **modern tarayıcıda**:
- Bilgisayar (Windows, Mac, Linux)
- Tablet (iPad, Android)
- Akıllı telefon (iPhone, Android)

Tasarım **otomatik olarak ekran boyutuna uyum sağlar**. Mobilde menü üst tarafta hamburger ikonu olarak gözükür.

---

## 2. İlk Kurulum (Bilgisayar Yöneticisi İçin)

Bu bölüm yalnızca sistemi ilk kez kurarken yapılır. **İki kurulum yolu** vardır:

- **A) Windows sunucu / ofis bilgisayarı (önerilen on-prem yöntem):** Tek tık otomatik kurulum (`deploy/windows/kurulum.bat`). Docker gerekmez.
- **B) Docker (bulut / demo ortamı):** Geliştirme veya bulut sunucu için.

### 2.0 Windows Otomatik Kurulum (Önerilen)

Ofiste bir Windows bilgisayarı/sunucuyu sistemin "ev sahibi" yapacaksanız bu en kolay yoldur.

**Adımlar:**
1. Proje paketindeki **`deploy/windows`** klasörüne girin.
2. **`kurulum.bat`** dosyasına **sağ tıklayın → "Yönetici olarak çalıştır"**. (Yönetici onayı çıkarsa "Evet" deyin.)
3. Kurulum penceresi her şeyi otomatik yapar:
   - **Python 3.12** ve **PostgreSQL 16**'yı (bilgisayarda yoksa) indirip kurar,
   - veritabanını ve `admin` kullanıcısını oluşturur, master verileri yükler,
   - Windows güvenlik duvarında **8000 portunu** açar,
   - bilgisayar her açıldığında otomatik başlayan bir **"Vanto"** servisi kurar.
4. Bittiğinde pencerede erişim adresi yazar.

**Kurulumdan sonra erişim:** Aynı ağdaki herhangi bir bilgisayarın tarayıcısından:
- **http://<sunucu-ip>:8000** (örn. `http://192.168.1.50:8000`)
- Giriş: **admin / admin123** (ilk girişte mutlaka şifreyi değiştirin — Bölüm 3.2).

> 💡 **Durdur / başlat:** Görev Zamanlayıcı'daki **"Vanto"** görevinden ya da `deploy/windows/baslat.bat` ile yönetebilirsiniz. Sunucu yeniden başlasa bile servis otomatik kalkar.

> 🌐 **Alan adı (opsiyonel):** Sisteme `teklif.firmaniz.com` gibi bir alan adıyla erişmek isterseniz, IIS üzerinden **reverse proxy** kurulabilir — hazır örnek yapılandırma `deploy/iis/web.config` dosyasındadır.

### 2.1 Gereksinimler (Docker yöntemi)
- **Docker Desktop** kurulu olmalı: https://www.docker.com/products/docker-desktop/
- Bilgisayarda en az 4 GB boş RAM
- 5 GB boş disk alanı

### 2.2 Sistemi Başlatma (Docker)

Terminal'i (macOS) veya PowerShell'i (Windows) açın ve şu komutları sırayla yazın:

```bash
# 1) Proje klasörüne git
cd ~/Documents/Proje/teklif

# 2) Ayar dosyalarını oluştur
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3) Tüm servisleri Docker ile başlat
docker compose up -d --build

# 4) Veritabanı tablolarını oluştur
docker compose exec backend alembic upgrade head

# 5) Master verileri (karton türleri, gramajlar, fiyat tablosu) yükle
docker compose exec backend python scripts/seed_master_data.py

# 6) İlk yönetici kullanıcıyı oluştur
docker compose exec backend python scripts/create_admin.py
```

Bittiğinde tarayıcıda **http://localhost:5173** adresine girin.

### 2.3 Servisleri Durdurma / Yeniden Başlatma

```bash
# Durdur
docker compose down

# Yeniden başlat
docker compose up -d
```

Veriler kaybolmaz — Docker birim (volume) içinde saklanır.

### 2.4 İnternet üzerinden erişim (ileride)
Şu anda sistem sadece **localhost** (bilgisayarın kendisi) üzerinde çalışır. Ofis ağına veya internete açmak için ek yapılandırma (Nginx, SSL sertifikası, alan adı) gerekir — talep ederseniz ayrıca yapılır.

---

## 3. Sisteme Giriş ve İlk Adımlar

### 3.1 Giriş — Adım Adım

**Adım 1:** Bilgisayarınızda tarayıcıyı (Chrome, Edge, Safari, Firefox) açın.
**Adım 2:** Adres çubuğuna yazın → `http://localhost:5173` → **Enter**'a basın.
**Adım 3:** Karşınıza koyu lacivert arka planlı bir giriş ekranı gelecek. Ortada beyaz bir kart, **PERPAK** yazısı, altında iki kutucuk göreceksiniz:
   - "Kullanıcı Adı" kutusuna yazın: **admin**
   - "Şifre" kutusuna yazın: **admin123**
   - (Şifreyi görmek için sağ taraftaki göz ikonuna tıklayabilirsiniz.)
**Adım 4:** "Giriş Yap" butonuna tıklayın.
**Adım 5:** Sayfa otomatik olarak **Panel**'e yönlendirir. Sol tarafta menü, üstte "Hoş geldin" yazısı görürsünüz. **Tebrikler, giriş başarılı.**

**Sorun yaşıyorsanız:**
- "Kullanıcı adı veya şifre hatalı" yazısı çıktıysa → Caps Lock'u kontrol edin, Türkçe klavyede "i" ve "İ" karıştırılabilir.
- Sayfa hiç açılmadıysa → Sistemin çalıştığından emin olun (yöneticiye `docker compose ps` komutunu çalıştırmasını söyleyin).

### 3.2 İlk Girişten Sonra Yöneticinin Yapması Gerekenler

> ⚠️ **GÜVENLİK UYARISI:** Sisteme ilk giren kişi yönetici olduğu için aşağıdaki adımları **mutlaka ilk gün** yapmalı.

#### Görev 1: Şifreni Değiştir (zorunlu)
1. Sol menüden **"Kullanıcılar"**'a tıklayın.
2. Listede "Sistem Yöneticisi" satırının sağındaki **kalem ikonuna** tıklayın.
3. Açılan pencerede **"Yeni Şifre"** kutusuna güçlü bir şifre yazın (en az 8 karakter, harf+rakam+sembol önerilir).
4. **"Kaydet"** butonuna basın. Yeşil "Kullanıcı kaydedildi" bildirimi gördükten sonra şifreniz değişti demektir.

#### Görev 2: Satış Temsilcisi Kullanıcıları Oluştur
Her satış temsilcisinin kendi hesabıyla giriş yapması gerekir. (Aynı `admin` hesabını paylaşmak **kesinlikle önerilmez** — kim hangi teklifi açtı belli olmaz.)

1. **Kullanıcılar** sayfasında sağ üstte **"+ Yeni Kullanıcı"** butonuna tıklayın.
2. Aşağıdaki bilgileri doldurun:
   - **Ad Soyad:** Kişinin gerçek adı (örnek: "Ahmet Yılmaz")
   - **Kullanıcı Adı:** Sade ve unutulmayan bir kısaltma (örnek: "ahmet")
   - **Şifre:** Geçici bir şifre (örnek: "ahmet2026"). İlk girişte kişiye değiştirtin.
   - **Rol:** **SATIS** seçin.
   - **Telefon, E-posta:** Doldurun — bu bilgiler proforma çıktısında kişinin imzasında görünür.
3. **"Kaydet"**.
4. Aynı işlemi her satış temsilcisi için tekrarlayın.

#### Görev 3: Müşterileri Sisteme Yükle
İş ortakları/müşteriler için temel bilgileri sisteme eklemelisiniz. (Detay → Bölüm 5)

#### Görev 4: Bir Test Teklifi Hazırla
Sistemin nasıl çalıştığını anlamak için sahte bir teklif açıp PDF çıktısını gözlemleyin. (Detay → Bölüm 15, Senaryo 1)

✅ Bu 4 adımı tamamladıktan sonra sistem **gerçek kullanıma** hazırdır.

---

## 4. Ana Ekran (Panel)

Giriş yapınca açılan ilk ekran **Panel**'dir. Üstte selamlama, altta 4 özet kart vardır:

| Kart | Anlamı |
|---|---|
| **Açık Teklifler** | Taslak + Gönderildi + Beklemede durumundaki teklif sayısı |
| **Bu Ay Kazanç** | Bu ay içinde "Kabul" durumuna geçmiş tekliflerin toplam tutarı |
| **Kazanma Oranı** | Kapanan teklifler içinde kabul edilenlerin yüzdesi |
| **Eskiyen >7 Gün** | 7 günden fazla harekete kapalı, açık teklif sayısı |

Eskiyen teklif varsa **sarı uyarı kutusu** çıkar — tıklayarak ilgili tekliflere gidebilirsiniz.

Aşağıda **Son Teklifler** kartı vardır; en güncel 8 teklifi gösterir.

Sağ üstte **+ Yeni Teklif** düğmesi her zaman görünür.

**Kullanıcı rolüne göre fark:**
- ADMIN tüm kullanıcıların tekliflerinin özetini görür.
- SATIS yalnız kendi teklifleri için özet görür.

---

## 5. Müşteri Yönetimi

Sol menü → **Müşteriler**

### 5.1 Yeni Müşteri Ekleme — Adım Adım

**Adım 1:** Sol menüden **"Müşteriler"** yazısına tıklayın.
**Adım 2:** Sağ üstte **mavi "+ Yeni" butonu** vardır, ona tıklayın.
**Adım 3:** Açılan pencerede aşağıdaki bilgileri doldurun:

| Alan | Zorunlu mu? | Örnek | Açıklama |
|---|---|---|---|
| Firma Adı | ✓ **Evet** | "Acme Ambalaj Ltd. Şti." | Müşterinin resmi ticari unvanı |
| Yetkili | Hayır | "Ali Veli" | Müşteri tarafındaki temsilci adı |
| Telefon | Hayır | "0532 123 45 67" | İletişim için |
| E-posta | Hayır | "ali@acme.com" | Proforma e-postası buraya gönderilebilir (ileride) |
| Vergi No | Hayır | "1234567890" | Resmî fatura için |
| Vergi Dairesi | Hayır | "Kadıköy" | Resmî fatura için |
| Adres | Hayır | "Cevizli Mah. ... Maltepe / İstanbul" | Proforma'da gözükür |
| Notlar | Hayır | "Genelde +90 günden fazla ödemez" | Sadece sizin için, müşteri görmez |

**Adım 4:** Bilgileri kontrol edip sağ alttaki **"Kaydet"** butonuna basın.
**Adım 5:** Pencere kapanır, yeni müşteri listede görünür. Yeşil "Müşteri kaydedildi" bildirimi gelir.

> 💡 **Pratik İpucu:** Acele eden müşteri için sadece "Firma Adı"nı yazıp kaydetin. Detayları sonra doldurmak için tekrar dönebilirsiniz.

> 🔒 **Açılır pencereler (pop-up) hakkında:** Müşteri formu gibi tüm açılır pencereler **boşluğa / arka plana tıklayınca kapanmaz**. Yanlışlıkla dışarı tıklayıp doldurduğunuz bilgileri kaybetmemeniz için pencere yalnızca **"İptal"**, **X** veya **Esc** ile kapanır.

### 5.2 Mevcut Müşteriyi Düzenleme

**Adım 1:** Listeden ilgili satıra bakın. Sağ tarafında **kalem ikonu** (✏️) vardır.
**Adım 2:** Kalem ikonuna tıklayın → düzenleme penceresi aynı şekilde açılır.
**Adım 3:** Değiştirmek istediğiniz alanı düzenleyin, **"Kaydet"** basın.

**Mobilde:** Satırın herhangi bir yerine dokunmak yeterli — pencere açılır.

### 5.3 Müşteri Arama

Listede çok müşteri varsa aramak gerekir.

**Adım 1:** Sayfanın üstündeki "Müşteri ara..." kutusuna firma adının bir parçasını yazın.
**Adım 2:** Tuş başına liste otomatik filtrelenir, **Enter'a basmaya gerek yok**.

**Örnekler:**
- "acme" yazınca "Acme Ambalaj", "Acme Tekstil", "Acmesan Ltd." gibi içinde "acme" geçen tüm firmalar gelir.
- "ali" yazsanız "Alibaba A.Ş." gelir ama yetkili adı "Ali" olan firmalar gelmez (sadece firma adında arar).

### 5.4 Müşteriyi Pasif Yapma / Silme

Müşteri listesinde her satırın sağında iki işlem vardır: **"Pasif yap / Aktif et"** ve **"Sil"**. Liste üstündeki **"Pasifleri göster"** filtresiyle pasif müşterileri de görebilirsiniz (varsayılan olarak yalnız aktifler listelenir).

**Pasif yapma (önerilen — geçmişi korur):**
Bir müşteriyle ilişki bittiyse (ödemiyor, kapandı vb.) satırdaki **"Pasif yap"** düğmesine basın (ya da düzenle penceresinde "Aktif" işaretini kaldırıp kaydedin). Artık o müşteri yeni teklif açarken dropdown'da görünmez. **Ama eski teklifleri sağlam kalır**, geçmişe bakabilirsiniz. Tekrar aktif etmek için "Aktif et" düğmesini kullanın.

**Kalıcı silme (akıllı):**
Satırdaki **"Sil"** düğmesi müşteriyi kalıcı kaldırır. Sistem **akıllı davranır**:
- Müşterinin **hiç teklifi yoksa** → kalıcı olarak silinir.
- Müşterinin **en az bir teklifi varsa** → kalıcı silinemez; sistem uyarır ve **"pasif yapın"** önerir (geçmiş tekliflerin müşteri bilgisi bozulmasın diye).

> 💡 **Pratik kural:** Geçmişi olan bir müşteriyi her zaman **pasif** yapın; sil düğmesini yalnızca yanlışlıkla eklenmiş, hiç teklifi olmayan kayıtlar için kullanın.

### 5.5 Tanımlar Menüsü — Genel Bakış (Yönetici)

Sol menüdeki **"Tanımlar"** grubu, sistemin teklif formundaki açılır listelerini ve fiyatlarını yönettiğiniz yerdir (yönetici yetkisi gerekir). İçinde şunlar bulunur:

- **Müşteriler** (Bölüm 5)
- **Baskı Makineleri** (Bölüm 5.6)
- **Karton Malzeme Cinsi** (Bölüm 5.7)
- **Oluklu Cinsi** (Bölüm 5.7)
- **Fiyatlar** (Bölüm 13.x — birim fiyatların yönetildiği ekran)

Buradaki bir değişiklik (yeni makine, yeni karton cinsi vb.) **anında** teklif formundaki ilgili dropdown'a yansır.

> 🔒 Tüm bu sayfalardaki ekleme/düzenleme pencereleri de boşluğa tıklayınca kapanmaz; **İptal / X / Esc** ile kapanır.

### 5.6 Baskı Makineleri (Tanımlar)

Sol menü → **Tanımlar → Baskı Makineleri**

Ofset kutuların basıldığı makineleri buradan yönetirsiniz. Varsayılan olarak **Roland 700** ve **Roland 800** tanımlıdır. Her makinenin şu bilgileri vardır:

| Alan | Açıklama |
|---|---|
| **Ad** | Makinenin adı (örn. "Roland 700") |
| **Tip** | **Dahili** (kendi makinemiz) veya **Fason** (dış matbaa). **Yalnız bilgi amaçlıdır — fiyatı etkilemez.** |
| **Baskı Kalıp TL** | Bu makineyle çalışırken teklife **otomatik gelecek** kalıp ücreti |
| **Geçiş Çarpanı** | Bu makineyle çalışırken teklife **otomatik gelecek** geçiş çarpanı |

**Varsayılan değerler:**
- Roland 700 → Dahili, Baskı Kalıp TL **1450**, Geçiş Çarpanı **0,40**
- Roland 800 → Dahili, Baskı Kalıp TL **2000**, Geçiş Çarpanı **0,55**

Teklif formunda bir makine seçtiğinizde **Baskı Kalıp TL** ve **Geçiş Çarpanı** alanları bu tanımdan otomatik dolar (teklif içinde yine elle değiştirilebilir). Dropdown'da makineler "**Roland 700 (Ofset) — Dahili**" biçiminde, dahili/fason görünecek şekilde listelenir.

> 💡 Bir makineyi listeden kaldırırsanız yeni tekliflerde görünmez; eski tekliflerin makine bilgisi korunur.

### 5.7 Karton Malzeme Cinsi & Oluklu Cinsi (Tanımlar)

Bu iki liste de artık yöneticide **Tanımlar** altından yönetilir (eskiden yalnız kurulum verisiydi). Değişiklikler teklif formundaki dropdown'lara **anında** yansır.

**Tanımlar → Karton Malzeme Cinsi:**
- Yeni karton cinsi **ekleyebilir**, adını **düzenleyebilir**, listeden **kaldırabilirsiniz**.

**Tanımlar → Oluklu Cinsi:**
- Her oluklu kaydının: **Kod** (örn. "T090/S080/ - E"), **Tip** (E / B / C / BC) ve isteğe bağlı **Açıklama** alanı vardır.
- Yeni kayıt **ekleyebilir** ve **kaldırabilirsiniz**.
- **Kod sabittir** — bir kodu değiştirmek isterseniz kaydı kaldırıp yeniden ekleyin.

---

## 6. Teklif Oluşturma — Tam Akış

Bu, sistemin **çekirdek iş akışı**. Bir teklif oluşturmak ortalama **2-5 dakika** sürer. Detaylı satır ekleme dahil 10 dakika.

### 6.1 Yeni Teklif Açma

**Adım 1:** Üç farklı yerden başlayabilirsiniz, en kolayı:
- Panel sayfasının sağ üstündeki büyük **mavi "+ Yeni Teklif"** butonu
- ya da sol menü → **"Teklifler"** → sağ üstteki **"+ Yeni Teklif"** butonu

**Adım 2:** Açılan sayfada üstte "Yeni Teklif" yazısı görünür. Henüz **teklif numarası yok** — kaydedince otomatik atanır (örn: `TKL-26-0007`).

### 6.2 Üst Bilgi Kartını Doldurma

Sayfanın üstünde bir kart vardır. **Soldan sağa, yukarıdan aşağıya** doldurun:

**Adım 1 — Müşteri seçin:**
- Dropdown'a tıklayın → müşteri listesi açılır.
- İstediğiniz müşteriyi seçin.
- **Müşteri listede yok mu?** Önce sol menü → "Müşteriler"den ekleyin (Bölüm 5), sonra geri gelin.

**Adım 2 — Yetkili yazın (opsiyonel):**
- Müşteri tarafındaki muhatabınızın adını yazın (örnek: "Ali Veli — Satınalma").
- Bu isim proformanın "Müşteri / Yetkili" kısmında gözükür.

**Adım 3 — Satış Temsilcisi alanına dikkat:**
- **OTOMATİK GELİR** — sisteme giriş yapan kişinin adı (yani sizin).
- Bu alan **değiştirilemez** ve gri renkte gözükür. Doğru — bu özellikle yapıldı (kimin teklif açtığı net olsun diye).

**Adım 4 — Tarih:**
- Bugünün tarihi **otomatik** gelir.
- Geriye dönük teklif girmek isterseniz tarihe tıklayıp değiştirin.

**Adım 5 — Geçerlilik:**
- Teklifin son geçerlilik tarihi (örnek: "01.07.2026").
- **Boş bırakabilirsiniz** — o zaman süresiz sayılır.
- Önerilen: Tarihin **30 gün sonrası** verin. Müşteri uzun süre bekletmesin.

**Adım 6 — Vade:**
- Serbest metin yazabilirsiniz: "30 gün", "60 gün", "peşin", "kapıda nakit", "%50 peşin %50 teslimde" vs.
- Varsayılan: **"30 gün"** (sık kullanılan).

**Adım 7 — Sevk Yeri (opsiyonel):**
- Müşterinin malları nereye istediği. Örnek: "İstanbul / Tuzla — Acme Ana Depo".
- Proformada görünür, fatura/nakliye için iz olur.

> 💡 **Pratik:** Çok aceleci durumda sadece **Müşteri** seçip diğer alanları boş bırakabilirsiniz. Daha sonra geri dönüp tamamlayabilirsiniz.

### 6.3 Satır (Kalem) Ekleme — En Detaylı Bölüm

**Aynı teklifte farklı tipte ürünler (Ofset Kutu + Flekso Kutu + Koli) yan yana olabilir.** Sistemin en güçlü özelliği bu. Müşteriye 3 farklı ürün satıyorsanız 3 ayrı teklif açmak zorunda değilsiniz — hepsini tek teklifte yapın.

#### Satır eklemeye başlamak:

**Adım 1:** Üst bilgi kartının altında **"Satırlar (0)"** yazılı bir kart vardır. Bu kartın sağ üstünde **mavi "+ Satır Ekle"** butonu vardır, ona tıklayın.

**Adım 2:** Ekranın büyük bir kısmını kaplayan bir pencere açılır. Başlık: "Yeni Kalem". Bu, ürün ekleme penceresidir.

> 🔒 **Not:** Bu pencere **boşluğa tıklayınca kapanmaz** (girdiğiniz onca veri kaybolmasın diye). Kapatmak için **"İptal"**, **X** ya da **Esc** kullanın.

#### Adım 3 — Kalem Tipini Seçin (en üstte):

Dropdown'a tıklayın. 3 seçenek gelir:

| Seçenek | Ne zaman seçilir? |
|---|---|
| **Ofset Kutu** | Müşteri **kaliteli baskı** istiyorsa (ilaç, kozmetik, gıda, hediyelik). Roland 700/800 makinelerle yapılır. |
| **Flekso Kutu** | **Daha basit baskı**, oluklu mukavva ya da uzun seri (örnek: depo kolisi, taşıma kutusu). |
| **Koli** | Baskı içermeyen veya basit flekso baskılı **taşıma/sevk kolisi** (B-flüt, C-flüt, E-flüt, BC, EB). |

> ⚠️ **Önemli:** Tip seçimi sonradan değiştirilemez (mevcut satırı düzenlerken). Yanlış tip seçtiyseniz satırı silip yeniden ekleyin.

#### Adım 4 — Ürün İsmi:

Sağdaki kutuya ürünün adını yazın. Örnekler:
- "İlaç Kutusu 50ml"
- "Kozmetik Krem Kutusu — Mavi Seri"
- "Gıda Saklama Kabı 1L"
- "Taşıma Kolisi 40x30x25 cm"

**Bu isim hem proformaya hem teklif listesine yansır**, ne kadar açıklayıcı yazarsanız o kadar iyi.

#### Adım 5 — Alt Bilgileri Doldurma

Burada **form alanları seçilen tipe göre kendiliğinden değişir**. Aşağıda her tip için ayrı ayrı anlatılıyor:

##### 5A) Ofset Kutu için doldurulacaklar:

> 💡 **Mavi zeminli alanlar otomatik hesaplanır** — elle giremezsiniz, diğer alanları doldurdukça kendiliğinden dolar.

**Grup: Ürün Bilgisi**
- **Bıçak No** (opsiyonel): Müşterinin daha önce kullanılmış kalıbının kodu varsa yazın (örn: "BK-1142"). Yeni kalıp ise boş bırakın.
- **Tabaka EN (mm)** *: Üretimde kullanılacak ana tabakanın enini milimetre olarak yazın (örn: 700 = 70 cm).
- **Tabaka BOY (mm)** *: Boyunu mm olarak yazın (örn: 1000).
- **Açınım (adet)** *: Bir tabakadan kaç adet kutu çıkacağı — tek bir sayı (örn: 2). (Eski "Açınım EN/BOY" ve "Tabaka Başı Kutu" alanları kaldırıldı, yerine bu tek alan geldi.)
- **Tabaka Adedi** *: Toplam kaç tabaka kesilecek?
- **Sipariş Miktarı** (🔵 otomatik): Tabaka Adedi × Açınım — kendiliğinden hesaplanır.

**Grup: Malzeme**
- **Karton Cinsi**: Dropdown'dan seçin. Sık kullanılanlar:
  - **Kuşesiz Kroma**: Standart baskı için
  - **Bristol**: Sert, yapı malzemesi
  - **Kroma**: Genel
- **Gramaj**: 160, 180, 200, 250, 300, 350, 400, 450 g/m² seçeneklerinden ihtiyacı seçin. Kalın kutular için 350+.
- **Karton TL/m²**: Güncel karton fiyatı (kağıt deposundan günlük). Örnek: 18,50
- **Oluklu Cinsi**: Çift duvarlı (oluklu) yapıyorsanız dropdown'dan oluklu kaliteyi seçin. (Eski "Ondüle TL/m²" yerine geldi.)
- **Oluklu TL/m²**: Seçtiğiniz oluklunun m² fiyatı. Oluklu yoksa boş/0 bırakın.

**Grup: Baskı**
- **Baskı Makinesi**: Dropdown'dan baskının yapılacağı makineyi seçin (örn. "Roland 700 (Ofset) — Dahili", "Roland 800 (Ofset) — Dahili"). Etikette makinenin **Dahili** (kendi makinemiz) mi yoksa **Fason** (dış matbaa) mı olduğu görünür. **Önemli:** Dahili/Fason yalnız **bilgi** amaçlıdır, fiyatı etkilemez. Makine listesi yöneticide **Tanımlar → Baskı Makineleri**'nden yönetilir (Bölüm 5.6).
  - Makineyi seçtiğinizde **Baskı Kalıp TL** ve **Geçiş Çarpanı** alanları, o makinenin tanımındaki değerlerle **otomatik dolar**. İsterseniz bu teklif için üzerine yazıp değiştirebilirsiniz.
- **Renk Sayısı**: 0–6 arası sayı. CMYK 4 renktir, ekstra spot eklerseniz 5–6.
- **Renk Seçimi**: Renk sayısı kadar rengi paletten seçin (CMYK + 4 renk seçilince Cyan/Magenta/Sarı/Siyah otomatik gelir). Proformada renk bilgisi olarak görünür.
- **Baskı Kalıp TL**: Kalıp ücreti. **Seçtiğiniz makineden otomatik gelir** (Sevkiyat'ta ayrıca yok); gerekiyorsa düzenleyin.
- **Boya TL**: Boya/mürekkep ek masraf varsa.
- **Geçiş Çarpanı**: **Seçtiğiniz makineden otomatik gelir**; istisnai durumda elle yazıp değiştirebilirsiniz. (Not: Renk sayısı, çarpandan bağımsız olarak baskı maliyetini doğrudan etkiler — bu değişmedi.)
- **Baskı Adedi** (🔵 otomatik): Tabaka Adedi ile aynı.
- **Ek Geçiş Adedi** (🔵 otomatik): Baskı adedi 3000'in üstündeyse fark otomatik (3000'e kadar 0).

**Grup: Kesim, Yapıştırma & İlave İşlemler**
- **Kesim TL (tabaka başına)**: Tabaka başına sabit kesim ücreti (örn: 2,25). Kesim yoksa boş bırakın.
- **Yapıştırma TL/adet**: Kutu başına yapıştırma ücreti (örn: 0,85). Yoksa boş bırakın.
- **Lak / Sıvama vb. & Fiyatları**: İstediğiniz işlemi (Lak, Sıvama, UV Lak, Mat Selefon, Gofre, Pencere Kesim…) işaretleyin. İşaretlediğinizde yanındaki **TL/m²** fiyatı **merkezi fiyat listesinden (Fiyatlar → İlave İşlem Fiyatları) otomatik dolar**. Gerekiyorsa bu teklif için üzerine yazıp değiştirebilirsiniz; girdiğiniz fiyat siparişe de taşınır. (Eski Lak/Sıvama kutucukları kaldırıldı; hepsi burada.)
- **Eklenti**: KILITLI / YAPISTIRMA / DIKIS / YOK

**Grup: Sevkiyat & Diğer**
- **Ambalaj Şekli**: Shrinkli mi, dökme mi, paletli mi?
- **Grafik**: Kalıp var mı (Eski iş tekrarı), Yeni çalışma mı, PDF mevcut mu?
- **Diğer Gider**: Tasarım, prova, vs. (Kalıp Gideri buradan kaldırıldı — Baskı bölümündeki "Baskı Kalıp TL" alanına girilir.)
- **Kâr Oranı**: Yüzde alanıdır — **20** yazarsanız %20 demektir (varsayılan 20). 15 → %15, 30 → %30.

> 📝 **Açıklama** (form en altında): Bu satıra yazdığınız not yalnızca **sipariş formunda** görünür, müşteriye giden **proformaya yazılmaz**. Üretim/iç notları için kullanın (örn: "Müşteriye özel ölçü kontrolü yapılacak").

##### 5B) Flekso Kutu için doldurulacaklar:

Daha az alan vardır (flekso daha basit):
- **Levha EN/BOY**, **Açınım (adet)**, **Tabaka Adedi** (Açınım = tabakadan çıkan kutu sayısı, tek sayı)
- **Sipariş Miktarı** (🔵 otomatik): Tabaka Adedi × Açınım
- **Oluklu Kalite**: Dropdown'dan seçin (B120/S080/T090-B gibi kompozit kodlar).
- **Safya TL/m²**: Birim levha fiyatı.
- **Renk Sayısı** + **Renk Seçimi** (paletten renkler)
- **Baskı+Kesim TL, Kesim TL, Yapıştırma TL/adet**: seçmediğiniz alan 0 sayılır (girilmemiş işlem maliyete eklenmez).
- **Sevkiyat / Kalıp Gideri / Diğer Gider / Kâr Oranı**: Aynı.

##### 5C) Koli için doldurulacaklar:

En sade form:
- **Boy / En / Yükseklik (mm)** — koli iç ölçüleri
- **Sipariş Miktarı** — kaç adet? (Alttaki "Adet" bu değere bağlanır.)
- **Oluklu Kalite** *: Mutlaka seçin.
- **Levha EN/BOY**, **Safya TL/m²**
- **Baskı Durumu**: Baskılı / Baskısız (sadeleştirildi — eski "Baskı Türü" yerine).
- **Renk Sayısı** + **Baskı Renkleri** (paletten renk seçimi)
- **Eklenti**: YAPISTIRMA veya DIKIS
- **Dikiş Fiyatı (TL)**: Toplam dikiş ücreti (tek rakam). Yapıştırma seçtiyseniz 0. (Eski "Dikiş Adedi × birim" yerine doğrudan fiyat.)
- **Klişe Gideri / Bıçak Gideri**: Toplam tutar — sipariş adedine bölünür. **Kâr Oranı**: varsayılan %20. (Not: Lak/Sıvama gibi İlave İşlemler koli formundan kaldırıldı; yalnız Ofset Kutu'da kullanılır.)

#### Adım 6 — Adet ve Birim Fiyat

Formun en altında 3 alan vardır:

- **Adet** *: Sipariş miktarı (örn: 10000).
- **Birim Fiyat (₺)**: Otomatik hesaplama sonucu önerilen fiyat buraya gelir. Üzerine yazıp değiştirebilirsiniz.
- **Satır Toplam**: Adet × Birim Fiyat otomatik gösterilir.

#### Adım 7 — Anlık Hesap Önizleme

Pencerenin alt kısmında siz alanları doldururken **otomatik hesap yapılır**:
- **"Maliyet:"** → Sistemin hesapladığı birim maliyet (ne kadar masrafa girersiniz).
- **"Önerilen:"** → Maliyet × (1 + Kâr Oranı) = önerilen satış fiyatı.

**3-4 saniye sonra** hesap yenilenir. Bu normal — sistemin sunucuya gidip dönmesi gerekir.

**"Maliyet Kırılımı"** üçgenine tıklarsanız maliyet detayını görürsünüz: karton, baskı, lak, yapıştırma vb. her kalemi ayrı ayrı.

#### Adım 8 — Satırı Kaydet

Sağ alttaki **mavi "Satırı Kaydet"** butonuna basın. Pencere kapanır, satır tabloda görünür.

#### Adım 9 — Yeni Satır Ekle veya Bitir

- Yeni ürün eklemek istiyorsanız tekrar **"+ Satır Ekle"** ile devam edin. **Bu kez farklı bir tip de seçebilirsiniz.**
- Bitirdiyseniz aşağıdaki Bölüm 6.5'e geçin (toplamlar).

> 💡 **Eğitim İpucu — İlk denemenizde:**
> 1. Önce sadece bir satır ekleyin.
> 2. Adetleri 1000, fiyatları küçük (5 ₺ gibi) tutun.
> 3. Sayıların nasıl davrandığını izleyin.
> 4. Çalışmasından emin olduktan sonra gerçek değerleri girin.

### 6.4 Satırı (Kalemi) Düzenleme / Silme

- Liste'de satırın sağında **kalem ikonu** = düzenle.
- **Çöp kutusu ikonu** = o kalemi (satırı) teklifin içinden siler. Onay sorulur.

> ℹ️ Bu silme **yalnızca teklif içindeki tek bir kalem** içindir. Teklifin tamamını kaldırmak için silme yoktur — bunun yerine **"İptal Et"** kullanılır (bkz. Bölüm 6.6).

### 6.5 Toplamlar

Pencerenin altında **Ara Toplam → KDV → Genel Toplam** otomatik hesaplanır. KDV oranı varsayılan %20.

### 6.6 Teklifi Kaydetme ve İptal Etme

Düğmeler:
- **Kaydet** — Taslak olarak veritabanına yazar.
- **Teklif Ver** — Durumu "Teklif Verildi"ye çevirir + kaydeder. (Yalnız Taslak durumundayken görünür.)
- **Siparişe Dönüştür →** — Müşteri kabul ettiğinde (KABUL durumundayken) bu düğme görünür; tıklayınca teklif resmi "Sipariş" durumuna geçer ve üretim sürecine işaret eder.
- **İptal Et** — Teklif düzeyinde **silme yoktur**; bunun yerine **"İptal Et"** düğmesi vardır. Tıklayıp onayladığınızda teklifin durumu **İPTAL**'e geçer. **Kayıt silinmez** — geçmişte ve raporlarda izi kalır, yalnızca artık aktif iş olarak görünmez. (Daha önce iptal edilmiş bir teklifte bu düğme görünmez.)

İlk kaydedişte sistem otomatik bir **teklif numarası** üretir (örn: `TKL-26-0001`).

### 6.7 PDF İndirme

Kaydettikten sonra üstteki **PDF** düğmesi tıklanabilir hale gelir. Tıklayın → yatay A4 proforma PDF inecektir. Doğrudan müşteriye gönderilebilir.

> 📄 **PDF içeriği hakkında:** Proformada para alanlarında **₺** simgesi gösterilir. Ofset kutuda **"Kağıt Kalitesi"** sütununda karton ve oluklu bilgisi **birlikte** yazılır. Siparişe dönüşen teklifin sipariş formunda **Tabaka EN/BOY yan yana** gösterilir ve para alanlarında **₺** simgesi yer alır.

### 6.8 Durum Akışı

Bir teklif şu durumlar arasında geçer:

```
   TASLAK ──► TEKLİF VERİLDİ ──► BEKLEMEDE ──► KABUL ──► SİPARİŞ  (üretime düşer)
      │            │                 │           │
      ▼            ▼                 ▼           ▼
                                              RED
                                              veya
                                            İPTAL
```

| Durum | Anlamı | Renk |
|---|---|---|
| **Taslak** | Henüz tamamlanmamış, müşteriye gitmedi | gri |
| **Teklif Verildi** | Resmi teklif müşteriye iletildi | mavi |
| **Beklemede** | Müşteri yanıtı bekleniyor | sarı |
| **Kabul** | Müşteri kabul etti, henüz üretime girmedi | yeşil |
| **Sipariş** | Üretime düştü, sipariş kesinleşti | mor |
| **Red** | Müşteri reddetti | kırmızı |
| **İptal** | Bizim tarafımızdan iptal edildi | gri (silik) |

Editör ekranının sağ üstündeki dropdown'dan durumu istediğin zaman değiştirebilirsin. Her değişiklik tarih damgasıyla **durum logu**na yazılır (denetim için saklanır).

> 💡 **"Kabul" ile "Sipariş" arasındaki fark:** Kabul = müşteri "evet" dedi ama henüz formaliteler ya da üretim başlamadı. Sipariş = artık üretim hattına geçti, dönüşü yok. İki adımı ayırmak, kabul ettiği halde son anda vazgeçen ya da koşulları değiştiren müşteri durumlarını net görmenizi sağlar.

---

## 7. Teklifleri Takip Etme

Sol menü → **Teklifler**

### 7.1 Liste Görünümü

Tüm teklifler tabloda görünür:
- **Teklif No** (örn: TKL-26-0001)
- **Müşteri**
- **Satış** (oluşturan)
- **Tarih**
- **Tutar**
- **Durum** (renkli etiket)
- **Hareket** (son güncellemeden bu yana geçen gün — 7'den fazla ise sarı uyarı)

Satıra tıklayarak detayı/düzenlemesini açabilirsin.

### 7.2 Filtreler

Üstte:
- **Arama** — teklif no veya müşteri adı
- **Durum** — sadece Taslak / Gönderildi / Beklemede / Kabul / Red / İptal
- **Sadece benim** (yalnız ADMIN'de görünür) — yöneticinin kendi tekliflerini görmesini sağlar.

### 7.3 Eskiyen Teklif İşareti

Hareketten 7 gün geçmiş **Teklif Verildi** veya **Beklemede** durumundaki teklifler **sarı üçgen** ile işaretlenir. Müşteriyle yeniden iletişime geçme zamanı geldiğine işarettir.

### 7.4 Rolüne göre görünüm farkı

- **ADMIN**: Tüm kullanıcıların tekliflerini görür.
- **SATIS**: Yalnız kendi açtığı veya kendisine atanmış teklifleri görür.

---

## 8. Kanban — Yönetici Görünümü

Sol menü → **Kanban** (yalnız ADMIN)

6 sütun: **Taslak / Teklif Verildi / Beklemede / Kabul / Sipariş / Red**

Her teklif kart olarak ilgili sütunda yer alır. Karttaki **durum dropdown'u** ile teklifi başka sütuna **anında taşıyabilirsin**.

Sütun başlığındaki sayı = o durumdaki teklif adedi.

**Kullanım önerisi:** Sabah ekibe toplantı yaparken Kanban'ı projeksiyon yansıt — bekleyen tekliflerin görsel haritası olur.

---

## 9. Raporlar — Teklif → Sipariş Dönüşüm

Sol menü → **Raporlar** (📊 simgesi)

### 9.1 Bu Sayfa Ne İşe Yarar?

Sistemdeki tüm tekliflerin **zaman çizelgesini** gösterir:

- **Ne zaman oluşturuldu** (kart açıldığı an)
- **Ne zaman teklif verildi** (müşteriye iletildiği an)
- **Ne zaman siparişe dönüştü** (üretime düştüğü an)
- **Aradaki süre kaç gün**

Bu rapor sayesinde şu sorulara cevap bulursunuz:
- "Ortalama olarak teklifi verdiğimden kaç gün sonra sipariş alıyorum?"
- "Geçen ay hangi tekliflerimi siparişe çevirebildim?"
- "Bu yıl toplam ne kadar siparişe dönüştü?"
- "X firmasına geçen kez ne zaman teklif vermiştim?"

### 9.2 Üst Özet Kartları

Sayfanın üstünde 4 kart var:

| Kart | Anlamı |
|---|---|
| **Toplam Teklif** | Seçili tarih aralığında oluşturulmuş tüm teklif sayısı |
| **Sipariş'e Dönen** | Bu tekliflerden kaç tanesi siparişe dönüştü |
| **Dönüşüm Oranı** | (Dönen / Toplam) × 100 — verimliliğin göstergesi |
| **Ort. Dönüşüm Süresi** | Teklif vermeden siparişe kaç gün ortalama geçiyor |

Altında ayrıca **toplam siparişe dönen tutar** (TL) yazılıdır.

### 9.3 Filtreler — Üst Bar

Üstte 4 filtre var:

#### 1) Sipariş Başlangıç ve Bitiş Tarihi
- Belirli bir döneme bakmak için (örnek: Mayıs 2026)
- Boş bırakırsanız tüm zamanlar
- Sadece bu aralıkta **siparişe dönen** teklifler gösterilir

#### 2) ☑ Sadece Siparişe Dönmüş
- İşaretli → sadece KABUL veya SİPARİŞ durumuna geçmiş olanlar
- İşaretsiz → tüm teklifler (henüz dönüşmeyenler de görünür ama "Sipariş" sütunu boş kalır)

#### 3) ☑ Sadece Benim (yalnız ADMIN'de görünür)
- Yönetici tüm tekliflerin yerine sadece kendisinin açtıklarını görmek isterse
- SATIS rolünde zaten her zaman sadece kendi teklifleri gözükür

### 9.4 Tablo Sütunları

| Sütun | Açıklama |
|---|---|
| **Teklif No** | Tıklayınca teklif detayına gider |
| **Müşteri** | Hangi firmaya teklif verildi |
| **Satış** | Hangi temsilci açtı |
| **Durum** | Şu anki durum (Taslak / Teklif Verildi / Beklemede / Kabul / Sipariş / Red / İptal) |
| **Tutar** | Genel toplam (TL) |
| **Oluşturma** | Teklifin sisteme ilk girildiği tarih + saat |
| **Teklif Verme** | İlk kez "Teklif Verildi" durumuna geçtiği an (— ise hiç verilmedi) |
| **Sipariş** | İlk kez "Sipariş" durumuna geçtiği an (— ise henüz dönüşmedi) |
| **Süre (gün)** | Teklif Verme → Sipariş arası kaç gün geçti (mor renkte) |

### 9.5 Excel/CSV İndir

Sağ üstteki **"Excel/CSV İndir"** butonu tüm tablo verisini bir CSV dosyası olarak indirir. Bu dosya:
- **Excel'de açılabilir** (Türkçe karakterler düzgün gözükür — UTF-8 BOM eklendi)
- Aylık mali raporlara, muhasebe paylaşımlarına ek olarak kullanılabilir
- Dosya adı: `teklif-donusum-YYYY-AA-GG.csv`

### 9.6 Pratik Senaryolar

#### Senaryo 1: "Bu ay ne kadar sipariş aldım?"
1. Sipariş Başlangıç → ayın 1'i
2. Sipariş Bitiş → ayın son günü
3. ☑ Sadece siparişe dönmüş
4. Üstteki **"Toplam siparişe dönen tutar"** sayısına bak

#### Senaryo 2: "Ortalama kaç gün içinde sipariş alıyorum?"
1. Tüm filtreler boş
2. **"Ort. Dönüşüm Süresi"** kartına bak (örnek: 7,5 gün)
3. Düşük → hızlı dönüşüm (iyi). Yüksek → müşteriler düşünme sürecinde uzun kalıyor (takip eksikliği olabilir).

#### Senaryo 3: "Hangi müşterilerimden geç sipariş geliyor?"
1. ☑ Sadece siparişe dönmüş
2. Tablodaki **"Süre (gün)"** sütununda büyükten küçüğe sırala (üstte mor sayılar büyük olanlar)
3. Bu müşterilere proaktif takip uygula

#### Senaryo 4: "Yönetici olarak satış ekibimin performansını izlemek istiyorum"
1. Sadece benim KAPATILMIŞ (admin sadece kendi tekliflerini değil herkesin tekliflerini görür default)
2. Filtreyi açıp **Satış sütununa** bak — her temsilcinin kazanma oranını manuel hesaplayabilirsin
3. (İleride satış temsilcisi bazlı kırılım otomatik gelecek)

> 💡 **İpucu — Rakamı Bilmek Karar Aldırır:**
> Aylık kazanma oranını düşüyorsa, bayilik geri çekmiş olabilir. Yükseliyorsa, ekip motivasyonu artmış olabilir. Bu raporu her ay sonunda 5 dakika kontrol etmek, **sezgisel değil veriye dayalı** karar almanı sağlar.

---

## 10. Kullanıcı Yönetimi (Yönetici)

Sol menü → **Kullanıcılar** (yalnız ADMIN)

### 9.1 Yeni Kullanıcı Ekleme

**+ Yeni Kullanıcı** → açılan formu doldur:

| Alan | Zorunlu | Açıklama |
|---|---|---|
| Ad Soyad | ✓ | Karta otomatik bu isim gelir (örn: "Ahmet Yılmaz") |
| Kullanıcı Adı | ✓ | Sistem girişinde kullanır (örn: "ahmet"). Sonradan değişmez. |
| Şifre | ✓ | En az 4 karakter |
| Rol | ✓ | ADMIN / SATIS / URETIM (madde 1.2'deki yetkiler) |
| Telefon, E-posta | — | Proformaya satış temsilcisi bilgisi olarak yazılır |

### 9.2 Şifre Değiştirme

Düzenle → **Yeni Şifre** alanına yeni şifreyi yaz → Kaydet.

> Boş bırakırsan şifre **değişmez** — kullanıcının mevcut şifresi geçerli kalır.

### 9.3 Kullanıcıyı Pasif Yapma

Düzenle → **Aktif** kutucuğunu kapat → Kaydet. Kullanıcı artık giriş yapamaz ama eski teklifleri ve adı sistemde kalır.

### 9.4 Rol Özet
- **ADMIN**: Sistemin tamamına sahip. Yeni kullanıcı, fiyat değiştirme, atama, herkesi görme.
- **SATIS**: Kendi tekliflerini açar, düzenler, gönderir. Müşteri ekleyebilir.
- **URETIM**: Sadece onaylanan teklifleri görür (üretim planlama için).

---

## 11. Mobil ve Tablet Kullanımı

Sistem tamamen **duyarlı (responsive)** tasarıma sahiptir.

### 10.1 Telefon Görünümü
- Üstte hamburger menü ikonu (☰) — basınca yan menü açılır.
- Liste sayfaları **kart** olarak görünür (yatay scroll yok).
- Form alanlarına dokunduğunda klavye **sayısal** olarak açılır (gerektiğinde).

### 10.2 Tablet Görünümü
- Genelde masaüstü ile aynı; küçük tabletlerde menü gizlenebilir.

### 10.3 PWA — Uygulama Gibi Kurma

PWA özelliği henüz aktif değil (ileride aktifleştirilir). Aktif olduğunda:
- iPhone'da Safari'de aç → "Paylaş" → "Ana Ekrana Ekle".
- Android'de Chrome'da aç → menüden "Uygulamayı Yükle".
- Kurulan PWA tıpkı yerli bir uygulama gibi çalışır, internet kesilirse taslak teklifler bile yazılır.

---

## 12. Sık Karşılaşılan Sorunlar

### "Giriş yapamıyorum"
- Caps Lock kapalı mı kontrol et.
- Kullanıcı adı/şifreyi doğru girdiğinden emin ol.
- Tarayıcı geçmişini temizle (Ctrl/Cmd + Shift + Delete).
- Yönetici şifreni sıfırlayabilir (madde 9.2).

### "Müşteri dropdown'unda hiç müşteri yok"
- Önce **Müşteriler** menüsünden en az bir müşteri eklemelisin.

### "Birim fiyat hesaplanmadı"
- Tabaka ölçüsü, gramaj, karton m² fiyatı gibi alanları doldurmalısın.
- 0.3 saniye gecikme normaldir — biraz bekle.

### "PDF açılmıyor"
- Tarayıcının pop-up engelleyicisini bu siteye izin ver.
- İlk denemede yavaş olabilir; ikinci denemede daha hızlı gelir.

### "Sistem yavaş"
- Çok büyük liste varsa filtre kullan (durum + tarih aralığı).
- Tarayıcıyı yenile (Ctrl/Cmd + R).
- Docker konteynerlerini yeniden başlat: `docker compose restart`.

### "Veriler kayboldu"
Bu yaşanmamalı. Olursa hemen yedekten geri yükle (madde 12).

---

## 13. Yedekleme ve Bakım

### 12.1 Yedek Almak (haftada bir önerilir)

```bash
# Tüm veritabanını dosyaya yedekle
docker compose exec db pg_dump -U perpak perpak_teklif > yedek_$(date +%Y%m%d).sql
```

Bu dosyayı **harici disk** veya **bulut** (Google Drive, Dropbox, OneDrive) gibi başka bir yerde sakla.

### 12.2 Yedekten Geri Yükleme

```bash
# Veritabanını sıfırla ve yedekten yükle
docker compose exec -T db psql -U perpak -d perpak_teklif < yedek_20260521.sql
```

### 12.3 Birim Fiyat Güncelleme

Kağıt zammı geldiğinde fiyatları güncellemek için **iki yol** vardır.

**Yol A — Fiyatlar ekranından (ANA YÖNTEM, önerilen):**
Yönetici olarak sol menü → **Tanımlar → Fiyatlar** sayfasını açın. Bu ekranda şu bölümler bulunur:
- **Genel Birim Fiyatlar** — Lak, Sıvama, Kesim, Yapıştırma, flekso baski/kesim/yapıştırma, koli dikiş gibi merkezi TL/m² ve TL/adet değerleri.
- **Gramajlar (Ofset)** — kullanılabilir gramaj değerlerinin listesi (yalnız liste; baskı TL'si burada değildir — bkz. not).
- **Geçiş Çarpanı** — renk sayısı bazlı yedek çarpan tablosu.
- **İlave İşlem Fiyatları** — Lak, Sıvama, UV Lak, Selefon vb. işlemlerin merkezi TL/m² fiyatları. (Teklifte işlem işaretlenince fiyat buradan otomatik dolar.)

> ℹ️ **Baskı Kalıp TL ve Geçiş Çarpanı** artık fiyat tablosunda değil, **makine bazlıdır** — bunları **Tanımlar → Baskı Makineleri**'nden güncelleyin (Bölüm 5.6). Eski "gramaja göre ofset baskı TL" tablosu kullanımdan kalkmıştır.

**Yol B — Terminalden SQL (alternatif / ileri düzey):**
```bash
docker compose exec db psql -U perpak -d perpak_teklif
# Sonra:
UPDATE birim_fiyat_genel SET lak_tl_m2 = 2.50 WHERE id = 1;
\q
```
Bu yöntem yalnızca Fiyatlar ekranına erişemediğiniz acil durumlar içindir; normalde **Yol A**'yı kullanın.

> Birim fiyat değiştirildiğinde **eski teklifler** etkilenmez (her teklifte hesap detayı snapshot olarak saklanır). Yalnız yeni teklifler için geçerli olur.

### 12.4 Log Görüntüleme

```bash
# Backend logları (hata aramak için)
docker compose logs -f backend

# Frontend logları
docker compose logs -f frontend

# Veritabanı logları
docker compose logs -f db
```

`Ctrl + C` ile log akışından çık.

### 12.5 Yeni Sürüm Çıkınca

```bash
# Kodu güncelledikten sonra
cd ~/Documents/Proje/teklif
docker compose down
docker compose up -d --build
docker compose exec backend alembic upgrade head  # yeni migration varsa
```

---

## 14. Teknik Detaylar (İleri Düzey)

Geliştirici veya teknik destek personeli için.

### 13.1 Klasör Yapısı

```
~/Documents/Proje/teklif/
├── backend/                FastAPI uygulaması
│   ├── app/
│   │   ├── api/v1/         Endpoint'ler (auth, teklif, firma, …)
│   │   ├── core/           Config, security, dependencies
│   │   ├── db/             SQLAlchemy modeller + Alembic
│   │   ├── schemas/        Pydantic istek/yanıt
│   │   └── services/
│   │       ├── pricing/    Hesaplama motorları (KUTU_OFSET, FLEKSO, KOLI)
│   │       └── pdf/        Proforma PDF (WeasyPrint + Jinja2)
│   ├── scripts/            Seed & admin oluşturma
│   └── requirements.txt
├── frontend/               React + Vite uygulaması
│   ├── src/
│   │   ├── app/            Router + Layout
│   │   ├── features/       (auth, teklif, musteri, admin)
│   │   ├── components/ui/  Ortak bileşenler (Modal, Badge, Toast, Confirm)
│   │   ├── hooks/          useAuth, useMaster
│   │   ├── lib/            api client, format yardımcıları
│   │   └── types/          TypeScript tipleri
│   └── package.json
├── docker-compose.yml      Servis yapılandırması
└── KULLANIM_KILAVUZU.md    Bu dosya
```

### 13.2 API Endpoint Özeti

| Yol | Açıklama |
|---|---|
| `POST /api/v1/auth/login` | Giriş |
| `POST /api/v1/auth/refresh` | Token yenileme |
| `GET /api/v1/auth/me` | Aktif kullanıcı |
| `GET/POST/PATCH/DELETE /api/v1/kullanici` | Kullanıcı yönetimi (ADMIN) |
| `GET/POST/PATCH /api/v1/firma` | Müşteri CRUD |
| `GET/POST/PATCH/DELETE /api/v1/teklif` | Teklif CRUD |
| `GET /api/v1/teklif/{id}/pdf` | Proforma PDF |
| `GET /api/v1/teklif/_/ozet` | Dashboard özet |
| `GET /api/v1/master/all` | Tüm lookup verileri |
| `POST /api/v1/hesaplama/preview` | Anlık fiyat hesabı |

Detaylı API dökümanı: **http://localhost:8000/docs** (Swagger UI).

### 13.3 Veri Modeli (kısa özet)

- **kullanici** — Sistem kullanıcıları
- **firma** — Müşteriler
- **teklif** — Teklif başlığı
- **teklif_kalem** — Teklif satırları (polimorfik, `spesifikasyon` JSONB)
- **teklif_durum_log** — Durum değişiklik kaydı
- **kalem_tipi** — Tip kayıt defteri (KUTU_OFSET / KUTU_FLEKSO / KOLI + ileride yenisi)
- **karton_cinsi, gramaj, oluklu_kalite, baski_turu, renk, …** — Lookup tabloları
- **birim_fiyat_ofset, gecis_carpan, birim_fiyat_genel** — Fiyat tablosu (Excel'deki "HESAPLAMA VERİ DOSYASI")

### 13.4 Yeni Kalem Tipi Ekleme (ileride "ETİKET" gibi)

1. `backend/app/services/pricing/etiket.py` — yeni hesaplama fonksiyonu yaz.
2. `backend/app/services/pricing/registry.py` — `PRICING_FUNCTIONS` sözlüğüne ekle.
3. `backend/scripts/seed_master_data.py` — `KALEM_TIPLERI` listesine yeni tip + alan şeması ekle.
4. Seed scriptini tekrar çalıştır.

**Migration gerekmez.** UI yeni tipi otomatik dropdown'a ekler ve form alanlarını üretir.

### 13.5 Excel'e Geri Aktarma

İleride istenirse `/api/v1/teklif/export` gibi bir endpoint eklenebilir — tüm tekliflerin Excel'e dışarı aktarımı için (henüz yok).

### 13.6 E-posta Otomasyonu (ileride aktifleştirilebilir)

`backend/.env` dosyasında `SMTP_ENABLED=true` yapıp SMTP bilgilerini doldurduğunuzda **"Gönder"** butonu otomatik olarak müşteriye e-posta atabilir hale gelir. Şu an pasif.

### 13.7 Üretim (production) Ortamı

Localhost dışında ofise/internete açmak için:

1. **HTTPS sertifikası** (Let's Encrypt önerilir).
2. **Nginx** reverse proxy (zaten Docker'da; sadece SSL ekleyin).
3. **Güçlü SECRET_KEY** (en az 32 karakter, rastgele).
4. **CORS_ORIGINS** ayarını gerçek alan adınızla değiştirin.
5. **Postgres şifresi** mutlaka değiştirin (`docker-compose.yml`'deki `perpak/perpak`).
6. **Otomatik yedek cron'u** kurun (madde 12.1).

---

## 📞 Destek

Sistemde bir aksaklık yaşarsanız:

1. Önce **madde 11**'deki sık karşılaşılan sorunları kontrol edin.
2. Sistemi yeniden başlatın: `docker compose restart`.
3. Hala düzelmediyse logları kontrol edin: `docker compose logs -f backend`.
4. Çözüm bulunamazsa sistem geliştiricisine logları + ekran görüntüsünü iletin.

---

---

## 15. Eğitim Senaryoları — Birlikte Yapalım

Sistemi öğrenmenin en hızlı yolu **somut bir senaryo üzerinden geçmek**. Aşağıdaki senaryoları sırayla deneyin. Her senaryo gerçek bir günlük iş akışını taklit eder.

### Senaryo 1: İlk Müşterimi Ekleyip Test Teklifi Hazırlıyorum

**Hikaye:** Yeni bir müşteri olan "Akkoç Gıda Ltd." sizi aradı. 10.000 adet 250 g kuşesiz kroma kutuya 4 renk baskı istiyor. Bu teklifi hazırlamanız gerekiyor.

**Adımlar:**

1. Sol menü → **"Müşteriler"** → **"+ Yeni"**.
2. Şu bilgileri girin:
   - Firma Adı: `Akkoç Gıda Ltd.`
   - Yetkili: `Mehmet Akkoç`
   - Telefon: `0533 111 22 33`
   - Adres: `İstanbul / Tuzla`
3. **"Kaydet"**.
4. Sol menü → **"Teklifler"** → **"+ Yeni Teklif"**.
5. Müşteri dropdown'undan **"Akkoç Gıda Ltd."** seçin.
6. Yetkili: `Mehmet Akkoç`.
7. Geçerlilik: 1 ay sonrasını seçin.
8. Vade: `30 gün`.
9. **"+ Satır Ekle"** → açılan pencerede:
   - Kalem Tipi: **Ofset Kutu**
   - Ürün İsmi: `Gıda Kutusu Akkoç`
   - Tabaka EN: 700, BOY: 1000
   - Tabaka Başı Kutu: 12
   - Tabaka Adedi: 850 (10000 / 12 ≈ 833, biraz fire payı)
   - Karton Cinsi: **Kuşesiz Kroma**
   - Gramaj: **250**
   - Karton TL/m²: 18,50
   - Baskı Makinesi: **Roland 700 (Ofset) — Dahili** (seçince Baskı Kalıp TL ve Geçiş Çarpanı otomatik dolar)
   - Renk Sayısı: 4
   - Baskı Kalıp TL: 750 (makineden gelen değeri bu örnek için değiştirebilirsiniz)
   - Baskı Adedi: 10000
   - Lak: ☑ (işaretleyin)
   - Eklenti: **Yapıştırma**
   - Kâr Oranı: 0.20
   - Adet: **10000**
10. Alt taraftaki **"Önerilen"** fiyatı bekleyin (3 saniye).
11. Birim fiyatı önerilen değer otomatik gelir; **"Satırı Kaydet"**.
12. Üst sağdaki **"Kaydet"** butonuna basın.
13. Yeni teklif numaranız atanır (örn: `TKL-26-0001`).
14. **"PDF"** butonuna tıklayın → PDF iner. Açıp kontrol edin.
15. Eğer her şey iyi görünüyorsa, dropdown'dan durumu **"Teklif Verildi"** yapın.

✅ Tebrikler, ilk teklifinizi hazırladınız!

### Senaryo 2: Aynı Teklifte 3 Farklı Tip Ürün

**Hikaye:** "Berra Pazarlama" 3 farklı ürün soruyor:
- 8000 adet ofset baskılı kutu
- 5000 adet flekso baskılı koli
- 3000 adet baskısız taşıma kolisi

**Adımlar:**

1. Yeni Teklif → Müşteri = "Berra Pazarlama".
2. **"+ Satır Ekle"** → Tip: **Ofset Kutu** → bilgileri doldur → kaydet.
3. **"+ Satır Ekle"** → Tip: **Flekso Kutu** → bilgileri doldur → kaydet.
4. **"+ Satır Ekle"** → Tip: **Koli** → bilgileri doldur → kaydet.
5. Toplamlar otomatik birikir: Ara Toplam → KDV → Genel Toplam.
6. PDF indirin. Görün: **3 satır da yan yana, ortak tabloda** gözükür.
7. Kaydet.

✅ Aynı teklifte farklı tipler — sistemin güçlü yanı bu.

### Senaryo 3: Açık Teklif Takibi

**Hikaye:** 10 gün önce gönderdiğiniz teklif sessiz. Müşteriyi aramak istiyorsunuz.

**Adımlar:**

1. **Panel**'i açın.
2. Sarı renkli **"Dikkat — X teklif 7+ gündür harekete kapalı"** uyarısı varsa, oradan başlayın.
3. Veya: Sol menü → **"Teklifler"** → Durum filtresinden **"Teklif Verildi"** seçin.
4. Listede "Hareket" sütununa bakın. **Sarı üçgenle** işaretli olanlar 7+ gündür hareketsiz.
5. İlgili teklife tıklayın → müşteri telefonunu görün → arayın.
6. Sonuca göre teklif durumunu değiştirin:
   - Müşteri kabul etti → **"Kabul"**
   - "Düşünmeye devam ediyor" dedi → **"Beklemede"** (zamanlama sayacı sıfırlanır)
   - Reddetti → **"Red"** (zorunlu değil ama notlara sebebini yazın)

### Senaryo 4: Kabul Edilmiş Teklifi Siparişe Dönüştürme (Yönetici)

**Hikaye:** Teklif kabul oldu, üretim başlayacak.

**Adımlar:**

1. Teklif detayını açın (Durum: "Kabul").
2. Üstte mor **"Siparişe Dönüştür →"** butonu görünür, ona basın.
3. Durum **"Sipariş"**'e geçer, mor etiketle gözükür.
4. Artık üretim ekibi (URETIM rolündeki kullanıcılar) bu teklifi görür.
5. Müşteriye onay e-postası gönderin (manuel).

### Senaryo 5: Kanban'da Genel Durum Görmek (Yönetici)

**Hikaye:** Sabah ofise gelip ekibin neresinde olduğunu görmek istiyorsunuz.

**Adımlar:**

1. Sol menü → **"Kanban"** (yalnız ADMIN'de görünür).
2. 6 sütun görürsünüz: Taslak / Teklif Verildi / Beklemede / Kabul / Sipariş / Red.
3. Her sütunun başlığında **sayı** vardır.
4. Bir kartı başka sütuna taşımak için: karttaki dropdown'a tıklayıp yeni durum seçin.
5. Kart anında o sütuna geçer.

### Senaryo 6: PDF'i Müşteriye E-posta ile Göndermek

**Hikaye:** Hazırladığınız proformayı müşteriye ulaştırmanız gerek.

**Adımlar:**

1. Teklif detayına gidin.
2. **"PDF"** butonuna basın → dosya iner.
3. İndirilenler klasörünüzde `TKL-26-0001.pdf` adlı dosya olacak.
4. E-posta programınızı açın (Gmail, Outlook vs.).
5. Yeni e-posta:
   - Kime: Müşterinin e-posta adresi
   - Konu: `Proforma Teklif No: TKL-26-0001`
   - PDF'i ek olarak yükleyin
   - Kısa bir mesaj yazın: "Sayın Mehmet Bey, talebinize istinaden hazırladığımız proformayı ekte iletiyorum. Bilgilerinize sunarım."
6. Gönder.
7. PERPAK sisteminde teklif durumunu **"Teklif Verildi"** yapın.

> 💡 **İleride:** Sistem aktifleştirildiğinde "PDF Gönder" butonu otomatik e-posta atacak. Şimdilik manuel.

---

## 16. Günlük / Haftalık Rutin Önerileri

Sistemden maksimum verim almak için aşağıdaki rutini önereyim:

### Her Sabah (5 dakika)
1. Sisteme giriş yapın.
2. **Panel**'i kontrol edin:
   - "Açık Teklifler" sayısına bakın.
   - "Eskiyen >7 Gün" varsa, sarı uyarı kutusuna girip ilgili teklifleri inceleyin.
3. Bugün takip etmek istediğiniz teklifleri kafanızda not edin.

### Gün İçinde
- Müşterilerle her görüşmeden sonra ilgili teklifin durumunu güncelleyin (Beklemede → Kabul / Beklemede → Red).
- Yeni telefon teklifi geldiyse hemen sisteme girin — hafızanıza güvenmeyin.

### Her Cuma (15 dakika — yönetici)
1. **Kanban**'ı açın.
2. Sütunlardaki dengeyi gözlemleyin:
   - Çok fazla "Teklif Verildi" var ama "Kabul" az → daha agresif takip gerekli.
   - "Beklemede" şişiyor → müşterileri kapatın (Kabul/Red).
3. Ekip toplantısında bu görseli kullanın.

### Her Pazartesi (5 dakika — yönetici)
- Önceki hafta kapanan teklifleri (Kabul + Red) gözden geçirin.
- Kazanma oranını panelden görün. Düşüyorsa nedenini analiz edin.

### Her Ay (15 dakika — yönetici)
- **Yedek alın** (Bölüm 13.1).
- Kullanıcıları gözden geçirin: ayrılan kişi varsa pasif yapın.
- Birim fiyat değişimi gerekirse güncelleyin (Bölüm 13.3).

---

## 17. Klavye Kısayolları ve İpuçları

### Tarayıcı Kısayolları (her sayfada işe yarar)
- **Ctrl/Cmd + R**: Sayfayı yenile (bir şey takıldıysa).
- **Ctrl/Cmd + K**: Bazı tarayıcılarda adres çubuğunu seçer.
- **Ctrl/Cmd + Shift + R**: Sıkı yenileme (cache temizler).
- **F11**: Tam ekran modu (uzun listelere bakarken faydalı).
- **Ctrl/Cmd + +/-**: Yazıyı büyüt/küçült.

### Sistem İçi İpuçları
- **Tab tuşu**: Form alanları arasında hızlı geçiş (özellikle uzun teklif formunda).
- **Enter tuşu**: Form içinde butona basmaya gerek kalmadan kaydet (giriş ekranı).
- **Esc tuşu**: Açık modal/pencereyi kapatır.
- **Çift tıklama tablodaki bir satıra**: Detaya gider.

### Hız Önerileri
- Sık eklenen müşteri/ürün için bilgilerinizi **not defterinde** hazır tutun, copy-paste yapın.
- Birden çok teklifte aynı satırlar varsa: tekliflerden birini açın, içeriği başka pencerede aynı sırayla doldurun.
- Çok satırlı teklif için tahmini birim fiyatı önceden hesaplayın, "Önerilen"i beklemek yerine doğrudan girin.

---

## 18. Sözlük — Sistemde Geçen Terimler

| Terim | Anlamı |
|---|---|
| **Proforma** | Müşteriye verilen resmi fiyat teklifi belgesi. Bağlayıcı değildir, sipariş onayı gelene kadar fiyat sabittir. |
| **Teklif No** | Sistem otomatik atadığı benzersiz kod (örn: `TKL-26-0001`). Müşteriyle iletişimde referans alın. |
| **Kalem** | Bir teklifin içindeki tekil satır / ürün. Bir teklifte 1–∞ kalem olabilir. |
| **Polimorfik Satır** | Aynı tabloda farklı tipte ürünlerin yan yana durabilmesi. Sistemin temel özelliği. |
| **Master Veri** | Karton türleri, gramajlar, baskı türleri gibi sabit listeler. Yönetici yönetir. |
| **Birim Fiyat** | Tek bir ürünün satış fiyatı (TL). |
| **Birim Maliyet** | Tek bir ürünün size mal olma maliyeti. Karton + baskı + işçilik vs. |
| **Kâr Oranı** | Maliyetin üstüne eklenen yüzde. 0.20 = %20 kâr. |
| **Açınım** | Bir kutunun açılmış (düz) halinin ölçüleri. Bıçak dosyasından bakılır. |
| **Tabaka** | Üretimde kullanılan büyük karton parça. Bir tabakadan birden çok kutu çıkar. |
| **Bıçak / Kalıp** | Kutunun kesim ve katlama hatlarını veren özel takım. |
| **Klişe** | Flekso baskıda kullanılan kalıp. |
| **Ondüle** | Mukavva yapımında kullanılan dalgalı orta katman. |
| **Safya** | Oluklu mukavvada düz dış yüzey. |
| **CMYK** | Cyan, Magenta, Yellow, Black — 4 renkli baskı standardı. |
| **Spot Renk** | CMYK dışında kullanılan özel renk (Pantone vs.). Her ekstra spot ek geçiş gerektirir. |
| **Lak** | Baskı üzerine sürülen parlak/mat koruyucu kaplama. |
| **Sıvama** | Mukavva üzerine kuşe kağıt yapıştırma işlemi. |
| **Selefon** | İnce şeffaf film ile baskıyı kaplama (mat veya parlak). |
| **Gofre** | Yüzeye kabartmalı şekil verme. |
| **CRM** | Customer Relationship Management — müşteri ilişki yönetimi. Bu sistem hafif bir CRM içerir. |
| **CRUD** | Create-Read-Update-Delete — kayıt ekle/oku/güncelle/sil işlemlerinin teknik adı. |
| **Token** | Sisteme giriş sonrası verilen kimlik anahtarı. Bilgisayar otomatik yönetir, kullanıcı görmez. |
| **Cache** | Tarayıcının veriyi tekrar tekrar indirmemek için sakladığı bellek. Bazen yenilemek gerekir. |
| **Dropdown** | Seçim menüsü — tıkladığınızda açılır liste. |

---

## 19. Sonuç ve Yardım

Bu kılavuzu sonuna kadar okuduysanız sistemi rahatlıkla kullanabilirsiniz. **Önemli bir nokta**: bir özelliği test etmekten korkmayın — yanlış bir teklif açtıysanız üstteki **"İptal Et"** düğmesiyle İPTAL durumuna alın (teklif silinmez, izi raporlarda kalır). Teklif içindeki tek bir hatalı kalemi ise çöp kutusu ikonuyla kaldırabilirsiniz.

### Eğitim Sırası Önerisi (yeni kullanıcı için)

**1. gün:**
- Bu kılavuzun Bölüm 1, 3'ünü okuyun
- Senaryo 1'i (Bölüm 15) baştan sona yapın
- Sistemden tanıştığınız 2-3 müşteriyi ekleyin

**2. gün:**
- Bölüm 4, 5, 6'yı okuyun
- Senaryo 2'yi yapın (karma teklif)
- Gerçek 1-2 teklif oluşturun, kaydedin

**3. gün:**
- Bölüm 7, 8'i okuyun
- Senaryo 3'ü yapın (açık teklif takibi)
- Mobil cihazınızdan da deneyin (Bölüm 11)

**4-5. gün:**
- Diğer senaryoları sırayla yapın
- İlk gerçek müşteri teklifinizi hazırlayıp gönderin

**1 hafta sonra:**
- Sistemi tamamen rahat kullanıyor olacaksınız
- Sözlüğü (Bölüm 18) bir kez gözden geçirin
- Yöneticiye geri bildirim verin: hangi alanlar zor, hangileri çok kolaylaştırıyor?

---

**Son güncelleme:** 2026-06-16
**Sürüm:** 0.1.0
**Belge sahibi:** PERPAK Ambalaj San. Tic. Ltd. Şti.
**Belge türü:** Kullanım Kılavuzu + Kullanıcı Eğitim Materyali
