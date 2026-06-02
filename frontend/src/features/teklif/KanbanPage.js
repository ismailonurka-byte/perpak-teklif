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
    { kod: "TASLAK", ad: "Taslak" },
    { kod: "TEKLIF_VERILDI", ad: "Teklif Verildi" },
    { kod: "BEKLEMEDE", ad: "Beklemede" },
    { kod: "KABUL", ad: "Kabul" },
    { kod: "SIPARIS", ad: "Sipariş" },
    { kod: "RED", ad: "Red" },
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
    return (_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold mb-2", children: "Kanban" }), _jsx("p", { className: "text-sm text-slate-500 mb-4", children: "T\u00FCm teklifler durum s\u00FCtunlar\u0131nda. Karttaki dropdown'la h\u0131zl\u0131 durum de\u011Fi\u015Ftir." }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4", children: grupli.map((kol) => (_jsxs("div", { className: "bg-slate-100 rounded-xl p-3 flex flex-col min-h-[300px]", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("div", { className: "font-semibold text-sm", children: kol.ad }), _jsx("span", { className: "text-xs bg-white px-2 py-0.5 rounded-full font-medium text-slate-600", children: kol.items.length })] }), _jsxs("div", { className: "space-y-2 flex-1", children: [kol.items.length === 0 && (_jsx("div", { className: "text-xs text-slate-400 italic", children: "Bo\u015F" })), kol.items.map((t) => {
                                    const gun = gunFarki(t.son_aktivite_ts);
                                    const eskimis = gun > 7 && ["TEKLIF_VERILDI", "BEKLEMEDE"].includes(t.durum);
                                    return (_jsxs("div", { className: "bg-white rounded-lg p-3 shadow-sm border border-slate-200", children: [_jsxs(Link, { to: `/teklifler/${t.id}`, className: "block", children: [_jsx("div", { className: "font-mono text-xs text-brand-700", children: t.teklif_no }), _jsx("div", { className: "font-medium text-sm mt-1 line-clamp-2", children: t.firma_adi }), _jsx("div", { className: "text-xs text-slate-500 mt-1", children: t.olusturan_ad }), _jsx("div", { className: "text-sm font-medium mt-1", children: tl.format(t.genel_toplam) }), _jsxs("div", { className: "flex items-center gap-1 text-xs mt-1", children: [eskimis && _jsx(AlertTriangle, { size: 12, className: "text-amber-500" }), _jsx("span", { className: eskimis ? "text-amber-700 font-medium" : "text-slate-400", children: gun === 0 ? "Bugün" : `${gun} gün` })] })] }), _jsx("select", { className: "mt-2 w-full text-xs border-slate-200 border rounded px-2 py-1 bg-slate-50", value: t.durum, onChange: (e) => durumDegistir.mutate({ id: t.id, durum: e.target.value }), children: Object.entries(DURUM_ETIKET).map(([k, v]) => (_jsx("option", { value: k, children: v }, k))) })] }, t.id));
                                })] })] }, kol.kod))) })] }));
}
