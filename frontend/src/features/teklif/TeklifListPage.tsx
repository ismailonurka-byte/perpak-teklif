import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, AlertTriangle } from "lucide-react";

import { api } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { ACIK_DURUMLAR, DURUM_ETIKET, DURUM_RENGI, type TeklifDurum, type TeklifListItem } from "@/types";
import { formatDate, gunFarki, tl } from "@/lib/format";

const DURUMLAR: { kod: TeklifDurum | "TUMU"; ad: string }[] = [
  { kod: "TUMU", ad: "Tümü" },
  { kod: "TASLAK", ad: "Taslak" },
  { kod: "TEKLIF_VERILDI", ad: "Teklif Verildi" },
  { kod: "BEKLEMEDE", ad: "Beklemede" },
  { kod: "KABUL", ad: "Kabul" },
  { kod: "SIPARIS", ad: "Sipariş" },
  { kod: "RED", ad: "Red" },
  { kod: "IPTAL", ad: "İptal" },
];

export default function TeklifListPage() {
  const kullanici = useAuth((s) => s.kullanici);
  const navigate = useNavigate();
  const [durum, setDurum] = useState<TeklifDurum | "TUMU">("TUMU");
  const [arama, setArama] = useState("");
  const [benimMi, setBenimMi] = useState(false);

  const { data = [], isLoading } = useQuery<TeklifListItem[]>({
    queryKey: ["teklif-liste", durum, arama, benimMi],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (durum !== "TUMU") params.durum = durum;
      if (arama) params.arama = arama;
      if (benimMi) params.benim_mi = true;
      return (await api.get("/teklif", { params })).data;
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Teklifler</h1>
          <p className="text-sm text-slate-500">{data.length} kayıt</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/teklifler/yeni")}>
          <Plus size={16} className="mr-1" /> Yeni Teklif
        </button>
      </div>

      <div className="card mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Teklif no veya müşteri ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
        <select className="input sm:w-44" value={durum} onChange={(e) => setDurum(e.target.value as any)}>
          {DURUMLAR.map((d) => <option key={d.kod} value={d.kod}>{d.ad}</option>)}
        </select>
        {kullanici?.rol === "ADMIN" && (
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 px-2">
            <input
              type="checkbox"
              checked={benimMi}
              onChange={(e) => setBenimMi(e.target.checked)}
            />
            Sadece benim
          </label>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Yükleniyor...</div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Filtreye uyan teklif yok.</div>
        ) : (
          <>
            {/* Desktop tablo */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Teklif No</th>
                    <th className="text-left px-4 py-3">Müşteri</th>
                    <th className="text-left px-4 py-3">Satış</th>
                    <th className="text-left px-4 py-3">Tarih</th>
                    <th className="text-right px-4 py-3">Tutar</th>
                    <th className="text-left px-4 py-3">Durum</th>
                    <th className="text-left px-4 py-3">Hareket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((t) => {
                    const gun = gunFarki(t.son_aktivite_ts);
                    const eskimis = gun > 7 && ACIK_DURUMLAR.includes(t.durum) && t.durum !== "TASLAK";
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/teklifler/${t.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium text-brand-700">{t.teklif_no}</td>
                        <td className="px-4 py-3 font-medium">{t.firma_adi}</td>
                        <td className="px-4 py-3 text-slate-600">{t.olusturan_ad}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(t.tarih)}</td>
                        <td className="px-4 py-3 text-right font-medium">{tl.format(t.genel_toplam)}</td>
                        <td className="px-4 py-3">
                          <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {eskimis && <AlertTriangle size={14} className="inline mr-1 text-amber-500" />}
                          <span className={eskimis ? "text-amber-700 font-medium" : "text-slate-500"}>
                            {gun === 0 ? "Bugün" : `${gun} gün önce`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile kart */}
            <div className="md:hidden divide-y divide-slate-100">
              {data.map((t) => {
                const gun = gunFarki(t.son_aktivite_ts);
                const eskimis = gun > 7 && ACIK_DURUMLAR.includes(t.durum) && t.durum !== "TASLAK";
                return (
                  <Link key={t.id} to={`/teklifler/${t.id}`} className="block p-4 active:bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{t.firma_adi}</div>
                        <div className="font-mono text-xs text-brand-700 mt-0.5">{t.teklif_no}</div>
                      </div>
                      <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                      <span>{t.olusturan_ad}</span>
                      <span className="font-medium text-slate-700">{tl.format(t.genel_toplam)}</span>
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-1">
                      {eskimis && <AlertTriangle size={12} className="text-amber-500" />}
                      <span className={eskimis ? "text-amber-700" : "text-slate-400"}>
                        {gun === 0 ? "Bugün" : `${gun} gün önce`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
