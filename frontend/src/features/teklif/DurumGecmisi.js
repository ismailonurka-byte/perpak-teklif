import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Teklifin durum geçişlerinin zaman çizelgesi.
 * Hangi kullanıcı ne zaman hangi durumdan hangi duruma geçirdi.
 */
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI } from "@/types";
import { formatDateTime } from "@/lib/format";
export default function DurumGecmisi({ teklifId }) {
    const { data: kayitlar = [], isLoading } = useQuery({
        queryKey: ["teklif-durum-log", teklifId],
        queryFn: async () => (await api.get(`/teklif/${teklifId}/durum-log`)).data,
        enabled: Boolean(teklifId),
    });
    if (isLoading)
        return null;
    if (kayitlar.length === 0)
        return null;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Clock, { size: 16, className: "text-brand-700" }), _jsxs("h2", { className: "font-semibold text-sm", children: ["Durum Ge\u00E7mi\u015Fi (", kayitlar.length, ")"] })] }), _jsx("ol", { className: "space-y-2 relative", children: kayitlar.map((k, i) => (_jsxs("li", { className: "flex items-start gap-3 text-sm", children: [_jsxs("div", { className: "relative flex flex-col items-center pt-0.5", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${i === kayitlar.length - 1 ? "bg-brand-700 ring-2 ring-brand-200" : "bg-slate-300"}` }), i < kayitlar.length - 1 && _jsx("div", { className: "w-px flex-1 bg-slate-200 mt-1 min-h-[24px]" })] }), _jsxs("div", { className: "flex-1 pb-2", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [k.eski_durum ? (_jsxs(_Fragment, { children: [_jsx(Badge, { className: DURUM_RENGI[k.eski_durum], children: DURUM_ETIKET[k.eski_durum] }), _jsx(ArrowRight, { size: 14, className: "text-slate-400" })] })) : (_jsx("span", { className: "text-xs text-slate-500 italic", children: "YEN\u0130" })), _jsx(Badge, { className: DURUM_RENGI[k.yeni_durum], children: DURUM_ETIKET[k.yeni_durum] })] }), _jsxs("div", { className: "text-xs text-slate-500 mt-1", children: [formatDateTime(k.ts), " \u00B7 ", k.degistiren_ad, k.aciklama && _jsxs("span", { className: "ml-2 italic", children: ["\u2014 ", k.aciklama] })] })] })] }, k.id))) })] }));
}
