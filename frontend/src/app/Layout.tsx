import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, LogOut, Menu, X,
  Kanban, UserCog, Calculator, BarChart3,
} from "lucide-react";

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden lg:flex w-60 flex-col bg-brand-700 text-white shrink-0">
        <Link to="/" className="px-4 py-4 bg-white">
          <img src="/logo.jpeg" alt="PERPAK Ambalaj" className="h-12 w-auto" />
        </Link>
        <nav className="flex-1 px-2">
          {items.map((it) => {
            const active = location.pathname === it.to ||
              (it.to !== "/" && location.pathname.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-sm transition-colors ${
                  active ? "bg-brand-800" : "hover:bg-brand-800/60"
                }`}
              >
                <it.icon size={18} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-brand-600">
          <div className="text-xs text-brand-100/70">Giriş</div>
          <div className="text-sm font-medium truncate">{kullanici?.ad_soyad}</div>
          <div className="text-xs text-brand-100/70">{kullanici?.rol}</div>
          <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-xs text-brand-100/80 hover:text-white">
            <LogOut size={14} /> Çıkış
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14">
        <button onClick={() => setMobileOpen((v) => !v)} className="text-brand-700">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <img src="/logo.jpeg" alt="PERPAK" className="h-8 w-auto" />
        </Link>
        <button onClick={onLogout} className="text-brand-700"><LogOut size={18} /></button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-20 bg-brand-700 text-white p-4 overflow-y-auto">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 mb-1 hover:bg-brand-800"
            >
              <it.icon size={18} /> {it.label}
            </Link>
          ))}
          <div className="mt-6 pt-4 border-t border-brand-600 text-sm">
            <div className="font-medium">{kullanici?.ad_soyad}</div>
            <div className="text-xs text-brand-100/70">{kullanici?.rol}</div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 lg:p-6 pt-20 lg:pt-6 p-4">
        <Outlet />
      </main>
    </div>
  );
}
