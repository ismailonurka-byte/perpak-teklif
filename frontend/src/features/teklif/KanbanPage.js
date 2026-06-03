import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Yönetici Kanban — açık teklifleri durum sütunlarında gösterir.
 * Drag-drop yerine her kartta hızlı durum değiştirici dropdown.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { DURUM_ETIKET } from "@/types";
import { tl, gunFarki } from "@/lib/format";
const KOLONLAR = [
    { kod: "TASLAK", ad: "Taslak", nokta: "bg-slate-400" },
    { kod: "TEKLIF_VERILDI", ad: "Teklif Verildi", nokta: "bg-blue-500" },
    { kod: "BEKLEMEDE", ad: "Beklemede", nokta: "bg-amber-500" },
    { kod: "KABUL", ad: "Kabul", nokta: "bg-emerald-500" },
    { kod: "SIPARIS", ad: "Sipariş", nokta: "bg-violet-500" },
    { kod: "RED", ad: "Red", nokta: "bg-rose-500" },
];
export default function KanbanPage() {
    const qc = useQueryClient();
    const toast = useToast((s) => s.push);
    const { data: liste = [], isLoading } = useQuery({
        queryKey: ["teklif-kanban"],
        queryFn: async () => (await api.get("/teklif", { params: { limit: 500 } })).data,
    });
    const durumDegistir = useMutation({
        mutationFn: async ({ id, durum }) => (await api.patch(`/teklif/${id}`, { durum })).data,
        onSuccess: () => {
            toast("ok", "Durum güncellendi");
            qc.invalidateQueries({ queryKey: ["teklif-kanban"] });
            qc.invalidateQueries({ queryKey: ["teklif-liste"] });
        },
        onError: () => toast("err", "Durum değiştirilemedi"),
    });
    if (isLoading)
        return _jsx("div", { className: "p-6 text-center text-slate-400", children: "Y\u00FCkleniyor..." });
    const grupli = KOLONLAR.map((k) => ({
        ...k,
        items: liste.filter((t) => t.durum === k.kod),
    }));
    return (_jsxs("div", { children: [_jsx("h1", { className: "page-title mb-1", children: "Kanban" }), _jsx("p", { className: "text-sm text-slate-500 mb-5", children: "T\u00FCm teklifler durum s\u00FCtunlar\u0131nda. Karttaki dropdown'la h\u0131zl\u0131 durum de\u011Fi\u015Ftir." }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4", children: grupli.map((kol) => (_jsxs("div", { className: "bg-slate-100/70 ring-1 ring-slate-200/60 rounded-2xl p-3 flex flex-col min-h-[320px]", children: [_jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [_jsxs("div", { className: "flex items-center gap-2 font-semibold text-sm text-slate-700", children: [_jsx("span", { className: `h-2 w-2 rounded-full ${kol.nokta}` }), kol.ad] }), _jsx("span", { className: "text-xs bg-white shadow-card px-2 py-0.5 rounded-full font-semibold text-slate-600", children: kol.items.length })] }), _jsxs("div", { className: "space-y-2.5 flex-1", children: [kol.items.length === 0 && (_jsx("div", { className: "grid place-items-center h-24 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl", children: "Bo\u015F" })), kol.items.map((t) => {
                                    const gun = gunFarki(t.son_aktivite_ts);
                                    const eskimis = gun > 7 && ["TEKLIF_VERILDI", "BEKLEMEDE"].includes(t.durum);
                                    return (_jsxs("div", { className: "bg-white rounded-xl p-3 shadow-card ring-1 ring-slate-200/70 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200", children: [_jsxs(Link, { to: `/teklifler/${t.id}`, className: "block", children: [_jsx("div", { className: "font-mono text-xs text-brand-600", children: t.teklif_no }), _jsx("div", { className: "font-semibold text-sm mt-1 line-clamp-2 text-slate-800", children: t.firma_adi }), _jsx("div", { className: "text-xs text-slate-500 mt-1", children: t.olusturan_ad }), _jsx("div", { className: "text-sm font-bold text-slate-900 mt-1", children: tl.format(t.genel_toplam) }), _jsxs("div", { className: "flex items-center gap-1 text-xs mt-1", children: [eskimis && _jsx(AlertTriangle, { size: 12, className: "text-amber-500" }), _jsx("span", { className: eskimis ? "text-amber-700 font-semibold" : "text-slate-400", children: gun === 0 ? "Bugün" : `${gun} gün` })] })] }), _jsx("select", { className: "mt-2.5 w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 font-medium text-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none cursor-pointer", value: t.durum, onChange: (e) => durumDegistir.mutate({ id: t.id, durum: e.target.value }), children: Object.entries(DURUM_ETIKET).map(([k, v]) => (_jsx("option", { value: k, children: v }, k))) })] }, t.id));
                                })] })] }, kol.kod))) })] }));
}
