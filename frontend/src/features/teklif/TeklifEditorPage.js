import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, FileDown, Send, Save, ArrowLeft, Building2, } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI } from "@/types";
import { tl, formatDate } from "@/lib/format";
import KalemDrawer from "./KalemDrawer";
import DurumGecmisi from "./DurumGecmisi";
export default function TeklifEditorPage() {
    const { id } = useParams();
    const isNew = !id;
    const navigate = useNavigate();
    const qc = useQueryClient();
    const kullanici = useAuth((s) => s.kullanici);
    const toast = useToast((s) => s.push);
    // Form state
    const [firmaId, setFirmaId] = useState("");
    const [yetkili, setYetkili] = useState("");
    const [tarih, setTarih] = useState(new Date().toISOString().slice(0, 10));
    const [gecerlilik, setGecerlilik] = useState("");
    const [vadeMetni, setVadeMetni] = useState("30 gün");
    const [sevkYeri, setSevkYeri] = useState("");
    const [notlar, setNotlar] = useState("İstanbul Avrupa Yakası nakliye firmamıza aittir. Sipariş ±%10 sapma ile imal edilebilir.");
    const [kdvOrani, setKdvOrani] = useState(0.2);
    const [durum, setDurum] = useState("TASLAK");
    const [kalemler, setKalemler] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingKalem, setEditingKalem] = useState();
    const [silOnay, setSilOnay] = useState(null);
    // Veri yükleme
    const { data: teklif } = useQuery({
        queryKey: ["teklif", id],
        queryFn: async () => (await api.get(`/teklif/${id}`)).data,
        enabled: !isNew,
    });
    useEffect(() => {
        if (teklif) {
            setFirmaId(teklif.firma_id);
            setYetkili(teklif.yetkili ?? "");
            setTarih(teklif.tarih);
            setGecerlilik(teklif.gecerlilik ?? "");
            setVadeMetni(teklif.vade_metni ?? "");
            setSevkYeri(teklif.sevk_yeri ?? "");
            setNotlar(teklif.notlar ?? "");
            setKdvOrani(Number(teklif.kdv_orani));
            setDurum(teklif.durum);
            // Decimal alanları API'den string gelir → sayıya çevir
            setKalemler(teklif.kalemler.map((k) => ({
                ...k,
                adet: Number(k.adet),
                birim_fiyat: Number(k.birim_fiyat),
                toplam: k.toplam !== null && k.toplam !== undefined ? Number(k.toplam) : undefined,
            })));
        }
    }, [teklif]);
    // Firma seçici
    const { data: firmalar = [] } = useQuery({
        queryKey: ["firma-tum"],
        queryFn: async () => (await api.get("/firma")).data,
    });
    const araToplam = useMemo(() => kalemler.reduce((s, k) => s + (k.toplam ?? k.adet * k.birim_fiyat), 0), [kalemler]);
    const kdvTutari = useMemo(() => Number((araToplam * kdvOrani).toFixed(2)), [araToplam, kdvOrani]);
    const genelToplam = useMemo(() => Number((araToplam + kdvTutari).toFixed(2)), [araToplam, kdvTutari]);
    const kaydet = useMutation({
        mutationFn: async (yeniDurum) => {
            const payload = {
                firma_id: firmaId,
                yetkili,
                tarih,
                gecerlilik: gecerlilik || null,
                vade_metni: vadeMetni,
                sevk_yeri: sevkYeri,
                notlar,
                kdv_orani: kdvOrani,
                durum: yeniDurum ?? durum,
                kalemler: kalemler.map((k) => ({
                    sira_no: k.sira_no,
                    kalem_tipi: k.kalem_tipi,
                    urun_ismi: k.urun_ismi,
                    adet: k.adet,
                    birim_fiyat: k.birim_fiyat,
                    toplam: k.toplam,
                    termin: k.termin,
                    spesifikasyon: k.spesifikasyon,
                    hesap_detayi: k.hesap_detayi,
                    notlar: k.notlar,
                })),
            };
            if (isNew) {
                return (await api.post("/teklif", payload)).data;
            }
            return (await api.patch(`/teklif/${id}`, payload)).data;
        },
        onSuccess: (data) => {
            toast("ok", isNew ? "Teklif oluşturuldu" : "Teklif kaydedildi");
            qc.invalidateQueries({ queryKey: ["teklif-liste"] });
            qc.invalidateQueries({ queryKey: ["teklif-durum-log"] });
            if (isNew)
                navigate(`/teklifler/${data.id}`, { replace: true });
        },
        onError: (e) => toast("err", e?.response?.data?.detail ?? "Kayıt hatası"),
    });
    const sil = useMutation({
        mutationFn: async () => (await api.delete(`/teklif/${id}`)).data,
        onSuccess: () => {
            toast("ok", "Teklif silindi");
            qc.invalidateQueries({ queryKey: ["teklif-liste"] });
            navigate("/teklifler");
        },
    });
    const pdfIndir = async () => {
        try {
            const res = await api.get(`/teklif/${id}/pdf`, { responseType: "blob" });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${teklif?.teklif_no}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch {
            toast("err", "PDF üretilemedi");
        }
    };
    const ekleKalem = (k) => {
        setKalemler((p) => {
            if (editingKalem) {
                return p.map((x) => (x.sira_no === editingKalem.sira_no ? k : x));
            }
            return [...p, k];
        });
        setDrawerOpen(false);
        setEditingKalem(undefined);
    };
    const silKalem = (sira) => {
        setKalemler((p) => p.filter((k) => k.sira_no !== sira).map((k, i) => ({ ...k, sira_no: i + 1 })));
        setSilOnay(null);
    };
    const yeniSiraNo = (kalemler.at(-1)?.sira_no ?? 0) + 1;
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => navigate("/teklifler"), className: "btn-ghost p-2", children: _jsx(ArrowLeft, { size: 18 }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl sm:text-2xl font-bold font-display text-slate-900", children: isNew ? "Yeni Teklif" : teklif?.teklif_no }), !isNew && (_jsx(Badge, { className: DURUM_RENGI[durum], children: DURUM_ETIKET[durum] }))] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [!isNew && (_jsxs("button", { onClick: pdfIndir, className: "btn-secondary", children: [_jsx(FileDown, { size: 16 }), " PDF"] })), _jsxs("button", { onClick: () => kaydet.mutate(undefined), disabled: kaydet.isPending || !firmaId || kalemler.length === 0, className: "btn-primary", children: [_jsx(Save, { size: 16, className: "mr-1" }), " ", isNew ? "Kaydet" : "Güncelle"] }), !isNew && durum === "TASLAK" && (_jsxs("button", { onClick: () => kaydet.mutate("TEKLIF_VERILDI"), className: "btn text-white bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)]", disabled: kaydet.isPending, children: [_jsx(Send, { size: 16 }), " Teklif Ver"] })), !isNew && durum === "KABUL" && (_jsx("button", { onClick: () => kaydet.mutate("SIPARIS"), className: "btn text-white bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-[0_8px_20px_-8px_rgba(139,92,246,0.5)]", disabled: kaydet.isPending, children: "Sipari\u015Fe D\u00F6n\u00FC\u015Ft\u00FCr \u2192" })), !isNew && (_jsxs("select", { className: "input w-auto", value: durum, onChange: (e) => {
                                    const nd = e.target.value;
                                    setDurum(nd);
                                    kaydet.mutate(nd);
                                }, children: [_jsx("option", { value: "TASLAK", children: "Taslak" }), _jsx("option", { value: "TEKLIF_VERILDI", children: "Teklif Verildi" }), _jsx("option", { value: "BEKLEMEDE", children: "Beklemede" }), _jsx("option", { value: "KABUL", children: "Kabul" }), _jsx("option", { value: "SIPARIS", children: "Sipari\u015F" }), _jsx("option", { value: "RED", children: "Red" }), _jsx("option", { value: "IPTAL", children: "\u0130ptal" })] }))] })] }), _jsx("div", { className: "card mb-4", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "M\u00FC\u015Fteri *" }), _jsxs("select", { className: "input", value: firmaId, onChange: (e) => setFirmaId(e.target.value), children: [_jsx("option", { value: "", children: "\u2014 Se\u00E7in \u2014" }), firmalar.map((f) => (_jsx("option", { value: f.id, children: f.ad }, f.id)))] }), firmalar.length === 0 && (_jsxs("div", { className: "text-xs text-slate-400 mt-1 flex items-center gap-1", children: [_jsx(Building2, { size: 12 }), " \u00D6nce m\u00FC\u015Fteri eklemelisiniz"] }))] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Yetkili" }), _jsx("input", { className: "input", value: yetkili, onChange: (e) => setYetkili(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Sat\u0131\u015F Temsilcisi" }), _jsx("div", { className: "input bg-slate-50 text-slate-600", children: teklif?.olusturan.ad_soyad ?? kullanici?.ad_soyad ?? "—" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Tarih" }), _jsx("input", { className: "input", type: "date", value: tarih, onChange: (e) => setTarih(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Ge\u00E7erlilik" }), _jsx("input", { className: "input", type: "date", value: gecerlilik, onChange: (e) => setGecerlilik(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Vade" }), _jsx("input", { className: "input", value: vadeMetni, onChange: (e) => setVadeMetni(e.target.value), placeholder: "\u00F6rn: 30 g\u00FCn" })] }), _jsxs("div", { className: "sm:col-span-2 lg:col-span-3", children: [_jsx("label", { className: "label", children: "Sevk Yeri" }), _jsx("input", { className: "input", value: sevkYeri, onChange: (e) => setSevkYeri(e.target.value) })] })] }) }), _jsxs("div", { className: "card p-0 overflow-hidden mb-4", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-slate-100", children: [_jsxs("h2", { className: "font-semibold text-slate-900", children: ["Sat\u0131rlar (", kalemler.length, ")"] }), _jsxs("button", { onClick: () => { setEditingKalem(undefined); setDrawerOpen(true); }, className: "btn-primary", children: [_jsx(Plus, { size: 16, className: "mr-1" }), " Sat\u0131r Ekle"] })] }), kalemler.length === 0 ? (_jsx("div", { className: "p-10 text-center text-slate-400 text-sm", children: "Hen\u00FCz sat\u0131r yok. \"Sat\u0131r Ekle\" ile ba\u015Flay\u0131n." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-4 py-3 w-10", children: "#" }), _jsx("th", { className: "text-left px-4 py-3", children: "Tip" }), _jsx("th", { className: "text-left px-4 py-3", children: "\u00DCr\u00FCn" }), _jsx("th", { className: "text-right px-4 py-3", children: "Adet" }), _jsx("th", { className: "text-right px-4 py-3", children: "Birim Fiyat" }), _jsx("th", { className: "text-right px-4 py-3", children: "Toplam" }), _jsx("th", { className: "w-20" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: kalemler.map((k) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-4 py-3 text-slate-400", children: k.sira_no }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { className: "bg-slate-100 text-slate-700", children: k.kalem_tipi }) }), _jsx("td", { className: "px-4 py-3 font-medium", children: k.urun_ismi }), _jsx("td", { className: "px-4 py-3 text-right", children: k.adet.toLocaleString("tr-TR") }), _jsx("td", { className: "px-4 py-3 text-right", children: tl.format(k.birim_fiyat) }), _jsx("td", { className: "px-4 py-3 text-right font-medium", children: tl.format(k.toplam ?? k.adet * k.birim_fiyat) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { onClick: () => { setEditingKalem(k); setDrawerOpen(true); }, className: "text-slate-400 hover:text-brand-700", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { onClick: () => setSilOnay(k.sira_no), className: "text-slate-400 hover:text-rose-600", children: _jsx(Trash2, { size: 16 }) })] }) })] }, k.sira_no))) })] }) }), _jsx("div", { className: "md:hidden divide-y divide-slate-100", children: kalemler.map((k) => (_jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-slate-400 text-xs", children: ["#", k.sira_no] }), _jsx(Badge, { className: "bg-slate-100 text-slate-700", children: k.kalem_tipi })] }), _jsx("div", { className: "font-medium mt-1", children: k.urun_ismi }), _jsxs("div", { className: "text-xs text-slate-500 mt-1", children: [k.adet.toLocaleString("tr-TR"), " \u00D7 ", tl.format(k.birim_fiyat)] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: tl.format(k.toplam ?? k.adet * k.birim_fiyat) }), _jsxs("div", { className: "flex gap-2 justify-end mt-2", children: [_jsx("button", { onClick: () => { setEditingKalem(k); setDrawerOpen(true); }, children: _jsx(Edit, { size: 16, className: "text-slate-400" }) }), _jsx("button", { onClick: () => setSilOnay(k.sira_no), children: _jsx(Trash2, { size: 16, className: "text-rose-400" }) })] })] })] }) }, k.sira_no))) })] }))] }), _jsxs("div", { className: "max-w-md ml-auto mb-4 rounded-2xl overflow-hidden shadow-card ring-1 ring-slate-200/70", children: [_jsxs("div", { className: "bg-white p-5 space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Ara Toplam" }), _jsx("span", { className: "font-semibold text-slate-800", children: tl.format(araToplam) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-slate-500", children: ["KDV (%", Math.round(kdvOrani * 100), ")"] }), _jsx("span", { className: "font-semibold text-slate-800", children: tl.format(kdvTutari) })] })] }), _jsxs("div", { className: "bg-brand-grad text-white px-5 py-4 flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-semibold text-brand-100/80", children: "Genel Toplam" }), _jsx("span", { className: "text-xl font-bold font-display", children: tl.format(genelToplam) })] })] }), _jsxs("div", { className: "card", children: [_jsx("label", { className: "label", children: "Notlar" }), _jsx("textarea", { className: "input min-h-[80px]", value: notlar, onChange: (e) => setNotlar(e.target.value) })] }), !isNew && id && (_jsx("div", { className: "mt-4", children: _jsx(DurumGecmisi, { teklifId: id }) })), !isNew && teklif && (_jsxs("div", { className: "text-xs text-slate-400 mt-4 flex flex-wrap gap-x-4 gap-y-1", children: [_jsxs("span", { children: ["Olu\u015Fturma: ", formatDate(teklif.olusturma_ts)] }), _jsxs("span", { children: ["Son g\u00FCncelleme: ", formatDate(teklif.guncelleme_ts)] }), _jsxs("span", { children: ["Olu\u015Fturan: ", teklif.olusturan.ad_soyad] })] })), _jsx(KalemDrawer, { open: drawerOpen, onClose: () => { setDrawerOpen(false); setEditingKalem(undefined); }, onSave: ekleKalem, initial: editingKalem, siraNo: yeniSiraNo }), _jsx(Confirm, { open: silOnay !== null, onClose: () => setSilOnay(null), onConfirm: () => silOnay !== null && silKalem(silOnay), message: "Bu sat\u0131r\u0131 silmek istedi\u011Finize emin misiniz?", confirmText: "Sil", danger: true })] }));
}
