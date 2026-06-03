import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/teklif/DashboardPage";
import TeklifListPage from "@/features/teklif/TeklifListPage";
import TeklifEditorPage from "@/features/teklif/TeklifEditorPage";
import KanbanPage from "@/features/teklif/KanbanPage";
import MusteriListPage from "@/features/musteri/MusteriListPage";
import KullaniciListPage from "@/features/admin/KullaniciListPage";
import FiyatYonetimiPage from "@/features/admin/FiyatYonetimiPage";
import RaporlarPage from "@/features/rapor/RaporlarPage";
import { ToastContainer } from "@/components/ui/Toast";
import Layout from "./Layout";
function RequireAuth({ children }) {
    const kullanici = useAuth((s) => s.kullanici);
    if (!kullanici)
        return _jsx(Navigate, { to: "/login", replace: true });
    return children;
}
function RequireAdmin({ children }) {
    const kullanici = useAuth((s) => s.kullanici);
    if (!kullanici)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (kullanici.rol !== "ADMIN")
        return _jsx(Navigate, { to: "/", replace: true });
    return children;
}
export default function App() {
    return (_jsxs(_Fragment, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(RequireAuth, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "teklifler", element: _jsx(TeklifListPage, {}) }), _jsx(Route, { path: "teklifler/yeni", element: _jsx(TeklifEditorPage, {}) }), _jsx(Route, { path: "teklifler/:id", element: _jsx(TeklifEditorPage, {}) }), _jsx(Route, { path: "kanban", element: _jsx(KanbanPage, {}) }), _jsx(Route, { path: "musteriler", element: _jsx(MusteriListPage, {}) }), _jsx(Route, { path: "raporlar", element: _jsx(RaporlarPage, {}) }), _jsx(Route, { path: "kullanicilar", element: _jsx(RequireAdmin, { children: _jsx(KullaniciListPage, {}) }) }), _jsx(Route, { path: "fiyatlar", element: _jsx(RequireAdmin, { children: _jsx(FiyatYonetimiPage, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }), _jsx(ToastContainer, {})] }));
}
