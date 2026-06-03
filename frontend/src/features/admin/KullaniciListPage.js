import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Shield } from "lucide-react";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/format";
const ROL_RENGI = {
    ADMIN: "bg-rose-100 text-rose-700",
    SATIS: "bg-blue-100 text-blue-700",
    URETIM: "bg-slate-100 text-slate-700",
};
export default function KullaniciListPage() {
    const qc = useQueryClient();
    const toast = useToast((s) => s.push);
    const [editing, setEditing] = useState(null);
    const { data: liste = [], isLoading } = useQuery({
        queryKey: ["kullanici-liste"],
        queryFn: async () => (await api.get("/kullanici")).data,
    });
    const kaydet = useMutation({
        mutationFn: async (data) => {
            if (data.id) {
                const { id, ...rest } = data;
                return (await api.patch(`/kullanici/${id}`, rest)).data;
            }
            return (await api.post("/kullanici", data)).data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["kullanici-liste"] });
            toast("ok", "Kullanıcı kaydedildi");
            setEditing(null);
        },
        onError: (e) => toast("err", e?.response?.data?.detail ?? "Hata"),
    });
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Kullan\u0131c\u0131lar" }), _jsxs("p", { className: "text-sm text-slate-500", children: [liste.length, " kay\u0131t"] })] }), _jsxs("button", { className: "btn-primary", onClick: () => setEditing("new"), children: [_jsx(Plus, { size: 16, className: "mr-1" }), " Yeni Kullan\u0131c\u0131"] })] }), _jsx("div", { className: "card p-0 overflow-hidden", children: isLoading ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "Y\u00FCkleniyor..." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-xs text-slate-500 uppercase tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-4 py-3", children: "Ad Soyad" }), _jsx("th", { className: "text-left px-4 py-3", children: "Kullan\u0131c\u0131 Ad\u0131" }), _jsx("th", { className: "text-left px-4 py-3", children: "Rol" }), _jsx("th", { className: "text-left px-4 py-3", children: "E-posta" }), _jsx("th", { className: "text-left px-4 py-3", children: "Son Giri\u015F" }), _jsx("th", { className: "text-left px-4 py-3", children: "Durum" }), _jsx("th", {})] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: liste.map((u) => (_jsxs("tr", { className: "hover:bg-slate-50", children: [_jsx("td", { className: "px-4 py-3 font-medium", children: u.ad_soyad }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-slate-600", children: u.kullanici_adi }), _jsx("td", { className: "px-4 py-3", children: _jsxs(Badge, { className: ROL_RENGI[u.rol], children: [_jsx(Shield, { size: 10, className: "mr-1 inline" }), u.rol] }) }), _jsx("td", { className: "px-4 py-3 text-slate-600", children: u.email ?? "—" }), _jsx("td", { className: "px-4 py-3 text-xs text-slate-500", children: formatDateTime(u.son_giris) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: u.aktif ? "text-emerald-600" : "text-slate-400", children: u.aktif ? "Aktif" : "Pasif" }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => setEditing(u), className: "text-slate-400 hover:text-brand-700", children: _jsx(Edit, { size: 16 }) }) })] }, u.id))) })] }) })) }), editing && (_jsx(KullaniciForm, { kullanici: editing === "new" ? null : editing, onClose: () => setEditing(null), onSave: (d) => kaydet.mutate(d), saving: kaydet.isPending }))] }));
}
function KullaniciForm({ kullanici, onClose, onSave, saving, }) {
    const [f, setF] = useState({
        id: kullanici?.id,
        kullanici_adi: kullanici?.kullanici_adi ?? "",
        sifre: "",
        ad_soyad: kullanici?.ad_soyad ?? "",
        unvan: kullanici?.unvan ?? "",
        rol: kullanici?.rol ?? "SATIS",
        telefon: kullanici?.telefon ?? "",
        email: kullanici?.email ?? "",
        aktif: kullanici?.aktif ?? true,
    });
    const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const submit = () => {
        const data = { ...f };
        if (!data.sifre)
            delete data.sifre;
        if (!data.id)
            delete data.id;
        onSave(data);
    };
    return (_jsx(Modal, { open: true, onClose: onClose, title: kullanici ? "Kullanıcı Düzenle" : "Yeni Kullanıcı", size: "md", footer: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: "btn-ghost", onClick: onClose, children: "\u0130ptal" }), _jsx("button", { className: "btn-primary", disabled: !f.kullanici_adi || !f.ad_soyad || (!kullanici && !f.sifre) || saving, onClick: submit, children: saving ? "Kaydediliyor..." : "Kaydet" })] }), children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Ad Soyad *" }), _jsx("input", { className: "input", value: f.ad_soyad, onChange: (e) => upd("ad_soyad", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Kullan\u0131c\u0131 Ad\u0131 *" }), _jsx("input", { className: "input", value: f.kullanici_adi, onChange: (e) => upd("kullanici_adi", e.target.value), disabled: Boolean(kullanici) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: kullanici ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre *" }), _jsx("input", { className: "input", type: "password", value: f.sifre, onChange: (e) => upd("sifre", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "\u00DCnvan (proformada yaz\u0131l\u0131r)" }), _jsx("input", { className: "input", placeholder: "\u00F6rn: Sat\u0131\u015F Temsilcisi, Genel M\u00FCd\u00FCr", value: f.unvan, onChange: (e) => upd("unvan", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Rol" }), _jsxs("select", { className: "input", value: f.rol, onChange: (e) => upd("rol", e.target.value), children: [_jsx("option", { value: "ADMIN", children: "Y\u00F6netici" }), _jsx("option", { value: "SATIS", children: "Sat\u0131\u015F Temsilcisi" }), _jsx("option", { value: "URETIM", children: "\u00DCretim" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Telefon" }), _jsx("input", { className: "input", value: f.telefon, onChange: (e) => upd("telefon", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "E-posta" }), _jsx("input", { className: "input", type: "email", value: f.email, onChange: (e) => upd("email", e.target.value) })] }), kullanici && (_jsx("div", { className: "sm:col-span-2", children: _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: f.aktif, onChange: (e) => upd("aktif", e.target.checked) }), "Aktif"] }) }))] }) }));
}
