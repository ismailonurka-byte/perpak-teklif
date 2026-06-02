import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Users, LogOut, Menu, X, Kanban, UserCog, Calculator, BarChart3, } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Panel" },
    { to: "/teklifler", icon: FileText, label: "Teklifler" },
    { to: "/kanban", icon: Kanban, label: "Kanban", adminOnly: true },
    { to: "/musteriler", icon: Users, label: "Müşteriler" },
    { to: "/raporlar", icon: BarChart3, label: "Raporlar" },
    { to: "/kullanicilar", icon: UserCog, label: "Kullanıcılar", adminOnly: true },
    { to: "/fiyatlar", icon: Calculator, label: "Fiyatlar", adminOnly: true },
];
export default function Layout() {
    const kullanici = useAuth((s) => s.kullanici);
    const logout = useAuth((s) => s.logout);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const onLogout = () => {
        logout();
        navigate("/login");
    };
    const items = navItems.filter((i) => !i.adminOnly || kullanici?.rol === "ADMIN");
    return (_jsxs("div", { className: "flex min-h-screen bg-slate-50", children: [_jsxs("aside", { className: "hidden lg:flex w-60 flex-col bg-brand-700 text-white shrink-0", children: [_jsx(Link, { to: "/", className: "px-4 py-4 bg-white", children: _jsx("img", { src: "/logo.jpeg", alt: "PERPAK Ambalaj", className: "h-12 w-auto" }) }), _jsx("nav", { className: "flex-1 px-2", children: items.map((it) => {
                            const active = location.pathname === it.to ||
                                (it.to !== "/" && location.pathname.startsWith(it.to));
                            return (_jsxs(Link, { to: it.to, className: `flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-sm transition-colors ${active ? "bg-brand-800" : "hover:bg-brand-800/60"}`, children: [_jsx(it.icon, { size: 18 }), it.label] }, it.to));
                        }) }), _jsxs("div", { className: "px-4 py-4 border-t border-brand-600", children: [_jsx("div", { className: "text-xs text-brand-100/70", children: "Giri\u015F" }), _jsx("div", { className: "text-sm font-medium truncate", children: kullanici?.ad_soyad }), _jsx("div", { className: "text-xs text-brand-100/70", children: kullanici?.rol }), _jsxs("button", { onClick: onLogout, className: "mt-3 flex items-center gap-2 text-xs text-brand-100/80 hover:text-white", children: [_jsx(LogOut, { size: 14 }), " \u00C7\u0131k\u0131\u015F"] })] })] }), _jsxs("div", { className: "lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14", children: [_jsx("button", { onClick: () => setMobileOpen((v) => !v), className: "text-brand-700", children: mobileOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) }), _jsx(Link, { to: "/", onClick: () => setMobileOpen(false), children: _jsx("img", { src: "/logo.jpeg", alt: "PERPAK", className: "h-8 w-auto" }) }), _jsx("button", { onClick: onLogout, className: "text-brand-700", children: _jsx(LogOut, { size: 18 }) })] }), mobileOpen && (_jsxs("div", { className: "lg:hidden fixed inset-0 top-14 z-20 bg-brand-700 text-white p-4 overflow-y-auto", children: [items.map((it) => (_jsxs(Link, { to: it.to, onClick: () => setMobileOpen(false), className: "flex items-center gap-3 rounded-lg px-3 py-3 mb-1 hover:bg-brand-800", children: [_jsx(it.icon, { size: 18 }), " ", it.label] }, it.to))), _jsxs("div", { className: "mt-6 pt-4 border-t border-brand-600 text-sm", children: [_jsx("div", { className: "font-medium", children: kullanici?.ad_soyad }), _jsx("div", { className: "text-xs text-brand-100/70", children: kullanici?.rol })] })] })), _jsx("main", { className: "flex-1 min-w-0 lg:p-6 pt-20 lg:pt-6 p-4", children: _jsx(Outlet, {}) })] }));
}
