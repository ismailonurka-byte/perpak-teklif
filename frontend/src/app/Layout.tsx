import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, LogOut, Menu, X,
  Kanban, UserCog, Calculator, BarChart3, ChevronRight,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Panel", grup: "Genel" },
  { to: "/teklifler", icon: FileText, label: "Teklifler", grup: "Genel" },
  { to: "/kanban", icon: Kanban, label: "Kanban", adminOnly: true, grup: "Genel" },
  { to: "/musteriler", icon: Users, label: "Müşteriler", grup: "Genel" },
  { to: "/raporlar", icon: BarChart3, label: "Raporlar", grup: "Genel" },
  { to: "/kullanicilar", icon: UserCog, label: "Kullanıcılar", adminOnly: true, grup: "Yönetim" },
  { to: "/fiyatlar", icon: Calculator, label: "Fiyatlar", adminOnly: true, grup: "Yönetim" },
];

function bashar(ad?: string) {
  if (!ad) return "?";
  const p = ad.trim().split(" ");
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

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
  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  const gruplar = [...new Set(items.map((i) => i.grup))];

  const NavLink = ({ it, onClick }: { it: (typeof navItems)[number]; onClick?: () => void }) => {
    const active = isActive(it.to);
    return (
      <Link
        to={it.to}
        onClick={onClick}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 mb-0.5 text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-white/10 text-white shadow-inner-line"
            : "text-brand-100/70 hover:text-white hover:bg-white/5"
        }`}
      >
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-accent-500 transition-all duration-200 ${
            active ? "h-5 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-60"
          }`}
        />
        <it.icon size={18} className={active ? "text-accent-400" : ""} />
        {it.label}
        {active && <ChevronRight size={14} className="ml-auto text-white/40" />}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      {/* ---------- Masaüstü kenar çubuğu ---------- */}
      <aside className="hidden lg:flex w-64 flex-col bg-brand-grad text-white shrink-0 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-brand-sheen pointer-events-none" />
        <Link to="/" className="relative px-5 py-5 m-3 rounded-2xl bg-white shadow-card flex items-center justify-center">
          <img src="/logo.jpeg" alt="PERPAK Ambalaj" className="h-11 w-auto" />
        </Link>

        <nav className="relative flex-1 px-3 overflow-y-auto">
          {gruplar.map((g) => (
            <div key={g} className="mb-4">
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-100/40">
                {g}
              </div>
              {items.filter((i) => i.grup === g).map((it) => (
                <NavLink key={it.to} it={it} />
              ))}
            </div>
          ))}
        </nav>

        <div className="relative m-3 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center text-sm font-bold text-white shadow-card shrink-0">
              {bashar(kullanici?.ad_soyad)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{kullanici?.ad_soyad}</div>
              <div className="text-[11px] text-brand-100/60">{kullanici?.rol}</div>
            </div>
            <button
              onClick={onLogout}
              title="Çıkış"
              className="h-8 w-8 grid place-items-center rounded-lg text-brand-100/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Mobil üst bar ---------- */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 shadow-card">
        <button onClick={() => setMobileOpen((v) => !v)} className="text-brand-700 p-1 -ml-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <img src="/logo.jpeg" alt="PERPAK" className="h-8 w-auto" />
        </Link>
        <button onClick={onLogout} className="text-brand-700 p-1 -mr-1"><LogOut size={18} /></button>
      </div>

      {/* ---------- Mobil çekmece ---------- */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-20 bg-brand-grad text-white p-4 overflow-y-auto animate-fade-in">
          {gruplar.map((g) => (
            <div key={g} className="mb-3">
              <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-100/40">{g}</div>
              {items.filter((i) => i.grup === g).map((it) => (
                <NavLink key={it.to} it={it} onClick={() => setMobileOpen(false)} />
              ))}
            </div>
          ))}
          <div className="mt-6 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center text-sm font-bold">
              {bashar(kullanici?.ad_soyad)}
            </div>
            <div>
              <div className="text-sm font-semibold">{kullanici?.ad_soyad}</div>
              <div className="text-[11px] text-brand-100/60">{kullanici?.rol}</div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 lg:p-8 pt-20 lg:pt-8 p-4">
        <div className="mx-auto max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
