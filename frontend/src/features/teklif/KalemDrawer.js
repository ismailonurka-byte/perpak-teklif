import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { tl } from "@/lib/format";
import DinamikForm from "./DinamikForm";
// Maliyet kırılımı anahtarlarının Türkçe karşılıkları
const DETAY_ETIKETI = {
    karton_tl: "Karton",
    ondule_tl: "Oluklu", // Eski "Ondüle" alanı artık "Oluklu"
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
function formatDetay(k, v) {
    if (typeof v !== "number")
        return String(v);
    if (ORAN_ANAHTARLAR.has(k))
        return `%${(v * 100).toFixed(0)}`;
    if (ADET_ANAHTARLAR.has(k))
        return v.toLocaleString("tr-TR");
    return tl.format(v);
}
export default function KalemDrawer({ open, onClose, onSave, initial, siraNo }) {
    const { data: master } = useMaster();
    const [kalemTipi, setKalemTipi] = useState(initial?.kalem_tipi ?? "");
    const [urunIsmi, setUrunIsmi] = useState(initial?.urun_ismi ?? "");
    const [adet, setAdet] = useState(initial?.adet ?? 0);
    const [spec, setSpec] = useState(initial?.spesifikasyon ?? {});
    const [birimFiyat, setBirimFiyat] = useState(initial?.birim_fiyat ?? 0);
    const [onerilen, setOnerilen] = useState(null);
    const [birimMaliyet, setBirimMaliyet] = useState(null);
    const [detay, setDetay] = useState(initial?.hesap_detayi ?? {});
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState(null);
    const [aciklama, setAciklama] = useState(initial?.notlar ?? "");
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
    const tipBilgi = useMemo(() => master?.kalem_tipi.find((t) => t.kod === kalemTipi), [master, kalemTipi]);
    // Adet alanını şemadaki siparis_miktari ile bağla (kritik #11, #4)
    // - Şemada `siparis_miktari` varsa onu kullan
    // - Şemada `auto` tipindeki siparis_miktari = tabaka_adedi × açınım'dan otomatik gelir
    // - Aksi halde kullanıcı kendi "Adet" alanından girer
    useEffect(() => {
        const specMiktar = Number(spec.siparis_miktari ?? 0);
        if (specMiktar > 0 && specMiktar !== adet) {
            setAdet(specMiktar);
        }
    }, [spec.siparis_miktari]); // eslint-disable-line react-hooks/exhaustive-deps
    // Debounced canlı hesap
    useEffect(() => {
        if (!kalemTipi || !tipBilgi)
            return;
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
            }
            catch (e) {
                setHata(e?.response?.data?.detail ?? "Hesap hatası");
            }
            finally {
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
    return (_jsx(Modal, { open: open, onClose: onClose, title: initial ? `Kalem Düzenle — #${initial.sira_no}` : "Yeni Kalem", size: "xl", footer: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsxs("div", { className: "text-sm", children: [birimMaliyet !== null && (_jsxs("span", { className: "text-slate-500", children: ["Maliyet: ", _jsx("span", { className: "font-medium text-slate-700", children: tl.format(birimMaliyet) })] })), onerilen !== null && (_jsxs("span", { className: "ml-3 text-emerald-700", children: ["\u00D6nerilen: ", _jsx("span", { className: "font-medium", children: tl.format(onerilen) })] }))] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: "btn-ghost", onClick: onClose, children: "\u0130ptal" }), _jsx("button", { className: "btn-primary", onClick: kaydet, children: "Sat\u0131r\u0131 Kaydet" })] })] }), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Kalem Tipi *" }), _jsxs("select", { className: "input", value: kalemTipi, onChange: (e) => { setKalemTipi(e.target.value); setSpec({}); }, disabled: Boolean(initial), children: [_jsx("option", { value: "", children: "\u2014 Se\u00E7in \u2014" }), master?.kalem_tipi.map((t) => (_jsx("option", { value: t.kod, children: t.ad }, t.kod)))] })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "label", children: "\u00DCr\u00FCn \u0130smi *" }), _jsx("input", { className: "input", value: urunIsmi, onChange: (e) => setUrunIsmi(e.target.value), placeholder: "\u00F6rn: \u0130la\u00E7 Kutusu 50ml" })] })] }), tipBilgi && (_jsxs(_Fragment, { children: [_jsx("hr", {}), _jsx(DinamikForm, { sema: tipBilgi.alan_semasi, degerler: spec, onChange: (k, v) => setSpec((p) => ({ ...p, [k]: v })) }), _jsx("hr", {}), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Adet *" }), _jsx("input", { className: "input", type: "number", inputMode: "numeric", value: adet || "", onChange: (e) => setAdet(Number(e.target.value || 0)) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Birim Fiyat (\u20BA)" }), _jsx("input", { className: "input", type: "number", step: "any", inputMode: "decimal", value: birimFiyat || "", onChange: (e) => setBirimFiyat(Number(e.target.value || 0)) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Sat\u0131r Toplam" }), _jsx("div", { className: "input bg-slate-50 font-semibold", children: tl.format(toplam) })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "label", children: ["A\u00E7\u0131klama", _jsx("span", { className: "ml-2 text-xs font-normal text-slate-400", children: "(sadece sipari\u015F formunda g\u00F6r\u00FCn\u00FCr, proformaya yaz\u0131lmaz)" })] }), _jsx("textarea", { className: "input min-h-[60px]", value: aciklama, onChange: (e) => setAciklama(e.target.value), placeholder: "\u00F6r: M\u00FC\u015Fteriye \u00F6zel \u00F6l\u00E7\u00FC kontrol\u00FC yap\u0131lacak" })] }), yukleniyor && _jsx("div", { className: "text-xs text-slate-400", children: "Hesaplan\u0131yor..." }), hata && _jsx("div", { className: "text-sm text-rose-600 bg-rose-50 rounded-lg p-2", children: hata }), Object.keys(detay).length > 0 && (_jsxs("details", { className: "text-xs text-slate-600 bg-slate-50 rounded-lg p-3", children: [_jsx("summary", { className: "cursor-pointer font-medium text-slate-700", children: "Maliyet K\u0131r\u0131l\u0131m\u0131" }), _jsx("div", { className: "mt-2 grid grid-cols-2 gap-x-4 gap-y-1", children: Object.entries(detay).map(([k, v]) => (_jsxs("div", { className: "flex justify-between border-b border-slate-100 py-0.5", children: [_jsx("span", { children: DETAY_ETIKETI[k] ?? k }), _jsx("span", { className: "font-medium", children: formatDetay(k, v) })] }, k))) })] }))] }))] }) }));
}
