import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
export default function LoginPage() {
    const navigate = useNavigate();
    const setTokens = useAuth((s) => s.setTokens);
    const setKullanici = useAuth((s) => s.setKullanici);
    const [kullanici_adi, setKullaniciAdi] = useState("");
    const [sifre, setSifre] = useState("");
    const [show, setShow] = useState(false);
    const [hata, setHata] = useState(null);
    const [loading, setLoading] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setHata(null);
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { kullanici_adi, sifre });
            setTokens(data.access_token, data.refresh_token);
            setKullanici(data.kullanici);
            navigate("/");
        }
        catch (err) {
            setHata(err?.response?.data?.detail ?? "Giriş başarısız");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "relative min-h-screen flex items-center justify-center bg-brand-grad p-4 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-grid-faint [background-size:38px_38px] opacity-[0.4] pointer-events-none", "aria-hidden": true }), _jsx("div", { className: "absolute -top-32 -left-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl pointer-events-none", "aria-hidden": true }), _jsx("div", { className: "absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/25 blur-3xl pointer-events-none", "aria-hidden": true }), _jsxs("div", { className: "relative w-full max-w-md animate-scale-in", children: [_jsxs("div", { className: "bg-white/95 backdrop-blur-xl rounded-2xl shadow-elevated ring-1 ring-white/40 p-7", children: [_jsxs("div", { className: "text-center mb-7", children: [_jsx("div", { className: "inline-flex p-3 rounded-2xl bg-white ring-1 ring-slate-100 shadow-card mb-3", children: _jsx("img", { src: "/logo.jpeg", alt: "PERPAK Ambalaj", className: "h-14 w-auto" }) }), _jsx("h1", { className: "text-lg font-bold font-display text-slate-900", children: "Teklif Y\u00F6netim Sistemi" }), _jsx("div", { className: "text-xs text-slate-400 mt-0.5", children: "Devam etmek i\u00E7in giri\u015F yap\u0131n" })] }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Kullan\u0131c\u0131 Ad\u0131" }), _jsxs("div", { className: "relative", children: [_jsx(User, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "input pl-9", value: kullanici_adi, onChange: (e) => setKullaniciAdi(e.target.value), autoComplete: "username", autoFocus: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "\u015Eifre" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "input pl-9 pr-9", type: show ? "text" : "password", value: sifre, onChange: (e) => setSifre(e.target.value), autoComplete: "current-password" }), _jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: show ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), hata && (_jsx("div", { className: "text-sm text-rose-600 bg-rose-50 ring-1 ring-rose-100 rounded-xl p-3 animate-fade-in", children: hata })), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-2.5", children: loading ? "Giriş yapılıyor..." : "Giriş Yap" })] })] }), _jsxs("p", { className: "text-center text-[11px] text-brand-100/50 mt-5", children: ["\u00A9 ", new Date().getFullYear(), " PERPAK Ambalaj \u00B7 T\u00FCm haklar\u0131 sakl\u0131d\u0131r"] })] })] }));
}
