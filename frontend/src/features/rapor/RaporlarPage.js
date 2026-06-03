import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Raporlar — Teklif → Sipariş dönüşüm raporu.
 * - Filtre: tarih aralığı, sadece sipariş, sadece benim
 * - Tablo: oluşturma → teklif verme → sipariş tarihleri, dönüşüm günü
 * - Özet kartları: toplam teklif, dönüşen, dönüşüm %, ortalama gün
 * - CSV indir
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, TrendingUp, Clock, CheckCircle, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI } from "@/types";
import { formatDateTime, tl, tlShort } from "@/lib/format";
export default function RaporlarPage() {
    const kullanici = useAuth((s) => s.kullanici);
    const [baslangic, setBaslangic] = useState("");
    const [bitis, setBitis] = useState("");
    const [sadeceSiparis, setSadeceSiparis] = useState(false);
    const [benimMi, setBenimMi] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ["rapor-donusum", baslangic, bitis, sadeceSiparis, benimMi],
        queryFn: async () => {
            const params = {};
            if (baslangic)
                params.baslangic = baslangic;
            if (bitis)
                params.bitis = bitis;
            if (sadeceSiparis)
                params.sadece_siparis = true;
            if (benimMi)
                params.benim_mi = true;
            return (await api.get("/rapor/teklif-donusum", { params })).data;
        },
    });
    const csvIndir = () => {
        if (!data)
            return;
        const headers = [
            "Teklif No", "Müşteri", "Satış", "Şu Anki Durum", "Tutar (TL)",
            "Oluşturma", "Teklif Verme", "Kabul", "Sipariş",
            "Oluşum→Sipariş (gün)", "Teklif→Sipariş (gün)",
        ];
        const rows = data.satirlar.map((s) => [
            s.teklif_no,
            s.firma_adi,
            s.olusturan_ad,
            DURUM_ETIKET[s.su_anki_durum],
            s.tutar.toFixed(2),
            s.olusturma_ts ? new Date(s.olusturma_ts).toLocaleString("tr-TR") : "",
            s.teklif_verme_ts ? new Date(s.teklif_verme_ts).toLocaleString("tr-TR") : "",
            s.kabul_ts ? new Date(s.kabul_ts).toLocaleString("tr-TR") : "",
            s.siparis_ts ? new Date(s.siparis_ts).toLocaleString("tr-TR") : "",
            s.olusum_siparis_gun ?? "",
            s.teklif_siparis_gun ?? "",
        ]);
        const csv = [headers, ...rows]
            .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
            .join("\n");
        // UTF-8 BOM ekle (Excel'de Türkçe karakter için)
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `teklif-donusum-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Raporlar" }), _jsx("p", { className: "text-sm text-slate-500", children: "Teklif \u2192 Sipari\u015F D\u00F6n\u00FC\u015F\u00FCm" })] }), _jsxs("button", { onClick: csvIndir, disabled: !data || data.satirlar.length === 0, className: "btn-ghost border border-slate-300", children: [_jsx(Download, { size: 16, className: "mr-1" }), " Excel/CSV \u0130ndir"] })] }), _jsx("div", { className: "card mb-4", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Sipari\u015F Ba\u015Flang\u0131\u00E7" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" }), _jsx("input", { type: "date", className: "input pl-9", value: baslangic, onChange: (e) => setBaslangic(e.target.value) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Sipari\u015F Biti\u015F" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" }), _jsx("input", { type: "date", className: "input pl-9", value: bitis, onChange: (e) => setBitis(e.target.value) })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-700 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: sadeceSiparis, onChange: (e) => setSadeceSiparis(e.target.checked) }), "Sadece sipari\u015Fe d\u00F6nm\u00FC\u015F"] }) }), kullanici?.rol === "ADMIN" && (_jsx("div", { className: "flex items-end", children: _jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-700 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: benimMi, onChange: (e) => setBenimMi(e.target.checked) }), "Sadece benim"] }) }))] }) }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: [_jsx(KartBox, { icon: Activity, renk: "bg-blue-500", baslik: "Toplam Teklif", deger: String(data?.ozet.toplam_teklif ?? 0) }), _jsx(KartBox, { icon: CheckCircle, renk: "bg-emerald-500", baslik: "Sipari\u015F'e D\u00F6nen", deger: String(data?.ozet.siparise_donen ?? 0) }), _jsx(KartBox, { icon: TrendingUp, renk: "bg-amber-500", baslik: "D\u00F6n\u00FC\u015F\u00FCm Oran\u0131", deger: `%${data?.ozet.donusum_orani_yuzde ?? 0}` }), _jsx(KartBox, { icon: Clock, renk: "bg-violet-500", baslik: "Ort. D\u00F6n\u00FC\u015F\u00FCm S\u00FCresi", deger: data?.ozet.ortalama_donusum_gun !== null && data?.ozet.ortalama_donusum_gun !== undefined
                            ? `${data.ozet.ortalama_donusum_gun} gün`
                            : "—" })] }), _jsx("div", { className: "card mb-4", children: _jsxs("div", { className: "text-sm text-slate-600", children: ["Toplam sipari\u015Fe d\u00F6nen tutar:", _jsx("span", { className: "ml-2 font-semibold text-emerald-700", children: tl.format(data?.ozet.toplam_siparis_tutari ?? 0) })] }) }), _jsx("div", { className: "card p-0 overflow-hidden", children: isLoading ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "Y\u00FCkleniyor..." })) : !data || data.satirlar.length === 0 ? (_jsx("div", { className: "p-10 text-center text-slate-400", children: "Filtreye uyan teklif yok." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-3 py-3", children: "Teklif No" }), _jsx("th", { className: "text-left px-3 py-3", children: "M\u00FC\u015Fteri" }), _jsx("th", { className: "text-left px-3 py-3", children: "Sat\u0131\u015F" }), _jsx("th", { className: "text-left px-3 py-3", children: "Durum" }), _jsx("th", { className: "text-right px-3 py-3", children: "Tutar" }), _jsx("th", { className: "text-left px-3 py-3", children: "Olu\u015Fturma" }), _jsx("th", { className: "text-left px-3 py-3", children: "Teklif Verme" }), _jsx("th", { className: "text-left px-3 py-3", children: "Sipari\u015F" }), _jsx("th", { className: "text-right px-3 py-3", title: "Teklif verme \u2192 Sipari\u015F aras\u0131 g\u00FCn say\u0131s\u0131", children: "S\u00FCre (g\u00FCn)" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: data.satirlar.map((s) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-3 py-2", children: _jsx(Link, { to: `/teklifler/${s.teklif_id}`, className: "font-mono text-xs text-brand-700 hover:underline", children: s.teklif_no }) }), _jsx("td", { className: "px-3 py-2 font-medium", children: s.firma_adi }), _jsx("td", { className: "px-3 py-2 text-slate-600", children: s.olusturan_ad }), _jsx("td", { className: "px-3 py-2", children: _jsx(Badge, { className: DURUM_RENGI[s.su_anki_durum], children: DURUM_ETIKET[s.su_anki_durum] }) }), _jsx("td", { className: "px-3 py-2 text-right font-medium", children: tlShort.format(s.tutar) }), _jsx("td", { className: "px-3 py-2 text-xs text-slate-600 whitespace-nowrap", children: formatDateTime(s.olusturma_ts) }), _jsx("td", { className: "px-3 py-2 text-xs text-slate-600 whitespace-nowrap", children: s.teklif_verme_ts ? formatDateTime(s.teklif_verme_ts) : _jsx("span", { className: "text-slate-300", children: "\u2014" }) }), _jsx("td", { className: "px-3 py-2 text-xs whitespace-nowrap", children: s.siparis_ts
                                                ? _jsx("span", { className: "text-emerald-700 font-medium", children: formatDateTime(s.siparis_ts) })
                                                : _jsx("span", { className: "text-slate-300", children: "\u2014" }) }), _jsx("td", { className: "px-3 py-2 text-right font-medium", children: s.teklif_siparis_gun !== null
                                                ? _jsx("span", { className: "text-violet-700", children: s.teklif_siparis_gun })
                                                : _jsx("span", { className: "text-slate-300", children: "\u2014" }) })] }, s.teklif_id))) })] }) })) })] }));
}
function KartBox({ icon: Icon, renk, baslik, deger }) {
    return (_jsxs("div", { className: "card flex items-center gap-3 p-4", children: [_jsx("div", { className: `${renk} text-white rounded-lg p-2.5 shrink-0`, children: _jsx(Icon, { size: 18 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs text-slate-500", children: baslik }), _jsx("div", { className: "text-xl font-semibold mt-0.5", children: deger })] })] }));
}
