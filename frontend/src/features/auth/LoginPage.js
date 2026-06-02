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
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900 p-4", children: _jsxs("div", { className: "w-full max-w-md card", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("img", { src: "/logo.jpeg", alt: "PERPAK Ambalaj", className: "h-16 w-auto mx-auto mb-2" }), _jsx("div", { className: "text-xs text-slate-500", children: "Teklif Y\u00F6netim Sistemi" })] }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Kullan\u0131c\u0131 Ad\u0131" }), _jsxs("div", { className: "relative", children: [_jsx(User, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "input pl-9", value: kullanici_adi, onChange: (e) => setKullaniciAdi(e.target.value), autoComplete: "username", autoFocus: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "\u015Eifre" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "input pl-9 pr-9", type: show ? "text" : "password", value: sifre, onChange: (e) => setSifre(e.target.value), autoComplete: "current-password" }), _jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: show ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), hata && _jsx("div", { className: "text-sm text-red-600 bg-red-50 rounded-lg p-3", children: hata }), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full", children: loading ? "Giriş yapılıyor..." : "Giriş Yap" })] }), _jsxs("div", { className: "mt-4 text-xs text-slate-400 text-center", children: ["\u0130lk giri\u015F: ", _jsx("code", { className: "font-mono", children: "admin / admin123" })] })] }) }));
}
