import React from "react";
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

function RequireAuth({ children }: { children: React.ReactElement }) {
  const kullanici = useAuth((s) => s.kullanici);
  if (!kullanici) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const kullanici = useAuth((s) => s.kullanici);
  if (!kullanici) return <Navigate to="/login" replace />;
  if (kullanici.rol !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="teklifler" element={<TeklifListPage />} />
          <Route path="teklifler/yeni" element={<TeklifEditorPage />} />
          <Route path="teklifler/:id" element={<TeklifEditorPage />} />
          <Route path="kanban" element={<RequireAdmin><KanbanPage /></RequireAdmin>} />
          <Route path="musteriler" element={<MusteriListPage />} />
          <Route path="raporlar" element={<RaporlarPage />} />
          <Route path="kullanicilar" element={<RequireAdmin><KullaniciListPage /></RequireAdmin>} />
          <Route path="fiyatlar" element={<RequireAdmin><FiyatYonetimiPage /></RequireAdmin>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
