import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI, ACIK_DURUMLAR } from "@/types";
import { formatDate, gunFarki, tlShort, tl } from "@/lib/format";
export default function DashboardPage() {
    const kullanici = useAuth((s) => s.kullanici);
    const navigate = useNavigate();
    const { data: ozet } = useQuery({
        queryKey: ["teklif-ozet"],
        queryFn: async () => (await api.get("/teklif/_/ozet")).data,
    });
    const { data: sonlar = [] } = useQuery({
        queryKey: ["teklif-son", "dashboard"],
        queryFn: async () => (await api.get("/teklif", { params: { limit: 8 } })).data,
    });
    const eskiyenler = sonlar.filter((t) => gunFarki(t.son_aktivite_ts) > 7 &&
        ACIK_DURUMLAR.includes(t.durum) &&
        t.durum !== "TASLAK");
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold", children: ["Ho\u015F geldin, ", kullanici?.ad_soyad.split(" ")[0]] }), _jsx("p", { className: "text-sm text-slate-500", children: new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) })] }), _jsxs("button", { className: "btn-primary", onClick: () => navigate("/teklifler/yeni"), children: [_jsx(Plus, { size: 16, className: "mr-1" }), " Yeni Teklif"] })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(KartBox, { icon: Activity, baslik: "A\u00E7\u0131k Teklifler", deger: String(ozet?.acik_teklif_sayisi ?? 0), renk: "bg-blue-500" }), _jsx(KartBox, { icon: TrendingUp, baslik: "Bu Ay Kazan\u00E7", deger: tlShort.format(ozet?.bu_ay_kazanc ?? 0), renk: "bg-emerald-500" }), _jsx(KartBox, { icon: CheckCircle, baslik: "Kazanma Oran\u0131", deger: ozet?.kazanma_orani_yuzde !== null && ozet?.kazanma_orani_yuzde !== undefined ? `%${ozet.kazanma_orani_yuzde}` : "—", renk: "bg-amber-500" }), _jsx(KartBox, { icon: Clock, baslik: "Eskiyen >7 G\u00FCn", deger: String(eskiyenler.length), renk: "bg-rose-500" })] }), eskiyenler.length > 0 && (_jsxs("div", { className: "card mb-6 border-l-4 border-amber-500", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(AlertTriangle, { size: 18, className: "text-amber-500" }), _jsxs("h2", { className: "font-semibold", children: ["Dikkat \u2014 ", eskiyenler.length, " teklif 7+ g\u00FCnd\u00FCr harekete kapal\u0131"] })] }), _jsx("div", { className: "space-y-1", children: eskiyenler.slice(0, 5).map((t) => (_jsxs(Link, { to: `/teklifler/${t.id}`, className: "flex justify-between items-center py-2 px-3 hover:bg-slate-50 rounded text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-mono text-xs text-brand-700", children: t.teklif_no }), _jsx("span", { className: "ml-2 font-medium", children: t.firma_adi })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-amber-700 text-xs", children: [gunFarki(t.son_aktivite_ts), " g\u00FCn"] }), _jsx(Badge, { className: DURUM_RENGI[t.durum], children: DURUM_ETIKET[t.durum] })] })] }, t.id))) })] })), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Son Teklifler" }), _jsx(Link, { to: "/teklifler", className: "text-sm text-brand-600 hover:underline", children: "Hepsini g\u00F6r \u2192" })] }), sonlar.length === 0 ? (_jsx("div", { className: "text-sm text-slate-400 italic", children: "Hen\u00FCz teklif yok. \"+ Yeni Teklif\" ile ba\u015Flay\u0131n." })) : (_jsx("div", { className: "divide-y divide-slate-100", children: sonlar.map((t) => (_jsxs(Link, { to: `/teklifler/${t.id}`, className: "flex items-center justify-between py-3 hover:bg-slate-50 rounded px-2 -mx-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs text-brand-700", children: t.teklif_no }), _jsx(Badge, { className: DURUM_RENGI[t.durum], children: DURUM_ETIKET[t.durum] })] }), _jsx("div", { className: "text-sm font-medium mt-1 truncate", children: t.firma_adi }), _jsxs("div", { className: "text-xs text-slate-500", children: [t.olusturan_ad, " \u00B7 ", formatDate(t.tarih)] })] }), _jsx("div", { className: "text-right ml-3", children: _jsx("div", { className: "text-sm font-semibold", children: tl.format(t.genel_toplam) }) })] }, t.id))) }))] })] }));
}
function KartBox({ icon: Icon, baslik, deger, renk, }) {
    return (_jsxs("div", { className: "card flex items-center gap-3 sm:gap-4 p-3 sm:p-5", children: [_jsx("div", { className: `${renk} text-white rounded-lg p-2 sm:p-3 shrink-0`, children: _jsx(Icon, { size: 18 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs text-slate-500 truncate", children: baslik }), _jsx("div", { className: "text-lg sm:text-2xl font-semibold mt-0.5 truncate", children: deger })] })] }));
}
