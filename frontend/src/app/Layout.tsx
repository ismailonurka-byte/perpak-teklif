import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Database, Settings,
  LogOut, Menu, X, ChevronDown, ChevronRight,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

type Cocuk = { to: string; label: string; izin?: string | string[] };
type NavGirdi =
  | { tip: "link"; to: string; label: string; icon: any; izin?: string | string[] }
  | { tip: "grup"; label: string; icon: any; cocuklar: Cocuk[] };

// ── Menü haritası (hiyerarşik) ──
const NAV: NavGirdi[] = [
  { tip: "link", to: "/", label: "Genel Bakış", icon: LayoutDashboard, izin: "dashboard.read" },
  {
    tip: "grup", label: "Teklif", icon: FileText, cocuklar: [
      { to: "/teklifler", label: "Teklifler", izin: "teklif.read" },
      { to: "/kanban", label: "Kanban", izin: "teklif.read" },
    ],
  },
  {
    tip: "grup", label: "Tanımlar", icon: Database, cocuklar: [
      { to: "/musteriler", label: "Müşteriler", izin: "firma.read" },
      { to: "/baski-makineleri", label: "Baskı Makineleri", izin: "master.read" },
      { to: "/karton-cinsi", label: "Karton Malzeme Cinsi", izin: "master.read" },
      { to: "/oluklu-cinsi", label: "Oluklu Cinsi", izin: "master.read" },
      { to: "/fiyatlar", label: "Fiyatlar", izin: "fiyat.read" },
    ],
  },
  {
    tip: "grup", label: "Teklif Takip", icon: BarChart3, cocuklar: [
      { to: "/raporlar", label: "Teklif Takip Dashboard", izin: "rapor.read" },
    ],
  },
  {
    tip: "grup", label: "Yönetim", icon: Settings, cocuklar: [
      { to: "/ayarlar", label: "Ayarlar", izin: ["kullanici.manage", "rol.manage"] },
    ],
  },
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
  // Tüm gruplar başlangıçta açık
  const [acik, setAcik] = useState<Set<string>>(
    () => new Set(NAV.filter((n) => n.tip === "grup").map((n) => n.label))
  );

  const onLogout = () => { logout(); navigate("/login"); };

  const izinler = kullanici?.izinler ?? [];
  const izinVar = (iz?: string | string[]) => {
    if (!iz) return true;
    return (Array.isArray(iz) ? iz : [iz]).some((k) => izinler.includes(k));
  };
  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  const toggle = (g: string) =>
    setAcik((p) => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });

  const TopLink = ({ to, icon: Icon, label, onClick }: any) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 mb-0.5 text-sm font-medium transition-all duration-150 ${
          active ? "bg-white/10 text-white shadow-inner-line" : "text-brand-100/70 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-accent-500 transition-all duration-200 ${
          active ? "h-5 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-60"
        }`} />
        <Icon size={18} className={active ? "text-accent-400" : ""} />
        {label}
        {active && <ChevronRight size={14} className="ml-auto text-white/40" />}
      </Link>
    );
  };

  const ChildLink = ({ to, label, onClick }: any) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`relative flex items-center gap-2 rounded-lg pl-3 pr-3 py-2 text-sm transition-all duration-150 ${
          active ? "bg-white/10 text-white font-medium" : "text-brand-100/60 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? "bg-accent-400" : "bg-white/25"}`} />
        {label}
      </Link>
    );
  };

  const renderNav = (onItemClick?: () => void) => (
    <>
      {NAV.map((girdi) => {
        if (girdi.tip === "link") {
          if (!izinVar(girdi.izin)) return null;
          return <TopLink key={girdi.to} to={girdi.to} icon={girdi.icon} label={girdi.label} onClick={onItemClick} />;
        }
        const cocuklar = girdi.cocuklar.filter((c) => izinVar(c.izin));
        if (cocuklar.length === 0) return null;
        const open = acik.has(girdi.label);
        return (
          <div key={girdi.label} className="mb-1">
            <button
              onClick={() => toggle(girdi.label)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-100/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <girdi.icon size={18} />
              {girdi.label}
              <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
            </button>
            {open && (
              <div className="mt-0.5 ml-4 pl-2 border-l border-white/10 space-y-0.5">
                {cocuklar.map((c) => (
                  <ChildLink key={c.to} to={c.to} label={c.label} onClick={onItemClick} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      {/* ---------- Masaüstü kenar çubuğu ---------- */}
      <aside className="hidden lg:flex w-64 flex-col bg-brand-grad text-white shrink-0 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-brand-sheen pointer-events-none" />
        <Link to="/" className="relative px-5 py-5 m-3 rounded-2xl bg-white shadow-card flex items-center justify-center">
          <img src="/logo.jpeg" alt="Vanto" className="h-11 w-auto" />
        </Link>

        <nav className="relative flex-1 px-3 overflow-y-auto pb-3">
          {renderNav()}
        </nav>

        <div className="relative m-3 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center text-sm font-bold text-white shadow-card shrink-0">
              {bashar(kullanici?.ad_soyad)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{kullanici?.ad_soyad}</div>
              <div className="text-[11px] text-brand-100/60">{(kullanici?.roller && kullanici.roller[0]) || kullanici?.rol}</div>
            </div>
            <button onClick={onLogout} title="Çıkış"
              className="h-8 w-8 grid place-items-center rounded-lg text-brand-100/70 hover:text-white hover:bg-white/10 transition-colors">
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
          <img src="/logo.jpeg" alt="Vanto" className="h-8 w-auto" />
        </Link>
        <button onClick={onLogout} className="text-brand-700 p-1 -mr-1"><LogOut size={18} /></button>
      </div>

      {/* ---------- Mobil çekmece ---------- */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-20 bg-brand-grad text-white p-4 overflow-y-auto animate-fade-in">
          {renderNav(() => setMobileOpen(false))}
          <div className="mt-6 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center text-sm font-bold">
              {bashar(kullanici?.ad_soyad)}
            </div>
            <div>
              <div className="text-sm font-semibold">{kullanici?.ad_soyad}</div>
              <div className="text-[11px] text-brand-100/60">{(kullanici?.roller && kullanici.roller[0]) || kullanici?.rol}</div>
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
