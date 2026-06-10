import { useState, type ReactNode } from "react";
import { Users, ShieldCheck } from "lucide-react";

import { useIzin } from "@/hooks/useAuth";
import KullaniciListPage from "./KullaniciListPage";
import RollerPage from "./RollerPage";

/**
 * Yönetim › Ayarlar — Kullanıcılar ve Roller tek sayfada sekmeli.
 * Her sekme ilgili izne göre görünür (kullanici.manage / rol.manage).
 */
export default function AyarlarPage() {
  const canUsers = useIzin("kullanici.manage");
  const canRoles = useIzin("rol.manage");

  const sekmeler = [
    canUsers && { key: "kullanicilar", label: "Kullanıcılar", icon: Users, el: <KullaniciListPage /> },
    canRoles && { key: "roller", label: "Roller & Yetkiler", icon: ShieldCheck, el: <RollerPage /> },
  ].filter(Boolean) as { key: string; label: string; icon: any; el: ReactNode }[];

  const [aktif, setAktif] = useState(sekmeler[0]?.key ?? "");

  if (sekmeler.length === 0) {
    return <div className="card text-center text-slate-400 py-10">Bu sayfa için yetkiniz yok.</div>;
  }

  const aktifSekme = sekmeler.find((s) => s.key === aktif) ?? sekmeler[0];

  return (
    <div>
      <div className="mb-4">
        <h1 className="page-title">Ayarlar</h1>
        <p className="text-sm text-slate-500">Kullanıcı ve rol/yetki yönetimi</p>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 mb-5 border-b border-slate-200">
        {sekmeler.map((s) => {
          const active = s.key === aktifSekme.key;
          return (
            <button
              key={s.key}
              onClick={() => setAktif(s.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <s.icon size={15} /> {s.label}
            </button>
          );
        })}
      </div>

      {/* Aktif sekme içeriği */}
      {aktifSekme.el}
    </div>
  );
}
