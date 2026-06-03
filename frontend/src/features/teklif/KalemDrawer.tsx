/**
 * Yeni/var olan teklif kalemi ekleme drawer'ı.
 * - Tip seçimi
 * - Dinamik form (kalem_tipi.alan_semasi'na göre)
 * - Adet & birim fiyat
 * - Canlı hesap önizleme (debounced /hesaplama/preview)
 */
import { useEffect, useMemo, useState } from "react";

import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { useMaster } from "@/hooks/useMaster";
import type { TeklifKalem } from "@/types";
import { tl } from "@/lib/format";
import DinamikForm from "./DinamikForm";

// Maliyet kırılımı anahtarlarının Türkçe karşılıkları
const DETAY_ETIKETI: Record<string, string> = {
  karton_tl: "Karton",
  ondule_tl: "Oluklu",     // Eski "Ondüle" alanı artık "Oluklu"
  oluklu_tl: "Oluklu",
  baski_tl: "Baskı",
  lak_tl: "Lak",
  sivama_tl: "Sıvama",
  kesim_tl: "Kesim",
  yapistirma_tl: "Yapıştırma",
  ilave_islemler_tl: "İlave İşlemler",
  levha_tl: "Levha",
  dikis_tl: "Dikiş",
  alt_toplam: "Alt Toplam",
  tabaka_adet: "Tabaka Adedi",
  acinim: "Açınım",
  montaj_kutu_adet: "Toplam Üretim Adedi",
  ek_gecis_adedi: "Ek Geçiş Adedi",
  gecis_carpan_kullanilan: "Geçiş Çarpanı",
  kalip_gideri: "Kalıp Gideri (Toplam)",
  kalip_gideri_birim: "Kalıp Gideri / Ürün Başına",
  diger_gider: "Diğer Gider",
  diger_gider_birim: "Diğer Gider (Ürün Başına)",
  klise_gideri: "Klişe Gideri",
  bicak_gideri: "Bıçak Gideri",
  kar_orani: "Kâr Oranı",
  siparis_miktari: "Sipariş Miktarı",
};

const ORAN_ANAHTARLAR = new Set(["kar_orani"]);
const ADET_ANAHTARLAR = new Set(["montaj_kutu_adet", "siparis_miktari", "tabaka_adet", "acinim", "ek_gecis_adedi"]);

function formatDetay(k: string, v: any): string {
  if (typeof v !== "number") return String(v);
  if (ORAN_ANAHTARLAR.has(k)) return `%${(v * 100).toFixed(0)}`;
  if (ADET_ANAHTARLAR.has(k)) return v.toLocaleString("tr-TR");
  return tl.format(v);
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (kalem: TeklifKalem) => void;
  initial?: TeklifKalem;
  siraNo: number;
};

