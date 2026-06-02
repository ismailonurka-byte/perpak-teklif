import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuth((s) => s.setTokens);
  const setKullanici = useAuth((s) => s.setKullanici);

  const [kullanici_adi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [show, setShow] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { kullanici_adi, sifre });
      setTokens(data.access_token, data.refresh_token);
      setKullanici(data.kullanici);
      navigate("/");
    } catch (err: any) {
      setHata(err?.response?.data?.detail ?? "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900 p-4">
      <div className="w-full max-w-md card">
        <div className="text-center mb-6">
          <img src="/logo.jpeg" alt="PERPAK Ambalaj" className="h-16 w-auto mx-auto mb-2" />
          <div className="text-xs text-slate-500">Teklif Yönetim Sistemi</div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Kullanıcı Adı</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                value={kullanici_adi}
                onChange={(e) => setKullaniciAdi(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label">Şifre</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9 pr-9"
                type={show ? "text" : "password"}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {hata && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{hata}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-400 text-center">
          İlk giriş: <code className="font-mono">admin / admin123</code>
        </div>
      </div>
    </div>
  );
}
