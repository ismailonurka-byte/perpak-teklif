import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAuth = create()(persist((set) => ({
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
}), { name: "perpak-auth", partialize: (s) => ({ kullanici: s.kullanici }) }));