export default function KalemDrawer({ open, onClose, onSave, initial, siraNo }: Props) {
  const { data: master } = useMaster();
  const [kalemTipi, setKalemTipi] = useState<string>(initial?.kalem_tipi ?? "");
  const [urunIsmi, setUrunIsmi] = useState(initial?.urun_ismi ?? "");
  const [adet, setAdet] = useState<number>(initial?.adet ?? 0);
  const [spec, setSpec] = useState<Record<string, any>>(initial?.spesifikasyon ?? {});
  const [birimFiyat, setBirimFiyat] = useState<number>(initial?.birim_fiyat ?? 0);
  const [onerilen, setOnerilen] = useState<number | null>(null);
  const [birimMaliyet, setBirimMaliyet] = useState<number | null>(null);
  const [detay, setDetay] = useState<Record<string, any>>(initial?.hesap_detayi ?? {});
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [aciklama, setAciklama] = useState<string>(initial?.notlar ?? "");

  useEffect(() => {
    if (open) {
      setKalemTipi(initial?.kalem_tipi ?? "");
      setUrunIsmi(initial?.urun_ismi ?? "");
      setAdet(initial?.adet ?? 0);
      setSpec(initial?.spesifikasyon ?? {});
      setBirimFiyat(initial?.birim_fiyat ?? 0);
      setOnerilen(null);
      setBirimMaliyet(null);
      setDetay(initial?.hesap_detayi ?? {});
      setHata(null);
      setAciklama(initial?.notlar ?? "");
    }
  }, [open, initial]);

  const tipBilgi = useMemo(
    () => master?.kalem_tipi.find((t) => t.kod === kalemTipi),
    [master, kalemTipi]
  );

  // Adet alanını şemadaki siparis_miktari ile bağla (kritik #11, #4)
  // - Şemada `siparis_miktari` varsa onu kullan
  // - Şemada `auto` tipindeki siparis_miktari = tabaka_adedi × açınım'dan otomatik gelir
  // - Aksi halde kullanıcı kendi "Adet" alanından girer
  useEffect(() => {
    const specMiktar = Number(spec.siparis_miktari ?? 0);
    if (specMiktar > 0 && specMiktar !== adet) {
      setAdet(specMiktar);
    }
  }, [spec.siparis_miktari]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced canlı hesap
  useEffect(() => {
    if (!kalemTipi || !tipBilgi) return;
    const handle = setTimeout(async () => {
      setYukleniyor(true);
      setHata(null);
      try {
        const { data } = await api.post("/hesaplama/preview", {
          kalem_tipi: kalemTipi,
          spesifikasyon: { ...spec, siparis_miktari: adet || spec.siparis_miktari },
        });
        setBirimMaliyet(data.birim_maliyet);
        setOnerilen(data.birim_satis);
        setDetay(data.detay);
        if (initial == null && data.birim_satis > 0 && birimFiyat === 0) {
          setBirimFiyat(Number(data.birim_satis.toFixed(2)));
        }
      } catch (e: any) {
        setHata(e?.response?.data?.detail ?? "Hesap hatası");
      } finally {
        setYukleniyor(false);
      }
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kalemTipi, spec, adet]);

  const toplam = useMemo(() => Number((adet * birimFiyat).toFixed(2)), [adet, birimFiyat]);

  const kaydet = () => {
    if (!kalemTipi || !urunIsmi || adet <= 0) {
      setHata("Tip, ürün ismi ve adet zorunlu");
      return;
    }
    onSave({
      sira_no: initial?.sira_no ?? siraNo,
      kalem_tipi: kalemTipi,
      urun_ismi: urunIsmi,
      adet,
      birim_fiyat: birimFiyat,
      toplam,
      spesifikasyon: spec,
      hesap_detayi: detay,
      notlar: aciklama || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Kalem Düzenle — #${initial.sira_no}` : "Yeni Kalem"}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm">
            {birimMaliyet !== null && (
              <span className="text-slate-500">
                Maliyet: <span className="font-medium text-slate-700">{tl.format(birimMaliyet)}</span>
              </span>
            )}
            {onerilen !== null && (
              <span className="ml-3 text-emerald-700">
                Önerilen: <span className="font-medium">{tl.format(onerilen)}</span>
              </span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={onClose}>İptal</button>
            <button className="btn-primary" onClick={kaydet}>Satırı Kaydet</button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Tip + ürün ismi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Kalem Tipi *</label>
            <select
              className="input"
              value={kalemTipi}
              onChange={(e) => { setKalemTipi(e.target.value); setSpec({}); }}
              disabled={Boolean(initial)}
            >
              <option value="">— Seçin —</option>
              {master?.kalem_tipi.map((t) => (
                <option key={t.kod} value={t.kod}>{t.ad}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Ürün İsmi *</label>
            <input
              className="input"
              value={urunIsmi}
              onChange={(e) => setUrunIsmi(e.target.value)}
              placeholder="örn: İlaç Kutusu 50ml"
            />
          </div>
        </div>

        {tipBilgi && (
          <>
            <hr />
            <DinamikForm
              sema={tipBilgi.alan_semasi}
              degerler={spec}
              onChange={(k, v) => setSpec((p) => ({ ...p, [k]: v }))}
            />
            <hr />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Adet *</label>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={adet || ""}
                  onChange={(e) => setAdet(Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className="label">Birim Fiyat (₺)</label>
                <input
                  className="input"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={birimFiyat || ""}
                  onChange={(e) => setBirimFiyat(Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className="label">Satır Toplam</label>
                <div className="input bg-slate-50 font-semibold">{tl.format(toplam)}</div>
              </div>
            </div>
            {/* Açıklama — sipariş formunda görünür, proforma'da gizli (kritik #17) */}
            <div>
              <label className="label">
                Açıklama
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (sadece sipariş formunda görünür, proformaya yazılmaz)
                </span>
              </label>
              <textarea
                className="input min-h-[60px]"
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="ör: Müşteriye özel ölçü kontrolü yapılacak"
              />
            </div>
            {yukleniyor && <div className="text-xs text-slate-400">Hesaplanıyor...</div>}
            {hata && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-2">{hata}</div>}
            {Object.keys(detay).length > 0 && (
              <details className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                <summary className="cursor-pointer font-medium text-slate-700">Maliyet Kırılımı</summary>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(detay).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-100 py-0.5">
                      <span>{DETAY_ETIKETI[k] ?? k}</span>
                      <span className="font-medium">{formatDetay(k, v)}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
