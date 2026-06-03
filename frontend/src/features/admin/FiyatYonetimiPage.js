import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Birim Fiyat Yönetimi — Excel'deki "HESAPLAMA VERİ DOSYASI" karşılığı.
 * 3 bölüm: Genel fiyatlar, OFSET baskı (gramaja göre), Geçiş çarpanı (renge göre).
 *
 * Buradaki değerler değişince yeni teklifler bu fiyatlarla hesaplar.
 * Eski teklifler kendi snapshot'ında kalır.
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Info } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";
const GENEL_ETIKET = {
    lak_tl_m2: { ad: "Lak", aciklama: "TL / m² — ofset kutu üzerine sürülen lak" },
    sivama_tl_m2: { ad: "Sıvama", aciklama: "TL / m² — kuşe kağıt yapıştırma" },
    kesim_tl: { ad: "Kesim", aciklama: "Tabaka başı kesim ücreti (TL)" },
    yapistirma_tl_ad: { ad: "Yapıştırma (Ofset)", aciklama: "TL / adet — ofset kutu yapıştırma" },
    flekso_baski_kesim_tl: { ad: "Flekso Baskı+Kesim", aciklama: "TL — flekso birim baskı + kesim paketi" },
    flekso_kesim_tl: { ad: "Flekso Kesim", aciklama: "TL — flekso ayrı kesim" },
    flekso_yapistirma_tl_ad: { ad: "Flekso Yapıştırma", aciklama: "TL / adet — flekso kutu yapıştırma" },
    koli_dikis_birim_tl: { ad: "Koli Dikiş", aciklama: "TL / dikiş — oluklu koli için (her dikiş başına)" },
};
export default function FiyatYonetimiPage() {
    const toast = useToast((s) => s.push);
    const qc = useQueryClient();
    // ─── GENEL ──────────────────────────────────────────────────────
    const { data: genel } = useQuery({
        queryKey: ["fiyat-genel"],
        queryFn: async () => (await api.get("/fiyat/genel")).data,
    });
    const [genelDraft, setGenelDraft] = useState({});
    useEffect(() => { if (genel)
        setGenelDraft(genel); }, [genel]);
    const genelKaydet = useMutation({
        mutationFn: async (data) => (await api.patch("/fiyat/genel", data)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["fiyat-genel"] });
            qc.invalidateQueries({ queryKey: ["master-all"] });
            toast("ok", "Genel fiyatlar güncellendi");
        },
        onError: (e) => toast("err", e?.response?.data?.detail ?? "Hata"),
    });
    // ─── OFSET BASKI (gramaj → TL) ──────────────────────────────────
    const { data: ofset = [] } = useQuery({
        queryKey: ["fiyat-ofset"],
        queryFn: async () => (await api.get("/fiyat/ofset")).data,
    });
    const [yeniGramaj, setYeniGramaj] = useState("");
    const [yeniGramajTL, setYeniGramajTL] = useState("");
    const [silOnayOfset, setSilOnayOfset] = useState(null);
    const ofsetKaydet = useMutation({
        mutationFn: async ({ gramaj, baski_tl }) => (await api.put(`/fiyat/ofset/${gramaj}`, null, { params: { baski_tl } })).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["fiyat-ofset"] });
            toast("ok", "Kaydedildi");
        },
        onError: (e) => toast("err", e?.response?.data?.detail ?? "Hata"),
    });
    const ofsetSil = useMutation({
        mutationFn: async (gramaj) => (await api.delete(`/fiyat/ofset/${gramaj}`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["fiyat-ofset"] });
            toast("ok", "Silindi");
        },
    });
    // ─── ÇARPAN (renk → çarpan) ─────────────────────────────────────
    const { data: carpan = [] } = useQuery({
        queryKey: ["fiyat-carpan"],
        queryFn: async () => (await api.get("/fiyat/carpan")).data,
    });
    const carpanKaydet = useMutation({
        mutationFn: async ({ renk_sayisi, carpan: c }) => (await api.put(`/fiyat/carpan/${renk_sayisi}`, null, { params: { carpan: c } })).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["fiyat-carpan"] });
            toast("ok", "Kaydedildi");
        },
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Birim Fiyat Y\u00F6netimi" }), _jsx("p", { className: "text-sm text-slate-500", children: "Excel'deki \"HESAPLAMA VER\u0130 DOSYASI\" kar\u015F\u0131l\u0131\u011F\u0131. Buradaki de\u011Fi\u015Fiklikler **yeni teklifler**'i etkiler; eski teklifler kendi hesap snapshot'\u0131nda kal\u0131r." })] }), _jsx("div", { className: "card border-l-4 border-blue-400", children: _jsxs("div", { className: "flex gap-2 items-start text-sm text-slate-700", children: [_jsx(Info, { size: 16, className: "mt-0.5 text-blue-500" }), _jsx("div", { children: "Ka\u011F\u0131t zamm\u0131 / i\u015F\u00E7ilik de\u011Fi\u015Fimi geldi\u011Finde **bu sayfadan** fiyatlar\u0131 g\u00FCncelleyin. Sistem otomatik t\u00FCm yeni hesaplamalarda yeni de\u011Ferleri kullanacakt\u0131r." })] }) }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Genel Birim Fiyatlar" }), !genel ? (_jsx("div", { className: "text-slate-400", children: "Y\u00FCkleniyor..." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: Object.keys(GENEL_ETIKET).map((k) => (_jsxs("div", { children: [_jsx("label", { className: "label", children: GENEL_ETIKET[k].ad }), _jsx("input", { className: "input", type: "number", step: "0.001", value: genelDraft[k] ?? "", onChange: (e) => setGenelDraft((p) => ({ ...p, [k]: Number(e.target.value) })) }), _jsx("div", { className: "text-xs text-slate-400 mt-1", children: GENEL_ETIKET[k].aciklama })] }, k))) }), _jsx("div", { className: "flex justify-end mt-4", children: _jsxs("button", { className: "btn-primary", onClick: () => genelKaydet.mutate(genelDraft), disabled: genelKaydet.isPending, children: [_jsx(Save, { size: 16, className: "mr-1" }), genelKaydet.isPending ? "Kaydediliyor..." : "Kaydet"] }) })] }))] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Ofset Bask\u0131 TL \u2014 Gramaj Baz\u0131nda" }), _jsx("p", { className: "text-sm text-slate-500 mb-4", children: "Her gramaj i\u00E7in bask\u0131 kal\u0131p + sabit maliyet. (Excel: HESAPLAMA VER\u0130 DOSYASI B s\u00FCtunu)" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-3 py-2", children: "Gramaj (g/m\u00B2)" }), _jsx("th", { className: "text-left px-3 py-2", children: "Bask\u0131 TL" }), _jsx("th", { className: "w-32" })] }) }), _jsxs("tbody", { className: "divide-y divide-slate-100", children: [ofset.map((r) => (_jsx(OfsetRow, { baslangic: r, kaydet: (tl) => ofsetKaydet.mutate({ gramaj: r.gramaj, baski_tl: tl }), sil: () => setSilOnayOfset(r.gramaj) }, r.gramaj))), _jsxs("tr", { className: "bg-slate-50", children: [_jsx("td", { className: "px-3 py-2", children: _jsx("input", { className: "input", type: "number", placeholder: "\u00F6rn: 500", value: yeniGramaj, onChange: (e) => setYeniGramaj(e.target.value) }) }), _jsx("td", { className: "px-3 py-2", children: _jsx("input", { className: "input", type: "number", step: "any", placeholder: "\u00F6rn: 2750", value: yeniGramajTL, onChange: (e) => setYeniGramajTL(e.target.value) }) }), _jsx("td", { className: "px-3 py-2", children: _jsxs("button", { className: "btn-primary w-full", disabled: !yeniGramaj || !yeniGramajTL, onClick: () => {
                                                            ofsetKaydet.mutate({
                                                                gramaj: Number(yeniGramaj),
                                                                baski_tl: Number(yeniGramajTL),
                                                            });
                                                            setYeniGramaj("");
                                                            setYeniGramajTL("");
                                                        }, children: [_jsx(Plus, { size: 14, className: "mr-1" }), " Ekle"] }) })] })] })] }) })] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Ge\u00E7i\u015F \u00C7arpan\u0131 \u2014 Renk Say\u0131s\u0131 Baz\u0131nda" }), _jsx("p", { className: "text-sm text-slate-500 mb-4", children: "3000 bask\u0131 adedinin \u00FCst\u00FCnde her ek ge\u00E7i\u015F i\u00E7in kullan\u0131l\u0131r." }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-3 py-2", children: "Renk Say\u0131s\u0131" }), _jsx("th", { className: "text-left px-3 py-2", children: "\u00C7arpan" }), _jsx("th", { className: "w-32" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: carpan.map((r) => (_jsx(CarpanRow, { baslangic: r, kaydet: (c) => carpanKaydet.mutate({ renk_sayisi: r.renk_sayisi, carpan: c }) }, r.renk_sayisi))) })] }) })] }), _jsx(Confirm, { open: silOnayOfset !== null, onClose: () => setSilOnayOfset(null), onConfirm: () => silOnayOfset !== null && ofsetSil.mutate(silOnayOfset), message: `${silOnayOfset} g/m² satırını silmek istediğinize emin misiniz?`, confirmText: "Sil", danger: true })] }));
}
function OfsetRow({ baslangic, kaydet, sil, }) {
    const [val, setVal] = useState(String(baslangic.baski_tl));
    useEffect(() => setVal(String(baslangic.baski_tl)), [baslangic.baski_tl]);
    const degisti = Number(val) !== Number(baslangic.baski_tl);
    return (_jsxs("tr", { children: [_jsx("td", { className: "px-3 py-2 font-medium", children: baslangic.gramaj }), _jsx("td", { className: "px-3 py-2", children: _jsx("input", { className: "input", type: "number", step: "any", value: val, onChange: (e) => setVal(e.target.value) }) }), _jsxs("td", { className: "px-3 py-2 flex gap-2", children: [_jsxs("button", { className: `btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} flex-1`, disabled: !degisti, onClick: () => kaydet(Number(val)), children: [_jsx(Save, { size: 14, className: "mr-1" }), " Kaydet"] }), _jsx("button", { onClick: sil, className: "text-slate-400 hover:text-rose-600 px-2", children: _jsx(Trash2, { size: 16 }) })] })] }));
}
function CarpanRow({ baslangic, kaydet, }) {
    const [val, setVal] = useState(String(baslangic.carpan));
    useEffect(() => setVal(String(baslangic.carpan)), [baslangic.carpan]);
    const degisti = Number(val) !== Number(baslangic.carpan);
    return (_jsxs("tr", { children: [_jsxs("td", { className: "px-3 py-2 font-medium", children: [baslangic.renk_sayisi, " renk"] }), _jsx("td", { className: "px-3 py-2", children: _jsx("input", { className: "input", type: "number", step: "0.001", value: val, onChange: (e) => setVal(e.target.value) }) }), _jsx("td", { className: "px-3 py-2", children: _jsxs("button", { className: `btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} w-full`, disabled: !degisti, onClick: () => kaydet(Number(val)), children: [_jsx(Save, { size: 14, className: "mr-1" }), " Kaydet"] }) })] }));
}
