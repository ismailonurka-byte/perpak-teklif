import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/format";
export default function MusteriListPage() {
    const qc = useQueryClient();
    const toast = useToast((s) => s.push);
    const [q, setQ] = useState("");
    const [editing, setEditing] = useState(null);
    const { data: liste = [], isLoading } = useQuery({
        queryKey: ["firma-liste", q],
        queryFn: async () => (await api.get("/firma", { params: q ? { q } : {} })).data,
    });
    const kaydet = useMutation({
        mutationFn: async (f) => {
            if (f.id)
                return (await api.patch(`/firma/${f.id}`, f)).data;
            return (await api.post("/firma", f)).data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["firma-liste"] });
            toast("ok", "Müşteri kaydedildi");
            setEditing(null);
        },
        onError: (e) => toast("err", e?.response?.data?.detail ?? "Hata"),
    });
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "M\u00FC\u015Fteriler" }), _jsxs("p", { className: "text-sm text-slate-500", children: [liste.length, " kay\u0131t"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "input pl-9 w-full sm:w-64", placeholder: "M\u00FC\u015Fteri ara...", value: q, onChange: (e) => setQ(e.target.value) })] }), _jsxs("button", { className: "btn-primary whitespace-nowrap", onClick: () => setEditing("new"), children: [_jsx(Plus, { size: 16, className: "mr-1" }), " Yeni"] })] })] }), _jsx("div", { className: "card p-0 overflow-hidden", children: isLoading ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "Y\u00FCkleniyor..." })) : liste.length === 0 ? (_jsxs("div", { className: "p-10 text-center text-slate-400", children: [_jsx(Building2, { size: 32, className: "mx-auto mb-2 opacity-40" }), "Hen\u00FCz m\u00FC\u015Fteri yok"] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-4 py-3", children: "M\u00FC\u015Fteri" }), _jsx("th", { className: "text-left px-4 py-3", children: "Yetkili" }), _jsx("th", { className: "text-left px-4 py-3", children: "Telefon" }), _jsx("th", { className: "text-left px-4 py-3", children: "E-posta" }), _jsx("th", { className: "text-left px-4 py-3", children: "Eklendi" }), _jsx("th", {})] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: liste.map((f) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-4 py-3 font-medium", children: f.ad }), _jsx("td", { className: "px-4 py-3 text-slate-600", children: f.yetkili ?? "—" }), _jsx("td", { className: "px-4 py-3 text-slate-600", children: f.telefon ?? "—" }), _jsx("td", { className: "px-4 py-3 text-slate-600", children: f.email ?? "—" }), _jsx("td", { className: "px-4 py-3 text-slate-500 text-xs", children: formatDate(f.olusturma_ts) }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => setEditing(f), className: "text-slate-400 hover:text-brand-700", children: _jsx(Edit, { size: 16 }) }) })] }, f.id))) })] }) }), _jsx("div", { className: "md:hidden divide-y divide-slate-100", children: liste.map((f) => (_jsxs("div", { className: "p-4 active:bg-slate-50", onClick: () => setEditing(f), children: [_jsx("div", { className: "font-medium", children: f.ad }), _jsxs("div", { className: "text-xs text-slate-500 mt-1", children: [f.yetkili ?? "—", " \u00B7 ", f.telefon ?? "—"] })] }, f.id))) })] })) }), editing && (_jsx(MusteriForm, { firma: editing === "new" ? null : editing, onClose: () => setEditing(null), onSave: (d) => kaydet.mutate(d), saving: kaydet.isPending }))] }));
}
function MusteriForm({ firma, onClose, onSave, saving, }) {
    const [f, setF] = useState(firma ?? { ad: "", yetkili: "", telefon: "", email: "", adres: "", vergi_no: "", vergi_dairesi: "", notlar: "" });
    const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));
    return (_jsx(Modal, { open: true, onClose: onClose, title: firma ? "Müşteri Düzenle" : "Yeni Müşteri", size: "md", footer: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: "btn-ghost", onClick: onClose, children: "\u0130ptal" }), _jsx("button", { className: "btn-primary", disabled: !f.ad || saving, onClick: () => onSave(f), children: saving ? "Kaydediliyor..." : "Kaydet" })] }), children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "label", children: "Firma Ad\u0131 *" }), _jsx("input", { className: "input", value: f.ad ?? "", onChange: (e) => upd("ad", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Yetkili" }), _jsx("input", { className: "input", value: f.yetkili ?? "", onChange: (e) => upd("yetkili", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Telefon" }), _jsx("input", { className: "input", value: f.telefon ?? "", onChange: (e) => upd("telefon", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "E-posta" }), _jsx("input", { className: "input", type: "email", value: f.email ?? "", onChange: (e) => upd("email", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Vergi No" }), _jsx("input", { className: "input", value: f.vergi_no ?? "", onChange: (e) => upd("vergi_no", e.target.value) })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "label", children: "Vergi Dairesi" }), _jsx("input", { className: "input", value: f.vergi_dairesi ?? "", onChange: (e) => upd("vergi_dairesi", e.target.value) })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "label", children: "Adres" }), _jsx("textarea", { className: "input min-h-[70px]", value: f.adres ?? "", onChange: (e) => upd("adres", e.target.value) })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "label", children: "Notlar" }), _jsx("textarea", { className: "input min-h-[60px]", value: f.notlar ?? "", onChange: (e) => upd("notlar", e.target.value) })] })] }) }));
}
