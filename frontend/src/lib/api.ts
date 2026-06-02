import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuth } from "@/hooks/useAuth";

// Production'da VITE_API_URL boş → kendi origin'inden çağırır (backend ile aynı sunucu).
// Development'ta varsayılan localhost:8000.
const RAW_API = import.meta.env.VITE_API_URL;
const API_URL = RAW_API && RAW_API.length > 0 ? RAW_API : (import.meta.env.PROD ? "" : "http://localhost:8000");

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30_000,
});

// İstek interceptor — access_token ekle
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yanıt interceptor — 401 alınırsa refresh dene
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          const rt = localStorage.getItem("refresh_token");
          if (!rt) throw new Error("no refresh token");
          refreshing = axios
            .post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: rt })
            .then((res) => {
              localStorage.setItem("access_token", res.data.access_token);
              localStorage.setItem("refresh_token", res.data.refresh_token);
              return res.data.access_token as string;
            })
            .catch(() => null)
            .finally(() => {
              refreshing = null;
            });
        }
        const newToken = await refreshing;
        if (newToken && original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        // logout
      }
      useAuth.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
