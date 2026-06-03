export type Rol = "ADMIN" | "SATIS" | "URETIM";
export type TeklifDurum =
  | "TASLAK"
  | "TEKLIF_VERILDI"
  | "BEKLEMEDE"
  | "KABUL"
  | "SIPARIS"
  | "RED"
  | "IPTAL";

export type Kullanici = {
  id: string;
  kullanici_adi: string;
  ad_soyad: string;
  unvan?: string | null;
  rol: Rol;
  telefon?: string | null;
  email?: string | null;
  aktif: boolean;
  son_giris?: string | null;
  olusturma_ts: string;
};

export type Firma = {
  id: string;
  ad: string;
  yetkili?: string | null;
  telefon?: string | null;
  email?: string | null;
  adres?: string | null;
  vergi_no?: string | null;
  vergi_dairesi?: string | null;
  notlar?: string | null;
  aktif: boolean;
  olusturma_ts: string;
};

export type AlanSemasi = {
  gruplar: {
    ad: string;
    alanlar: {
      key: string;
      label: string;
      tip: "text" | "number" | "int" | "bool" | "lookup" | "lookup_multi";
      kaynak?: string;
      zorunlu?: boolean;
      min?: number;
      max?: number;
      varsayilan?: any;
    }[];
  }[];
};

export type KalemTipi = {
  kod: string;
  ad: string;
  aciklama?: string;
  alan_semasi: AlanSemasi;
  sira: number;
};

export type MasterData = {
  karton_cinsi: { kod: string; ad: string }[];
  gramaj: { deger: number }[];
  oluklu_kalite: { kod: string; tip: string; aciklama?: string }[];
  baski_turu: { kod: string; ad: string }[];
  renk: { kod: string; ad: string; hex?: string | null }[];
  baski_sonrasi_islem: { kod: string; ad: string }[];
  eklenti: { kod: string; ad: string }[];
  ambalaj_sekli: { kod: string; ad: string }[];
  grafik_durumu: { kod: string; ad: string }[];
  kalem_tipi: KalemTipi[];
  birim_fiyat?: Record<string, number>;
};

export type TeklifKalem = {
  id?: string;
  teklif_id?: string;
  sira_no: number;
  kalem_tipi: string;
  urun_ismi: string;
  adet: number;
  birim_fiyat: number;
  toplam?: number;
  termin?: string | null;
  spesifikasyon: Record<string, any>;
  hesap_detayi: Record<string, any>;
  notlar?: string | null;
};

export type TeklifListItem = {
  id: string;
  teklif_no: string;
  firma_adi: string;
  olusturan_ad: string;
  tarih: string;
  genel_toplam: number;
  durum: TeklifDurum;
  son_aktivite_ts: string;
};

export type Teklif = {
  id: string;
  teklif_no: string;
  firma_id: string;
  olusturan_id: string;
  atanan_id: string;
  yetkili?: string | null;
  tarih: string;
  gecerlilik?: string | null;
  vade_metni?: string | null;
  sevk_yeri?: string | null;
  kdv_orani: number;
  ara_toplam: number;
  kdv_tutari: number;
  genel_toplam: number;
  durum: TeklifDurum;
  durum_aciklama?: string | null;
  notlar?: string | null;
  olusturma_ts: string;
  guncelleme_ts: string;
  son_aktivite_ts: string;
  kapanma_ts?: string | null;
  firma: Firma;
  olusturan: Kullanici;
  atanan: Kullanici;
  kalemler: TeklifKalem[];
};

export const DURUM_RENGI: Record<TeklifDurum, string> = {
  TASLAK: "bg-slate-200 text-slate-700",
  TEKLIF_VERILDI: "bg-blue-100 text-blue-700",
  BEKLEMEDE: "bg-amber-100 text-amber-700",
  KABUL: "bg-emerald-100 text-emerald-700",
  SIPARIS: "bg-violet-100 text-violet-700",
  RED: "bg-rose-100 text-rose-700",
  IPTAL: "bg-slate-100 text-slate-500",
};

export const DURUM_ETIKET: Record<TeklifDurum, string> = {
  TASLAK: "Taslak",
  TEKLIF_VERILDI: "Teklif Verildi",
  BEKLEMEDE: "Beklemede",
  KABUL: "Kabul",
  SIPARIS: "Sipariş",
  RED: "Red",
  IPTAL: "İptal",
};

/**
 * Açık (henüz kapanmamış) sayılan durumlar — dashboard'da "açık teklifler"
 * ve eskime uyarısı bu kümeye uygulanır.
 */
export const ACIK_DURUMLAR: TeklifDurum[] = ["TASLAK", "TEKLIF_VERILDI", "BEKLEMEDE"];
