import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp, ArrowUpRight } from "lucide-react";

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
      {/* Hero başlık */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-grad text-white p-6 sm:p-7 mb-6 shadow-brand">
        <div className="absolute inset-0 bg-brand-sheen pointer-events-none" />
        <div
          className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-100/60 mb-1">
              {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Hoş geldin, {kullanici?.ad_soyad.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-brand-100/70 mt-1">Teklif akışınızın güncel özeti aşağıda.</p>
          </div>
          <button
            className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-elevated shrink-0"
            onClick={() => navigate("/teklifler/yeni")}
          >
            <Plus size={16} /> Yeni Teklif
          </button>
        </div>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <KartBox icon={Activity} baslik="Açık Teklifler" deger={String(ozet?.acik_teklif_sayisi ?? 0)} renk="from-sky-500 to-blue-600" />
        <KartBox icon={TrendingUp} baslik="Bu Ay Kazanç" deger={tlShort.format(ozet?.bu_ay_kazanc ?? 0)} renk="from-emerald-500 to-green-600" />
        <KartBox
          icon={CheckCircle}
          baslik="Kazanma Oranı"
          deger={ozet?.kazanma_orani_yuzde !== null && ozet?.kazanma_orani_yuzde !== undefined ? `%${ozet.kazanma_orani_yuzde}` : "—"}
          renk="from-amber-500 to-orange-600"
        />
        <KartBox icon={Clock} baslik="Eskiyen >7 Gün" deger={String(eskiyenler.length)} renk="from-rose-500 to-red-600" vurgu={eskiyenler.length > 0} />
      </div>

      {eskiyenler.length > 0 && (
        <div className="card mb-6 border-l-4 border-amber-400 bg-gradient-to-r from-amber-50/60 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle size={16} />
            </span>
            <h2 className="font-semibold text-slate-800">Dikkat — {eskiyenler.length} teklif 7+ gündür harekete kapalı</h2>
          </div>
          <div className="space-y-0.5">
            {eskiyenler.slice(0, 5).map((t) => (
              <Link
                key={t.id}
                to={`/teklifler/${t.id}`}
                className="flex justify-between items-center py-2 px-3 hover:bg-white rounded-xl text-sm transition-colors group"
              >
                <div>
                  <span className="font-mono text-xs text-brand-600">{t.teklif_no}</span>
                  <span className="ml-2 font-medium group-hover:text-brand-700">{t.firma_adi}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-700 text-xs font-semibold">{gunFarki(t.son_aktivite_ts)} gün</span>
                  <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Son Teklifler</h2>
          <Link to="/teklifler" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group">
            Hepsini gör <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        {sonlar.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 grid place-items-center text-slate-400 mb-3">
              <FileEmpty />
            </div>
            <div className="text-sm text-slate-400">Henüz teklif yok. "+ Yeni Teklif" ile başlayın.</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sonlar.map((t) => (
              <Link
                key={t.id}
                to={`/teklifler/${t.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-xl px-3 -mx-3 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-600">{t.teklif_no}</span>
                    <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                  </div>
                  <div className="text-sm font-semibold mt-1 truncate group-hover:text-brand-700">{t.firma_adi}</div>
                  <div className="text-xs text-slate-500">{t.olusturan_ad} · {formatDate(t.tarih)}</div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold text-slate-900">{tl.format(t.genel_toplam)}</div>
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
  icon: Icon, baslik, deger, renk, vurgu = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  baslik: string;
  deger: string;
  renk: string;
  vurgu?: boolean;
}) {
  return (
    <div className={`card-interactive flex items-center gap-3 sm:gap-4 p-3 sm:p-5 ${vurgu ? "ring-rose-200" : ""}`}>
      <div className={`bg-gradient-to-br ${renk} text-white rounded-xl p-2.5 sm:p-3 shrink-0 shadow-card`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">{baslik}</div>
        <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-0.5 truncate">{deger}</div>
      </div>
    </div>
  );
}

function FileEmpty() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
