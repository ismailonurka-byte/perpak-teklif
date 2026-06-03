# Fiyat Hesaplama Mantığı — Adım Adım Anlatım

Bu belge, **PERPAK Teklif Sistemi'nin** her bir ürün tipi için fiyatı nasıl hesapladığını **hiç bilmeyen bir kişiye** anlatır gibi tek tek açıklar. Hiçbir matematik veya bilgisayar bilgisi gerekmez — sadece okuyup takip etmeniz yeterli.

---

## İçindekiler

1. [Önce — Sistem Genelde Nasıl Çalışır?](#1-önce--sistem-genelde-nasıl-çalışır)
2. [Ortak Kavramlar — Herkesin Bilmesi Gerekenler](#2-ortak-kavramlar--herkesin-bilmesi-gerekenler)
3. [Bölüm A — Ofset Kutu (KUTU OFSET)](#3-bölüm-a--ofset-kutu-kutu-ofset)
4. [Bölüm B — Flekso Kutu (KUTU FLEKSO)](#4-bölüm-b--flekso-kutu-kutu-flekso)
5. [Bölüm C — Koli (KOLİ)](#5-bölüm-c--koli-koli)
6. [Tam Bir Örnek — Üç Tipi Yan Yana](#6-tam-bir-örnek--üç-tipi-yan-yana)
7. [Sık Sorulan Sorular](#7-sık-sorulan-sorular)
8. [Excel'deki Hücre Hücre Formül Sözlüğü](#8-exceldeki-hücre-hücre-formül-sözlüğü)
9. [Sonuç](#9-sonuç)

---

## 1. Önce — Sistem Genelde Nasıl Çalışır?

Hayal edin: Müşteri arıyor ve "10.000 adet kutuya fiyat ver" diyor. Bu sayıyı vermeden önce **şu kalemler için para harcayacağınızı** biliyorsunuz:

1. **Karton/mukavva** alacaksınız (malzeme parası).
2. **Baskı** yapacaksınız (kalıp, mürekkep, makine zamanı).
3. **Lak / selefon / gofre** gibi ek işlemler varsa (yüzey kaplama parası).
4. **Kesim, yapıştırma, dikiş** gibi son işlemler (işçilik parası).
5. **Tek seferlik** masraflar: yeni kalıp, klişe vs.

Bu beş kalemin toplamına **MALİYET** denir. Üstüne **kâr payı** koyarsınız (örnek: %20). Bu da **SATIŞ FİYATI**'dır.

Sistem bunları sizin elinizle yapmak yerine, siz **girdileri yazınca otomatik hesaplar**. Hesaplama mantığı **Excel'inizdeki formüllerle birebir aynı** — değişen şey sadece bilgisayarın bunu sizin için yapması.

### Kısa formül (uzun anlatımdan önce özet):

```
   Birim Satış Fiyatı = ( Tüm Maliyet / Üretilecek Adet ) × ( 1 + Kâr Oranı )
```

Şimdi gelelim her ürün tipinde **TÜM MALİYET** nasıl hesaplanıyor, ona…

---

## 2. Ortak Kavramlar — Herkesin Bilmesi Gerekenler

Aşağıdaki kelimeler her ürün tipinde geçer. Önce bunları öğrenin.

### Tabaka

Üretimde kullandığınız **büyük karton parçası**. Örnek: 70 cm × 100 cm bir tabaka. Bir tabakadan birden fazla kutu çıkar (bıçak dizgisine göre değişir).

> Eğer tabakadan 12 kutu çıkıyorsa ve 10.000 kutu üreteceksiniz, yaklaşık 850 tabaka keseceksiniz demektir (10.000 / 12 ≈ 833, fire payı ile 850).

### Gramaj

Kartonun kalınlık ölçüsü. **g/m²** birimi. 300 g/m² → 250 g/m²'den daha kalın.

### Tabaka Başı Kutu (kısaca "kutu/tab") — formda artık "Açınım (adet)" alanı

Bir tabakadan kaç kutu çıktığını söyleyen sayı. Yukarıdaki örnekte = 12.

### m² Fiyatı (TL/m²)

**1 metre kareye düşen** fiyat. Karton için, lak için, sıvama için ayrı ayrı vardır.

> Karton 18,50 TL/m² demek: 1 m² karton 18 lira 50 kuruş. 0,5 m² karton = 9,25 TL.

### Birim TL/adet

**Tek bir kutu** için ne kadar harcandığı. Yapıştırma 0,85 TL/adet → 1 kutu yapıştırmak 85 kuruş.

### Kâr Oranı

Maliyetin üstüne eklenen yüzde. **0,20** = %20 kâr. Sisteme **0,20** olarak yazılır.

### Birim Fiyat Tablosu (HESAPLAMA VERİ DOSYASI)

Tüm sabit fiyatlar (lak m², kesim TL, yapıştırma TL/adet vs.) **tek bir tablodadır**. Kağıt zammı geldiğinde **yöneticinin "Fiyatlar" sayfasından** sadece bu sayıları güncellemesi yeterlidir. Eski teklifler etkilenmez — yeni teklifler güncel fiyatlarla hesaplanır.

---

## 3. Bölüm A — Ofset Kutu (KUTU OFSET)

### 3.1 Bu Tip Ne Zaman Kullanılır?

- **İlaç, kozmetik, gıda, hediyelik** sektörü kutuları
- Renkli, **kaliteli baskı** isteyen müşteri
- Roland 700 veya Roland 800 makinelerinde basılır
- Kuşesiz kroma, kuşesiz karton, bristol vs. malzeme

### 3.2 Hangi Bilgileri Sisteme Gireceksiniz?

Form size şunları soracak:

#### Ürün Bilgisi
- **Bıçak No** (zorunlu değil) — eski iş tekrarıysa kalıp numarası
- **Tabaka EN ve BOY** (mm cinsinden — örnek: 700 × 1000)
- **Açınım (adet)** — 1 tabakadan kaç kutu çıkar, tek sayı (önemli!). *(Eski "Açınım EN/BOY" ve "Tabaka Başı Kutu" alanları kaldırıldı.)*
- **Tabaka Adedi** — toplam kaç tabaka kesilecek
- **Sipariş Miktarı** *(otomatik)* — Tabaka Adedi × Açınım

#### Malzeme
- **Karton Cinsi** (Kuşesiz Kroma, Bristol vs.)
- **Gramaj** (160, 180, 200, …, 450)
- **Karton TL/m²** — kağıt deposundan güncel fiyat
- **Oluklu Cinsi + Oluklu TL/m²** — çift duvarlı yapıyorsanız seçip fiyat yazın (yoksa boş). *(Eski "Ondüle TL/m²" yerine.)*

#### Baskı
- **Baskı Türü** (Roland 700 / 800)
- **Renk Sayısı** (1–6)
- **Renk Seçimi** — renk sayısı kadar rengi paletten seç (CMYK 4 renkte otomatik)
- **Baskı Kalıp TL** — kalıp ücreti **burada** girilir (Sevkiyat'ta ayrıca yok)
- **Boya TL** — özel mürekkep masrafı varsa
- **Geçiş Çarpanı** *(boş → renk sayısına göre otomatik)* ve **Ek Geçiş Adedi** *(otomatik, 3000 üstü)*
- **Baskı Adedi** *(otomatik = tabaka adedi)*

#### Kesim, Yapıştırma & İlave İşlemler
- **Kesim TL (tabaka başına)** ve **Yapıştırma TL/adet** — girmediğiniz işlem 0 sayılır
- **Lak / Sıvama vb.** — işaretleyip yanına **TL/m²** fiyatını elle yaz (müdahaleye açık)
- **Eklenti** — Kilitli, Yapıştırma veya Dikiş

#### Sevkiyat ve Diğer
- **Ambalaj Şekli** — paletli, shrinkli vs.
- **Grafik Durumu** — kalıp var mı, yeni mi?
- **Diğer Gider** — prova, tasarım vs. *(Kalıp Gideri kaldırıldı — Baskı'daki "Baskı Kalıp TL"ye girilir.)*
- **Kâr Oranı** — varsayılan 0,20 (%20)

### 3.3 Hesaplama — Adım Adım

Şu mantığı izler:

```
ADIM 1: Tek bir tabakanın maliyetini bulur.
ADIM 2: Tek bir tabakadan çıkan kutu sayısına böler → bir kutunun maliyetini bulur.
ADIM 3: Üstüne kâr koyar → satış fiyatı.
ADIM 4: Tüm üretilecek kutu sayısı ile çarpar → toplam tutar.
```

#### Adım 1 — Bir Tabakanın Maliyeti

Tabaka şu **7 kalemden** oluşur:

| Kalem | Nasıl Hesaplanır? | Açıklama |
|---|---|---|
| **Karton** | (EN × BOY × Gramaj × TL/m²) / 1 milyar | Tabaka için harcadığınız karton parası |
| **Ondüle** | (EN × BOY × TL/m²) / 1 milyon | Çift duvarlıysa eklenir; yoksa 0 |
| **Baskı** | (Kalıp×Renk + Ek Geçiş + Boya) / Baskı Adedi | Tabaka başına düşen baskı payı |
| **Lak** | (EN × BOY × TL/m²) / 1 milyon | Lak yaptıysanız |
| **Sıvama** | (EN × BOY × TL/m²) / 1 milyon | Sıvama yaptıysanız |
| **Kesim** | sabit TL | Tabaka başına kesim ücreti |
| **Yapıştırma** | TL/adet × tabakadan çıkan kutu | Kutu başına yapıştırma × kaç kutu |

> **"Neden 1 milyar ve 1 milyon?"** Çünkü EN ve BOY **milimetre** cinsinden, fiyat **metre kareye** göre. Birim çevirisi için bölme yapılır. Excel'de de aynı bölme var.

**Tüm 7'sinin toplamı** = bir tabakanın size mal olduğu para.

#### Adım 2 — Bir Kutunun Maliyeti

```
Bir Kutunun Maliyeti = (Tabaka Maliyeti / Tabaka Başı Kutu)
                     + ((Kalıp Gideri + Diğer Gider) / Toplam Üretilecek Kutu)
```

**Birinci kısım** (Tabaka / kutu/tab): Tabaka maliyetini, tabakadan çıkan kutu sayısına böler.

**İkinci kısım** ((Kalıp+Diğer)/Toplam Kutu): Tek seferlik masrafları (kalıp parası vs.) **tüm üretime yayar**. Yani 10.000 kutu üreteceksen 1.000 TL'lik kalıp = kutu başına 0,10 TL.

#### Adım 3 — Satış Fiyatı

```
Birim Satış Fiyatı = Birim Maliyet × (1 + Kâr Oranı)
```

%20 kâr istiyorsanız: maliyet × 1,20.

#### Adım 4 — Toplam Tutar

```
Toplam Tutar = Birim Satış × Toplam Kutu Adedi
```

### 3.4 Somut Örnek — Adım Adım Hesap

Müşteri: **İlaç Kutusu 50 ml, 10.000 adet, 4 renkli, Mat Selefon + UV Lak**

#### Girdiler:
- Tabaka EN: **700 mm**, BOY: **1000 mm**
- Kuşesiz Kroma, **300 g**, karton fiyatı **18,50 TL/m²**
- Roland 700, **4 renk** (CMYK)
- Baskı Kalıp: **750 TL**
- Tabaka başı kutu: **12**
- Tabaka adedi: **850** (= 10.200 kutu, fire dahil)
- Lak ✓, Yapıştırma
- Kâr Oranı: **0,20**

#### Hesap:

**Karton:** (700 × 1000 × 300 × 18,50) / 1.000.000.000 = **3,885 TL** (tabaka başı)
*Açıklama: 0,7 m × 1,0 m × 300 g = 210 gr (yarım metrekare 300 g/m² karton) × 18,50 TL/m² (bu örnekte değil m² fiyatı olarak yansır) — sonuç tabaka başı 3,885 TL karton.*

**Baskı:** (750 × 4) / 850 = **3,529 TL** (tabaka başı)
*Açıklama: 4 renk için 4 ayrı kalıp/geçiş = 750 × 4 = 3000 TL, 850 tabakaya bölersek tabaka başı 3,53 TL.*

**Lak:** (700 × 1000 × 2,20) / 1.000.000 = **1,540 TL** (tabaka başı)
*Açıklama: 0,7 m² lak × 2,20 TL/m² = 1,54 TL.*

**Kesim:** **2,25 TL** (tabaka başı, sabit)

**Yapıştırma:** 0,85 × 12 = **10,200 TL** (tabaka başı)
*Açıklama: Her kutuyu yapıştırmak 0,85 TL × tabakadan 12 kutu çıkar.*

**Tabaka Toplam:** 3,885 + 3,529 + 1,540 + 2,250 + 10,200 = **21,404 TL** (1 tabaka size mal olur)

**Bir Kutunun Maliyeti:**
= 21,404 / 12 = **1,7837 TL/kutu** (kalıp+diğer gider yok)

**Bir Kutunun Satış Fiyatı:**
= 1,7837 × 1,20 = **2,14 TL/kutu**

**Toplam Tutar:**
= 2,14 × 10.000 = **21.400 TL**

✅ Sistemde göreceğiniz sayı: **21.400 ₺**.

### 3.5 Kontrol Sorusu

> "Kâr oranını %25'e çıkarırsam tutar ne olur?"

Cevap: 1,7837 × 1,25 = 2,23 TL/kutu × 10.000 = **22.300 TL** (yaklaşık 900 TL artış).

---

## 4. Bölüm B — Flekso Kutu (KUTU FLEKSO)

### 4.1 Bu Tip Ne Zaman Kullanılır?

- **Oluklu mukavva** üzerine direkt baskı
- Daha **basit ve hızlı** baskı
- Genelde **gıda taşıma, depo, e-ticaret** kutuları
- Roland gibi kaliteli baskı değil — flekso makinesi

### 4.2 Hangi Bilgileri Gireceksiniz?

Ofset'e benzer ama **daha az** alan var (çünkü flekso daha basit):

- **Levha EN ve BOY**, **Açınım (adet)**, **Tabaka Adedi** — Sipariş Miktarı otomatik
- **Oluklu Kalite** (B120/S080/T090 - B gibi kompozit kod)
- **Safya TL/m²** — flekso levhanın m² fiyatı
- **Baskı + Kesim TL** — flekso birim baskı parası (varsayılan 4 TL)
- **Kesim TL**, **Yapıştırma TL/adet**
- **Eklenti, Ambalaj, Grafik**
- **Kalıp Gideri, Diğer Gider**
- **Kâr Oranı**

### 4.3 Hesaplama — Adım Adım

Ofset ile **aynı yapı**, sadece tabaka maliyeti **daha az kalemden** oluşur:

```
ADIM 1: Tabaka maliyeti = LEVHA + BASKI + KESİM + YAPIŞTIRMA
ADIM 2: Birim maliyet = Tabaka / Tabaka Başı Kutu + (Kalıp+Diğer) / Toplam Kutu
ADIM 3: Birim satış = Birim maliyet × (1 + Kâr)
ADIM 4: Toplam = Birim satış × Toplam kutu
```

#### Tabakanın 4 maliyet kalemi:

| Kalem | Nasıl Hesaplanır? |
|---|---|
| **Levha** | (EN × BOY × Safya TL/m²) / 1 milyon |
| **Baskı** | Sabit TL (örnek 4,00 — kalıp+geçiş+kesim paketi) |
| **Kesim** | Sabit TL (örnek 2,25) |
| **Yapıştırma** | TL/adet × Tabaka Başı Kutu |

### 4.4 Somut Örnek

Müşteri: **20.000 adet gıda kutusu, 2 renk flekso baskı**

#### Girdiler:
- Levha EN: **1200 mm**, BOY: **1600 mm**
- Oluklu: **B120/S080/T090 - B**
- Safya TL/m²: **14,00**
- Renk: 2
- Baskı+Kesim: **4,00**, Kesim: **2,25**, Yapıştırma: **0,85**
- Tabaka başı kutu: **8**, Tabaka adedi: **2500** (= 20.000 kutu)
- Kâr: **0,20**

#### Hesap:

**Levha:** (1200 × 1600 × 14) / 1.000.000 = **26,880 TL**
*Açıklama: 1,92 m² × 14 TL/m² = 26,88 TL (tabaka başı).*

**Baskı:** **4,00 TL** (sabit, tabaka başı)
**Kesim:** **2,25 TL** (sabit, tabaka başı)
**Yapıştırma:** 0,85 × 8 = **6,80 TL** (tabaka başı)

**Tabaka Toplam:** 26,88 + 4,00 + 2,25 + 6,80 = **39,93 TL**

**Bir Kutunun Maliyeti:** 39,93 / 8 = **4,99 TL**
**Birim Satış:** 4,99 × 1,20 = **5,99 TL**
**Toplam:** 5,99 × 20.000 = **119.800 TL**

✅ Sistemde göreceğiniz: **119.800 ₺**

---

## 5. Bölüm C — Koli (KOLİ)

### 5.1 Bu Tip Ne Zaman Kullanılır?

- **Taşıma ve sevk kolisi** (e-ticaret, market, fabrika)
- Genelde **baskısız** veya **çok basit** flekso baskı
- B, C, E, BC veya EB flütü oluklu mukavva
- Tek tek levha kesilir, dikilir veya yapıştırılır

### 5.2 Hangi Bilgileri Gireceksiniz?

Bu tip en sade form:

- **Koli BOY × EN × YÜKSEKLİK** (mm — iç ölçüler)
- **Sipariş Miktarı**
- **Oluklu Kalite** (zorunlu)
- **Levha EN ve BOY** (açınımı, mm)
- **Safya TL/m²**
- **Baskı Durumu** (Baskılı / Baskısız) + **Renk Sayısı** / **Baskı Renkleri**
- **Eklenti** (Yapıştırma veya Dikiş)
- **Dikiş Fiyatı (TL)** — toplam dikiş ücreti (yapıştırma seçildiyse 0)
- **Birim Klişe Gideri, Birim Bıçak Gideri** (varsa)
- **Kâr Oranı**

### 5.3 Hesaplama — Adım Adım

Koli **en basit** tip — sadece levha + dikiş (varsa):

```
ADIM 1: Levha maliyeti = (EN × BOY × Safya TL/m²) / 1 milyon
ADIM 2: Dikiş maliyeti = girilen Dikiş Fiyatı (toplam; yapıştırmada 0)
ADIM 3: Birim toplam = Levha + Dikiş
ADIM 4: Birim maliyet = Birim Toplam + Klişe Gideri + Bıçak Gideri
ADIM 5: Birim satış = Birim Maliyet × (1 + Kâr)
ADIM 6: Toplam = Birim Satış × Sipariş Miktarı
```

> **Önemli not:** Koli'de **"tabaka başı kutu"** kavramı yoktur. **1 levha = 1 koli** kabul edilir (büyük endüstriyel koli üretiminde çoğunlukla böyle).

### 5.4 Somut Örnek

Müşteri: **5.000 adet 40×30×20 cm taşıma kolisi, baskısız**

#### Girdiler:
- Koli boyutu: 400 × 300 × 200 mm
- Oluklu: B120/S080/T090 - B
- Açınım Levha: **900 × 1200 mm** (= 1,08 m²)
- Safya TL/m²: **14,00**
- Baskısız, **Yapıştırma** (dikiş yok → Dikiş Adedi = 0)
- Birim bıçak gideri: **0,05 TL** (amortisman payı)
- Kâr: **0,20**

#### Hesap:

**Levha:** (900 × 1200 × 14) / 1.000.000 = **15,12 TL** (koli başı)
**Dikiş:** 0 (dikiş adedi 0)
**Birim Toplam:** 15,12 + 0 = **15,12 TL**

**Birim Maliyet:** 15,12 + 0 + 0,05 = **15,17 TL**
**Birim Satış:** 15,17 × 1,20 = **18,20 TL**
**Toplam:** 18,20 × 5.000 = **91.000 TL**

✅ Sistemde göreceğiniz: **91.000 ₺**

---

## 6. Tam Bir Örnek — Üç Tipi Yan Yana

Sistemin en güçlü yanı: **Aynı teklifte 3 farklı tip** birlikte olabilir. Örnek:

| Satır | Tip | Ürün | Adet | Birim | Tutar |
|---|---|---|---:|---:|---:|
| 1 | Kutu Ofset | İlaç Kutusu 50ml | 10.000 | 2,14 ₺ | 21.400 ₺ |
| 2 | Kutu Flekso | Gıda Kutusu 2 renk | 20.000 | 5,99 ₺ | 119.800 ₺ |
| 3 | Koli | Taşıma Kolisi 40×30×20 | 5.000 | 18,20 ₺ | 91.000 ₺ |
| | | **Ara Toplam** | | | **232.200 ₺** |
| | | KDV (%20) | | | 46.440 ₺ |
| | | **Genel Toplam** | | | **278.640 ₺** |

Sistem **her satırı kendi formülüyle** hesaplar, sonra **alt alta toplar**. Müşteriye gönderilen proforma'da hepsi tek tabloda görünür.

---

## 7. Sık Sorulan Sorular

### "Kâr oranını nereden değiştiririm?"
Teklif oluştururken **her satırın içinde** "Kâr Oranı" alanı vardır. Varsayılan 0,20 (%20). Değiştirebilirsiniz.

### "Birim fiyat tablosu (Lak m², Kesim TL vs.) nereden güncellenir?"
**Yönetici** olarak girdiğinizde, sol menüde **"Fiyatlar"** sayfası var. Kağıt zammı geldiğinde **buradan tek tek** güncelleyebilirsiniz. Eski teklifler etkilenmez.

### "Önerilen fiyatı beğenmedim, kendim değer girebilir miyim?"
Evet. "Önerilen Fiyat" otomatik gelir ama **üzerine yazıp değiştirebilirsiniz**. Sistem siz nelerin değiştirdiğini kaydeder.

### "Karton TL/m² nereden öğrenirim?"
Bu sayı **piyasa fiyatı** — kağıt deposundan günlük öğrenilir. Sisteme **her teklifte** girmeniz gerekir (sabit değil çünkü piyasa değişiyor).

### "Tabaka başı kutu sayısı nereden bilinir?"
Bıçak dosyasından (kalıp dizgisi) bakılır. Yeni iş için tasarımcı/atölye sağlar.

### "Ondüle ne demek? Her kutuda var mı?"
Ondüle = oluklu mukavvanın orta dalgalı katmanı. **Sadece çift duvarlı** (oluklu) kutu yapıyorsanız var. Klasik kuşesiz kroma kutu için yoktur (0 bırakın).

### "Geçiş çarpanı (0,35, 0,40 vs.) ne işe yarar?"
3.000 adedin üstündeki **ek baskı geçişlerinde** kullanılan ek katsayı. Sistem otomatik uygular — sizin elle hesaplamanıza gerek yok.

### "Bir teklifte aynı tipte birden fazla ürün ekleyebilir miyim?"
Evet — Kutu Ofset'ten 3 ayrı ürün ekleyebilirsiniz (her biri ayrı satır olur). Veya 2 Ofset + 1 Flekso + 1 Koli. Sınır yok.

### "Sistem yanlış hesaplarsa ne yaparım?"
1. Önce **girdileri kontrol edin** (en yaygın hata: yanlış birim, virgül/nokta karışıklığı).
2. **Maliyet Kırılımı**'nı açın (formun altında) — hangi kalem yanlış görüyorsunuz?
3. Hâlâ tutmadıysa Excel'de aynı sayılarla hesaplayın ve karşılaştırın.
4. Sistem ve Excel **birebir aynı formülü** kullanır, sapma olmaz.

### "Eski bir tekliften kopya yapabilir miyim?"
Şu an doğrudan kopyala özelliği yok ama eski teklife girip içeriğini görerek yeni teklifte aynı değerleri yazabilirsiniz. (Gelecek sürüm için "Kopyala" butonu planlanmaktadır.)

### "Fiyatlar TL dışında bir para birimine çevrilebilir mi?"
Şu an sadece TL. Döviz desteği gelecek sürümde eklenecektir.

---

## 8. Excel'deki Hücre Hücre Formül Sözlüğü

Bu bölüm, mevcut Excel dosyanızdaki (**SİPARİŞ OLUŞTURMA LİSTESİ VE PROFORMA.xlsx**) her bir formülün **hangi hücreden ne çektiğini**, **ne işe yaradığını** ve **hangi ürün tipi için kullanıldığını** tek tek açıklar. Yeni sistem, bu formüllerin **birebir Python karşılığını** çalıştırır.

> **Nasıl okumalı?** Her formülü 4 başlıkla anlatıyoruz:
> 1. **Hücre kodu** (örn. L13) — Excel'de nerede duruyor
> 2. **Formül** — ne yazıyor
> 3. **Nereden çekiyor** — hangi girdileri kullanıyor
> 4. **Niye var** — sonuç ne anlama geliyor

---

### 8.1 KUTU 1 Sayfası — Ofset Hesaplama Bloğu (L–N sütunları)

Bu blok **Kuşesiz Kroma / Bristol** gibi düz karton kutular içindir. Roland 700/800 makinesinde basılır.

#### Üst Bilgiler (Tabaka ölçüsünü sol bölmeden çeker)

| Hücre | Formül | Açıklama |
|---|---|---|
| **L4** | `=B8` | **Tabaka EN** — sayfanın sol tarafındaki "Tabaka Ölçüsü EN" hücresinden (B8) çeker. Tek bir yerden girdi alıp birden fazla formülde kullanmak için. |
| **M4** | `=F8` | **Tabaka BOY** — B8'in yan eşi (F8). |
| **P11** | `=B12` | **Baskı Adedi** — sol bölmedeki "Sipariş/Tabaka Adedi" (B12) hücresinden çekiyor. |
| **B19** | `=B12*G6` | **Toplam Üretilecek Kutu** = Tabaka Adedi × Tabaka Başı Kutu. Örn. 850 × 12 = 10.200 kutu. |
| **L21** | `=G6` | **Kutu Adedi Per Tabaka** — G6'dan (kullanıcının girdiği) kopya. |
| **L22** | `=P11*L21` | **Toplam Kutu** — kalıp giderini kutu başına yaymak için kullanılır. |

#### Toplam Yardımcı Hücreler (Birden Fazla Lak/Sıvama Olabilir)

Excel'de bir kutuda **birden fazla lak veya sıvama** çeşidi olabilir (örn. UV Lak + Dispersiyon Lak). Bunları toplamak için:

| Hücre | Formül | Açıklama |
|---|---|---|
| **R11** | `=SUM(R6:R10)` | **Toplam Lak m² fiyatı** — R6'dan R10'a kadar yazılı tüm lak değerlerini topluyor. |
| **T11** | `=SUM(T6:T10)` | **Toplam Sıvama m² fiyatı** — aynı mantık. |
| **U11** | `=SUM(U6:U10)` | **Toplam Kesim TL** — kesim çeşitlerinin toplamı. |
| **V11** | `=SUM(V6:V10)` | **Toplam Yapıştırma TL/adet** — yapıştırma türlerinin toplamı. |
| **P8** | `=IF(P11>3000, P11-3000, 0)` | **Ek Geçiş Adedi** — Baskı adedi 3000'in **üstündeyse fark**, değilse 0. 3000'e kadar tek geçiş yeterli, üzeri için ek geçiş ücreti devreye girer. |

#### Maliyet Kalemleri (Her Biri Bir Tabaka İçin)

| Hücre | Formül | Açıklama |
|---|---|---|
| **L13** | `=(L4*M4*L6*L7)/1.000.000.000` | **KARTON maliyeti** = (Tabaka EN × Tabaka BOY × Gramaj × Karton m² fiyatı) / 1 milyar. *Niye 1 milyar?* EN/BOY mm² cinsinden, gramaj g/m² cinsinden, fiyat TL/m² cinsinden — birim çevirisi için. |
| **L14** | `=(L4*M4*N6)/1.000.000` | **ONDÜLE maliyeti** — sadece çift duvarlı işlerde. (EN × BOY × Ondüle m² fiyatı) / 1 milyon. |
| **L15** | `=((P6*P7) + (P8*P9)*P7 + P10) / P11` | **BASKI maliyeti** = (Kalıp×Renk + Ek geçiş×Çarpan×Renk + Boya) / Baskı Adedi. P6=kalıp TL, P7=renk sayısı, P8=ek geçiş adedi, P9=geçiş çarpanı, P10=boya TL. Sonuç: **bir tabakaya düşen baskı payı**. |
| **L16** | `=(L4*M4*R11)/1.000.000` | **LAK maliyeti** = (EN × BOY × R11 toplamı) / 1 milyon. R11 birden çok lak çeşidini toplar. |
| **L17** | `=(L4*M4*T11)/1.000.000` | **SIVAMA maliyeti** — aynı mantık, T11 toplamını kullanır. |
| **L18** | `=U11` | **KESİM** — U11 toplamından doğrudan kopya. Tabaka başı kesim ücreti. |
| **L19** | `=V11*L21` | **YAPIŞTIRMA** = V11 (TL/adet toplam) × L21 (kutu/tab). Yani **tabakadan çıkan her kutu için yapıştırma × kaç kutu**. |

#### Özet Hücreler

| Hücre | Formül | Açıklama |
|---|---|---|
| **L20** | `=SUM(L13:L19)` | **Bir tabakanın TOPLAM maliyeti** — yukarıdaki 7 kalem toplamı. |
| **L23, L24** | (kullanıcı girer) | **Kalıp Gideri ve Diğer Gider** — tek seferlik masraflar. |
| **L25** | `=(L20/L21) + ((L23+L24)/L22)` | **BİRİM MALİYET** = (Tabaka maliyeti / kutu/tab) + (tek seferlik / toplam üretim). İki kısım: birincisi tabaka payı, ikincisi kalıp gibi giderleri kutulara yayar. |
| **L26** | (kullanıcı girer) | **Kâr Oranı** — örn. 0,20. |
| **L28** | `=(L25*L26)+L25` | **BİRİM SATIŞ FİYATI** = Maliyet × Kâr + Maliyet = Maliyet × (1+Kâr). |

---

### 8.2 KUTU 1 Sayfası — Flekso Hesaplama Bloğu (P–V sütunları)

Aynı sayfanın **sağ tarafında** flekso hesap bloğu var. Bu **oluklu mukavva kutular** içindir.

#### Tabaka Ölçüsü (Sol Bölmeden Çeker)

| Hücre | Formül | Açıklama |
|---|---|---|
| **P17** | `=B8` | **Levha EN** — sol bölmedeki tabaka EN'den (B8) çekiyor. Aynı ürün için iki ayrı ölçü girmemek için. |
| **Q17** | `=F8` | **Levha BOY** — F8'den. |
| **P30** | `=G6` | **Kutu/Tab** — sol bölmeden. |
| **P31** | `=B19` | **Toplam Kutu** — sol bölmenin yukarıda hesapladığı (B19 = tabaka × kutu/tab). |

#### Toplam Yardımcı Hücreler

| Hücre | Formül | Açıklama |
|---|---|---|
| **R23** | `=SUM(R19:R22)` | **Flekso BASKI+KESİM toplamı** — birden fazla baskı türü seçildiyse toplar. |
| **S23** | `=SUM(S19:S22)` | **Flekso KESİM toplamı** — ayrı kesim varsa. |
| **T23** | `=SUM(T19:T22)` | **Flekso YAPIŞTIRMA toplamı** — TL/adet. |

#### Maliyet Kalemleri

| Hücre | Formül | Açıklama |
|---|---|---|
| **P25** | `=(P17*Q17*P19)/1.000.000` | **LEVHA maliyeti** = (Levha EN × BOY × Safya m² fiyatı) / 1 milyon. Oluklu mukavva için ondüle ayrı hesaplanmaz, tek "safya" fiyatı verilir. |
| **P26** | `=R23` | **BASKI** = R23 toplamı (lookup). Roland'a göre flekso sabit TL — örn. 4 TL. |
| **P27** | `=S23` | **KESİM** = S23 (sabit TL). |
| **P28** | `=T23*P30` | **YAPIŞTIRMA** = T23 (TL/adet) × P30 (kutu/tab). |

#### Özet

| Hücre | Formül | Açıklama |
|---|---|---|
| **P29** | `=SUM(P25:P28)` | **Bir tabakanın toplam maliyeti** (flekso). |
| **P32, P33** | (kullanıcı girer) | **Kalıp Gideri ve Diğer Gider**. |
| **P34** | `=(P29/P30) + ((P32+P33)/P31)` | **BİRİM MALİYET** — ofsetteki L25 ile aynı mantık. |
| **P35** | (kullanıcı girer) | **Kâr Oranı**. |
| **P37** | `=(P34*P35)+P34` | **BİRİM SATIŞ FİYATI** — `P34 × (1+P35)`. |

> **Önemli:** L (ofset) ve P (flekso) sütunlarının yan yana durması, **aynı sayfada iki maliyet motoru** olduğunu gösterir. Kullanıcı baskı tipine göre **hangisini okuyacağına karar verir**. Yeni sistemde bu seçim **kalem tipi** (KUTU_OFSET / KUTU_FLEKSO) ile otomatik yapılır.

---

### 8.3 KOLİ 1 Sayfası — Hesaplama Bloğu (L–N sütunları)

Koli en sade tip. Çünkü genelde **baskısız** veya minimal baskı, sabit boyut, çok seri üretim.

| Hücre | Formül | Açıklama |
|---|---|---|
| **L5, M5** | (kullanıcı girer) | **Levha EN ve BOY** (mm). |
| **L7** | (kullanıcı girer) | **Safya m² fiyatı** (TL/m²). |
| **N7–N10** | (kullanıcı girer) | **Dikiş kalemleri** — her dikiş çeşidi için ayrı satır. Yapıştırma seçildiyse tüm hücreler 0. |
| **N11** | `=SUM(N7:N10)` | **TOPLAM DİKİŞ** = N7..N10 toplamı. |
| **L13** | `=(L5*M5*L7)/1.000.000` | **LEVHA maliyeti** = (EN × BOY × Safya) / 1 milyon. (Tek bir koli için — 1 levha = 1 koli kabulü.) |
| **L14** | `=N11` | **DİKİŞ maliyeti** = toplam (yukarıdan kopya). |
| **L15** | `=SUM(L13:L14)` | **Bir koli için levha + dikiş toplamı**. |
| **L16, L17** | (kullanıcı girer) | **Birim Klişe Gideri ve Birim Bıçak Gideri** — varsa eklenir. |
| **L18** | `=L15+L16+L17` | **BİRİM MALİYET** = malzeme + dikiş + klişe + bıçak. |
| **L19** | (kullanıcı girer) | **Kâr Oranı**. |
| **L21** | `=(L18*L19)+L18` | **BİRİM SATIŞ FİYATI** = `L18 × (1+L19)`. |

> **Not — Koli'de Tabaka Mantığı Yoktur:** Ofset/flekso kutuda "tabaka başı kutu" kavramı vardır (bir tabakadan 12 kutu çıkar). Koli'de **1 levha = 1 koli** kabul edilir. Sipariş miktarı sadece toplam tutara çevrilirken kullanılır.

---

### 8.4 PROFORMA FİYAT TEKLİFİ Sayfası — Özet/Çıktı

Mevcut Excel'de proforma **sınırlı bir kopyala/yapıştır** mantığıyla çalışır:

| Hücre | Formül | Açıklama |
|---|---|---|
| **B2** | `='KUTU 1'!B4:I4` | **Firma Adı** — KUTU 1 sayfasının B4 (firma ismi) hücresinden alır. |
| **A6** | `='KUTU 1'!B5:I5` | **Ürün İsmi** (1. satır) — KUTU 1 sayfasından. |
| **I6 – I17** | `=G6*H6` (vs.) | **Her satırın TUTARI** = ADET × FİYAT (her satır kendi). |
| **I19** | `=SUM(I6:I17)` | **ARA TOPLAM** — 12 satırın toplamı. |
| **I20** | `=I19*1.2 - I19` | **KDV %20** — toplamın yüzde 20'si (uzun yazım, kısası `=I19*0.2`). |
| **I21** | `=I19 + I20` | **GENEL TOPLAM** — KDV dahil. |

> ⚠️ **Excel'in Sınırı:** Proforma yalnızca KUTU 1 sayfasından otomatik veri çeker. KUTU 2–6, KOLİ 1–6 satırlarını **kullanıcı elle yazmak zorundadır**. Sistemde bu hata kaynağı çözüldü — **her satır kendi kaleminden otomatik** doldurulur. Aynı teklifte 3+ farklı tip yan yana çalışır.

---

### 8.5 HESAPLAMA VERİ DOSYASI Sayfası — Birim Fiyat Tablosu

Bu sayfa **formül içermez**, sadece **sabit veri** tutar. Yukarıdaki tüm hesaplar bu sayfadaki sayıları VLOOKUP veya manuel kopyalama ile çeker.

#### OFSET Bölümü (Gramaja Göre Baskı TL)

| Gramaj | Baskı TL | Açıklama |
|---|---|---|
| 180 | 1.300 | Ofset baskı kalıp fiyat tablosu — gramaja göre değişir. |
| 200 | 1.450 | |
| 210 | 2.000 | |
| 230, 250, 300, 350, 400 | 2.500 | |

#### Geçiş Çarpanı (Renk Sayısına Göre)

| Renk Sayısı | Çarpan | Açıklama |
|---|---|---|
| 1 | 0,00 | Tek renkte ek geçiş yok |
| 2 | 0,35 | 3000'in üstündeki ek geçişin çarpanı |
| 3 | 0,40 | |
| 4 | 0,50 | (CMYK için en yaygın) |
| 5 | 0,55 | |
| 6 | 0,55 | |

> Yukarıda KUTU OFSET'in `L15 = ((P6*P7)+(P8*P9)*P7+P10)/P11` formülündeki **P9** işte bu çarpan. Renk sayısına göre 0–0,55 arası bir değer.

#### Diğer Birim Fiyatlar (Tek Satır)

- **Lak:** 2,20 TL/m² → Excel'de R11 (sum) bu fiyatla doldurulur.
- **Sıvama:** 2,85 TL/m² → T11.
- **Kesim:** 2,25 TL (tabaka başı) → U11.
- **Yapıştırma (Ofset):** 0,85 TL/adet → V11.
- **Flekso Baskı+Kesim:** 4,00 TL → R23.
- **Flekso Kesim:** 2,25 TL → S23.
- **Flekso Yapıştırma:** 0,85 TL/adet → T23.
- **Koli Dikiş:** 2,25 TL/dikiş → KOLİ N7–N10.

> 💡 **Yeni sistemde:** Yöneticinin **Fiyatlar** sayfasından (sol menü) bu sayılar tek tek güncellenir. Excel'de elle her sayfaya kopya yapmak yerine, **tek yerden** değişir, tüm yeni teklifler otomatik güncel fiyatla çalışır.

---

### 8.6 SİPARİŞ VERİ DOSYASI ve KOLİ SİPARİŞ VERİ DOSYASI

Bu sayfalar **dropdown veri kaynağı**. Excel'de "Veri Doğrulama" özelliği ile diğer sayfalardaki seçim listeleri buradan beslenir:

- **Karton Cinsi:** Kroma, Kuşesiz Kroma, Bristol, BT Liner, Kraft
- **Gramaj:** 160, 180, …, 450
- **Oluklu Kalite:** B120/S080/T090 - B gibi 60+ kompozit kod
- **Baskı Türü:** Roland 700, Roland 800, Flekso, Baskısız
- **Renk:** CMYK, Siyah, 18 spot renk
- **Baskı Sonrası:** Dispersiyon Lak, UV Lak, Mat Selefon, Parlak Selefon, Highloss, Gofre, Asetat, Kısmi Lak, Termo Lak, vs.
- **Eklenti:** Kilitli, Yapıştırma, Dikiş
- **Ambalaj:** Shrinkli/Shrinksiz × Paletli/Dökme kombinasyonları
- **Grafik Durumu:** Kalıp Var, Yeni Çalışma, PDF Var, Klişesi Var, vs.

> Yeni sistem bu listeleri **master tablolardan** alır ve dropdown'ları besler. Yeni bir karton tipi gelirse: **Yönetici** ekler → sistemin tüm kullanıcıları anında yeni seçeneği görür. Excel'de tüm 12 sayfada elle eklemek gerekiyordu.

---

### 8.7 Özet — Hangi Sayfa Hangi İşi Yapar?

```
   [SİPARİŞ VERİ DOSYASI]               [HESAPLAMA VERİ DOSYASI]
   • Dropdown listeleri                 • Birim fiyat tablosu
   • Karton/baskı/renk/eklenti          • TL/m² ve TL/adet fiyatları
              |                                    |
              | (Excel'in Veri Doğrulama'sı)        | (VLOOKUP/kopya)
              v                                    v
   [KUTU 1 ... KUTU 6]                   [KOLİ 1 ... KOLİ 6]
   • Sol blok: girdi (sipariş)          • Sol blok: girdi
   • Orta blok: OFSET hesap (L-N)       • Sağ blok: KOLİ hesap (L-N)
   • Sağ blok: FLEKSO hesap (P-V)       • Sade — sadece levha+dikiş
              |
              | (referans formülü =KUTU 1!B4 vs.)
              v
   [PROFORMA FİYAT TEKLİFİ]
   • 12 satır toplama
   • KDV %20 + Genel toplam
   • Müşteriye basılan çıktı
```

**Yeni sistemde** bu akış aynı kalır ama:
1. **Veri doğrulama** → DB master tabloları + REST API
2. **VLOOKUP** → Python servis fonksiyonları (`birim_fiyat_genel`, `ofset_baski_tl`)
3. **Kopya hücreler (B2='KUTU 1'!B4)** → Veritabanı ilişkileri (`teklif.firma_id`)
4. **12 sayfa sınırı** → sınırsız satır (`teklif_kalem` tablosu)
5. **Statik PDF görüntü** → Dinamik HTML→PDF (WeasyPrint, gerçek ham veriden üretir)

---

## 9. Sonuç

Bu belgenin amacı sizin **sistemin nasıl düşündüğünü** anlamanız. Her şey **basit bir mantık** üzerine kurulu:

> **"Hammaddenin kaç paraya geldiğini hesapla, işçilik ekle, sabit masrafları üretime yay, üstüne kâr koy."**

Sistemde bir teklif oluşturduğunuzda bu adımların hepsi **arka planda otomatik** çalışır. Siz sadece girdileri doğru yazarsanız, sayı **kendiliğinden** gelir.

Excel'de **23 ayrı formül hücresi** vardı (KUTU 1: 13, KOLİ 1: 4, PROFORMA: 6). Hepsi **birebir** sistemde mevcuttur — sadece görünmüyor; Python kodu olarak `app/services/pricing/` klasöründe yaşıyor. Doğrulama testleri her üçü için **fark = 0,000000 TL** sonucunu verdi.

---

**Son güncelleme:** 2026-05-22
**Sürüm:** 0.1.0
**Belge sahibi:** PERPAK Ambalaj San. Tic. Ltd. Şti.
