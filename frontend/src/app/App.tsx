import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/teklif/DashboardPage";
import TeklifListPage from "@/features/teklif/TeklifListPage";
import TeklifEditorPage from "@/features/teklif/TeklifEditorPage";
import KanbanPage from "@/features/teklif/KanbanPage";
import MusteriListPage from "@/features/musteri/MusteriListPage";
import KullaniciListPage from "@/features/admin/KullaniciListPage";
import RollerPage from "@/features/admin/RollerPage";
import FiyatYonetimiPage from "@/features/admin/FiyatYonetimiPage";
import RaporlarPage from "@/features/rapor/RaporlarPage";
import { ToastContainer } from "@/components/ui/Toast";
import Layout from "./Layout";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const kullanici = useAuth((s) => s.kullanici);
  if (!kullanici) return <Navigate to="/login" replace />;
  return children;
}

/** Belirli bir izin olmadan erişilemeyen route'lar için guard. */
function RequirePermission({ izin, children }: { izin: string; children: React.ReactElement }) {
  const kullanici = useAuth((s) => s.kullanici);
  if (!kullanici) return <Navigate to="/login" replace />;
  if (!(kullanici.izinler ?? []).includes(izin)) return <Navigate to="/" replace />;
  return children;
}

/** Oturum açıkken /auth/me ile izinleri tazeler (admin rol/izin değiştirince yansısın). */
function useSyncMe() {
  const setKullanici = useAuth((s) => s.setKullanici);
  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    api.get("/auth/me").then((r) => setKullanici(r.data)).catch(() => {});
  }, [setKullanici]);
}

export default function App() {
  useSyncMe();
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="teklifler" element={<RequirePermission izin="teklif.read"><TeklifListPage /></RequirePermission>} />
          <Route path="teklifler/yeni" element={<RequirePermission izin="teklif.create"><TeklifEditorPage /></RequirePermission>} />
          <Route path="teklifler/:id" element={<RequirePermission izin="teklif.read"><TeklifEditorPage /></RequirePermission>} />
          <Route path="kanban" element={<RequirePermission izin="teklif.read"><KanbanPage /></RequirePermission>} />
          <Route path="musteriler" element={<RequirePermission izin="firma.read"><MusteriListPage /></RequirePermission>} />
          <Route path="raporlar" element={<RequirePermission izin="rapor.read"><RaporlarPage /></RequirePermission>} />
          <Route path="kullanicilar" element={<RequirePermission izin="kullanici.manage"><KullaniciListPage /></RequirePermission>} />
          <Route path="roller" element={<RequirePermission izin="rol.manage"><RollerPage /></RequirePermission>} />
          <Route path="fiyatlar" element={<RequirePermission izin="fiyat.read"><FiyatYonetimiPage /></RequirePermission>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
