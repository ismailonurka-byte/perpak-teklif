import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Kullanici = {
  id: string;
  kullanici_adi: string;
  ad_soyad: string;
  rol: string;
  email?: string | null;
  roller?: string[];
  izinler?: string[];
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

/**
 * İzin kontrol hook'u. Kullanım:
 *   const can = useCan();
 *   if (can("teklif.create")) { ... }
 * Yönetici (tüm izinler) zaten backend'den tüm kodlarla gelir.
 */
export function useCan() {
  const izinler = useAuth((s) => s.kullanici?.izinler ?? []);
  return (kod: string) => izinler.includes(kod);
}

/** Tek bir izni reaktif kontrol eder (component görünürlüğü için). */
export function useIzin(kod: string): boolean {
  return useAuth((s) => (s.kullanici?.izinler ?? []).includes(kod));
}
