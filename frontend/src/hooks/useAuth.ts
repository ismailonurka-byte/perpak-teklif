import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Rol = "ADMIN" | "SATIS" | "URETIM";

export type Kullanici = {
  id: string;
  kullanici_adi: string;
  ad_soyad: string;
  rol: Rol;
  email?: string | null;
};

type AuthState = {
  kullanici: Kullanici | null;
  setKullanici: (k: Kullanici | null) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      kullanici: null,
      setKullanici: (k) => set({ kullanici: k }),
      setTokens: (access, refresh) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
      },
      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ kullanici: null });
      },
    }),
    { name: "perpak-auth", partialize: (s) => ({ kullanici: s.kullanici }) },
  ),
);
