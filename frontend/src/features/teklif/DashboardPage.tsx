import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI, ACIK_DURUMLAR, type TeklifListItem } from "@/types";
import { formatDate, gunFarki, tlShort, tl } from "@/lib/format";

type Ozet = {
  acik_teklif_sayisi: number;
  bu_ay_kazanc: number;
  kazanma_orani_yuzde: number | null;
};

export default function DashboardPage() {
  const kullanici = useAuth((s) => s.kullanici);
  const navigate = useNavigate();

  const { data: ozet } = useQuery<Ozet>({
    queryKey: ["teklif-ozet"],
    queryFn: async () => (await api.get("/teklif/_/ozet")).data,
  });

  const { data: sonlar = [] } = useQuery<TeklifListItem[]>({
    queryKey: ["teklif-son", "dashboard"],
    queryFn: async () =>
      (await api.get("/teklif", { params: { limit: 8 } })).data,
  });

  const eskiyenler = sonlar.filter(
    (t) =>
      gunFarki(t.son_aktivite_ts) > 7 &&
      ACIK_DURUMLAR.includes(t.durum) &&
      t.durum !== "TASLAK"
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hoş geldin, {kullanici?.ad_soyad.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/teklifler/yeni")}>
          <Plus size={16} className="mr-1" /> Yeni Teklif
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KartBox icon={Activity} baslik="Açık Teklifler" deger={String(ozet?.acik_teklif_sayisi ?? 0)} renk="bg-blue-500" />
        <KartBox icon={TrendingUp} baslik="Bu Ay Kazanç" deger={tlShort.format(ozet?.bu_ay_kazanc ?? 0)} renk="bg-emerald-500" />
        <KartBox
          icon={CheckCircle}
          baslik="Kazanma Oranı"
          deger={ozet?.kazanma_orani_yuzde !== null && ozet?.kazanma_orani_yuzde !== undefined ? `%${ozet.kazanma_orani_yuzde}` : "—"}
          renk="bg-amber-500"
        />
        <KartBox icon={Clock} baslik="Eskiyen >7 Gün" deger={String(eskiyenler.length)} renk="bg-rose-500" />
      </div>

      {eskiyenler.length > 0 && (
        <div className="card mb-6 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold">Dikkat — {eskiyenler.length} teklif 7+ gündür harekete kapalı</h2>
          </div>
          <div className="space-y-1">
            {eskiyenler.slice(0, 5).map((t) => (
              <Link
                key={t.id}
                to={`/teklifler/${t.id}`}
                className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 rounded text-sm"
              >
                <div>
                  <span className="font-mono text-xs text-brand-700">{t.teklif_no}</span>
                  <span className="ml-2 font-medium">{t.firma_adi}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-700 text-xs">{gunFarki(t.son_aktivite_ts)} gün</span>
                  <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Son Teklifler</h2>
          <Link to="/teklifler" className="text-sm text-brand-600 hover:underline">
            Hepsini gör →
          </Link>
        </div>
        {sonlar.length === 0 ? (
          <div className="text-sm text-slate-400 italic">Henüz teklif yok. "+ Yeni Teklif" ile başlayın.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sonlar.map((t) => (
              <Link
                key={t.id}
                to={`/teklifler/${t.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 rounded px-2 -mx-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-700">{t.teklif_no}</span>
                    <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                  </div>
                  <div className="text-sm font-medium mt-1 truncate">{t.firma_adi}</div>
                  <div className="text-xs text-slate-500">{t.olusturan_ad} · {formatDate(t.tarih)}</div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-semibold">{tl.format(t.genel_toplam)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KartBox({
  icon: Icon, baslik, deger, renk,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  baslik: string;
  deger: string;
  renk: string;
}) {
  return (
    <div className="card flex items-center gap-3 sm:gap-4 p-3 sm:p-5">
      <div className={`${renk} text-white rounded-lg p-2 sm:p-3 shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500 truncate">{baslik}</div>
        <div className="text-lg sm:text-2xl font-semibold mt-0.5 truncate">{deger}</div>
      </div>
    </div>
  );
}
