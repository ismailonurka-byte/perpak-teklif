import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { ACIK_DURUMLAR, DURUM_ETIKET, DURUM_RENGI } from "@/types";
import { formatDate, gunFarki, tl } from "@/lib/format";
const DURUMLAR = [
    { kod: "TUMU", ad: "Tümü" },
    { kod: "TASLAK", ad: "Taslak" },
    { kod: "TEKLIF_VERILDI", ad: "Teklif Verildi" },
    { kod: "BEKLEMEDE", ad: "Beklemede" },
    { kod: "KABUL", ad: "Kabul" },
    { kod: "SIPARIS", ad: "Sipariş" },
    { kod: "RED", ad: "Red" },
    { kod: "IPTAL", ad: "İptal" },
];
export default function TeklifListPage() {
    const kullanici = useAuth((s) => s.kullanici);
    const navigate = useNavigate();
    const [durum, setDurum] = useState("TUMU");
    const [arama, setArama] = useState("");
    const [benimMi, setBenimMi] = useState(false);
    const { data = [], isLoading } = useQuery({
        queryKey: ["teklif-liste", durum, arama, benimMi],
        queryFn: async () => {
            const params = { limit: 100 };
            if (durum !== "TUMU")
                params.durum = durum;
            if (arama)
                params.arama = arama;
            if (benimMi)
                params.benim_mi = true;
            return (await api.get("/teklif", { params })).data;
        },
    });
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Teklifler" }), _jsxs("p", { className: "text-sm text-slate-500", children: [data.length, " kay\u0131t"] })] }), _jsxs("button", { className: "btn-primary", onClick: () => navigate("/teklifler/yeni"), children: [_jsx(Plus, { size: 16, className: "mr-1" }), " Yeni Teklif"] })] }), _jsxs("div", { className: "card mb-4 flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "input pl-9", placeholder: "Teklif no veya m\u00FC\u015Fteri ara...", value: arama, onChange: (e) => setArama(e.target.value) })] }), _jsx("select", { className: "input sm:w-44", value: durum, onChange: (e) => setDurum(e.target.value), children: DURUMLAR.map((d) => _jsx("option", { value: d.kod, children: d.ad }, d.kod)) }), kullanici?.rol === "ADMIN" && (_jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-slate-600 px-2", children: [_jsx("input", { type: "checkbox", checked: benimMi, onChange: (e) => setBenimMi(e.target.checked) }), "Sadece benim"] }))] }), _jsx("div", { className: "card p-0 overflow-hidden", children: isLoading ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "Y\u00FCkleniyor..." })) : data.length === 0 ? (_jsx("div", { className: "p-10 text-center text-slate-400", children: "Filtreye uyan teklif yok." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-4 py-3", children: "Teklif No" }), _jsx("th", { className: "text-left px-4 py-3", children: "M\u00FC\u015Fteri" }), _jsx("th", { className: "text-left px-4 py-3", children: "Sat\u0131\u015F" }), _jsx("th", { className: "text-left px-4 py-3", children: "Tarih" }), _jsx("th", { className: "text-right px-4 py-3", children: "Tutar" }), _jsx("th", { className: "text-left px-4 py-3", children: "Durum" }), _jsx("th", { className: "text-left px-4 py-3", children: "Hareket" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: data.map((t) => {
                                            const gun = gunFarki(t.son_aktivite_ts);
                                            const eskimis = gun > 7 && ACIK_DURUMLAR.includes(t.durum) && t.durum !== "TASLAK";
                                            return (_jsxs("tr", { className: "hover:bg-slate-50 cursor-pointer", onClick: () => navigate(`/teklifler/${t.id}`), children: [_jsx("td", { className: "px-4 py-3 font-mono text-xs font-medium text-brand-700", children: t.teklif_no }), _jsx("td", { className: "px-4 py-3 font-medium", children: t.firma_adi }), _jsx("td", { className: "px-4 py-3 text-slate-600", children: t.olusturan_ad }), _jsx("td", { className: "px-4 py-3 text-slate-600", children: formatDate(t.tarih) }), _jsx("td", { className: "px-4 py-3 text-right font-medium", children: tl.format(t.genel_toplam) }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { className: DURUM_RENGI[t.durum], children: DURUM_ETIKET[t.durum] }) }), _jsxs("td", { className: "px-4 py-3 text-xs", children: [eskimis && _jsx(AlertTriangle, { size: 14, className: "inline mr-1 text-amber-500" }), _jsx("span", { className: eskimis ? "text-amber-700 font-medium" : "text-slate-500", children: gun === 0 ? "Bugün" : `${gun} gün önce` })] })] }, t.id));
                                        }) })] }) }), _jsx("div", { className: "md:hidden divide-y divide-slate-100", children: data.map((t) => {
                                const gun = gunFarki(t.son_aktivite_ts);
                                const eskimis = gun > 7 && ACIK_DURUMLAR.includes(t.durum) && t.durum !== "TASLAK";
                                return (_jsxs(Link, { to: `/teklifler/${t.id}`, className: "block p-4 active:bg-slate-50", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: t.firma_adi }), _jsx("div", { className: "font-mono text-xs text-brand-700 mt-0.5", children: t.teklif_no })] }), _jsx(Badge, { className: DURUM_RENGI[t.durum], children: DURUM_ETIKET[t.durum] })] }), _jsxs("div", { className: "flex justify-between items-center mt-2 text-xs text-slate-500", children: [_jsx("span", { children: t.olusturan_ad }), _jsx("span", { className: "font-medium text-slate-700", children: tl.format(t.genel_toplam) })] }), _jsxs("div", { className: "text-xs mt-1 flex items-center gap-1", children: [eskimis && _jsx(AlertTriangle, { size: 12, className: "text-amber-500" }), _jsx("span", { className: eskimis ? "text-amber-700" : "text-slate-400", children: gun === 0 ? "Bugün" : `${gun} gün önce` })] })] }, t.id));
                            }) })] })) })] }));
}
