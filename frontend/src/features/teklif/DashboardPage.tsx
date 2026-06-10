import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp, ArrowUpRight,
  FileText, Users, BarChart3, PauseCircle, ChevronRight,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth, useIzin } from "@/hooks/useAuth";
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

  const canTeklifRead = useIzin("teklif.read");
  const canTeklifCreate = useIzin("teklif.create");
  const canFirmaCreate = useIzin("firma.create");
  const canRapor = useIzin("rapor.read");

  const { data: ozet } = useQuery<Ozet>({
    queryKey: ["teklif-ozet"],
    queryFn: async () => (await api.get("/teklif/_/ozet")).data,
  });

  const { data: sonlar = [] } = useQuery<TeklifListItem[]>({
    queryKey: ["teklif-son", "dashboard"],
    queryFn: async () => (await api.get("/teklif", { params: { limit: 12 } })).data,
    enabled: canTeklifRead,
  });

  const eskiyenler = sonlar.filter(
    (t) => gunFarki(t.son_aktivite_ts) > 7 && ACIK_DURUMLAR.includes(t.durum) && t.durum !== "TASLAK"
  );
  const bekleyenler = sonlar.filter((t) => t.durum === "BEKLEMEDE" || t.durum === "TEKLIF_VERILDI");

  const ad = kullanici?.ad_soyad?.split(" ")[0] ?? "";
  const bugun = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* ── Markalı hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-grad text-white p-6 sm:p-7 mb-6 shadow-brand">
        <div className="absolute inset-0 bg-brand-sheen pointer-events-none" />
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-card grid place-items-center shrink-0 p-2">
              <img src="/logo.jpeg" alt="PERPAK" className="h-full w-auto object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold font-display leading-tight">PERPAK Ambalaj</h1>
              <p className="text-sm text-brand-100/80">Teklif &amp; Üretim Portalı</p>
              <p className="text-[11px] uppercase tracking-widest text-brand-100/50 mt-1">{bugun}</p>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className="text-sm text-brand-100/80">Hoş geldin, <b className="text-white">{ad}</b> 👋</span>
            {canTeklifCreate && (
              <button className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-elevated" onClick={() => navigate("/teklifler/yeni")}>
                <Plus size={16} /> Yeni Teklif
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI kartları ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <KartBox icon={Activity} baslik="Açık Teklifler" deger={String(ozet?.acik_teklif_sayisi ?? 0)} renk="from-sky-500 to-blue-600" />
        <KartBox icon={TrendingUp} baslik="Bu Ay Kazanç" deger={tlShort.format(ozet?.bu_ay_kazanc ?? 0)} renk="from-emerald-500 to-green-600" />
        <KartBox
          icon={CheckCircle}
          baslik="Kazanma Oranı"
          deger={ozet?.kazanma_orani_yuzde != null ? `%${ozet.kazanma_orani_yuzde}` : "—"}
          renk="from-amber-500 to-orange-600"
        />
        <KartBox icon={Clock} baslik="Eskiyen >7 Gün" deger={String(eskiyenler.length)} renk="from-rose-500 to-red-600" vurgu={eskiyenler.length > 0} />
      </div>

      {/* ── Hızlı eylemler (role duyarlı) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {canTeklifCreate && <HizliEylem icon={Plus} renk="bg-brand-600" baslik="Yeni Teklif" onClick={() => navigate("/teklifler/yeni")} />}
        {canFirmaCreate && <HizliEylem icon={Users} renk="bg-emerald-600" baslik="Yeni Müşteri" onClick={() => navigate("/musteriler")} />}
        {canTeklifRead && <HizliEylem icon={FileText} renk="bg-sky-600" baslik="Teklifler" onClick={() => navigate("/teklifler")} />}
        {canRapor && <HizliEylem icon={BarChart3} renk="bg-violet-600" baslik="Teklif Takip" onClick={() => navigate("/raporlar")} />}
      </div>

      {/* ── Aksiyon gerektirenler ── */}
      {canTeklifRead && (
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <AksiyonKart
            baslik={`Eskiyen Teklifler (>7 gün)`}
            icon={AlertTriangle}
            renk="amber"
            bos="Bekleyen eskimiş teklif yok 🎉"
            kayitlar={eskiyenler.slice(0, 6)}
            sag={(t) => <span className="text-amber-700 text-xs font-semibold">{gunFarki(t.son_aktivite_ts)} gün</span>}
          />
          <AksiyonKart
            baslik="Takipteki Teklifler"
            icon={PauseCircle}
            renk="sky"
            bos="Takipte teklif yok"
            kayitlar={bekleyenler.slice(0, 6)}
            sag={(t) => <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>}
          />
        </div>
      )}

      {/* ── Son teklifler ── */}
      {canTeklifRead && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Son Teklifler</h2>
            <Link to="/teklifler" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group">
              Hepsini gör <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          {sonlar.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">Henüz teklif yok.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sonlar.slice(0, 8).map((t) => (
                <Link key={t.id} to={`/teklifler/${t.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-xl px-3 -mx-3 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brand-600">{t.teklif_no}</span>
                      <Badge className={DURUM_RENGI[t.durum]}>{DURUM_ETIKET[t.durum]}</Badge>
                    </div>
                    <div className="text-sm font-semibold mt-1 truncate group-hover:text-brand-700">{t.firma_adi}</div>
                    <div className="text-xs text-slate-500">{t.olusturan_ad} · {formatDate(t.tarih)}</div>
                  </div>
                  <div className="text-right ml-3"><div className="text-sm font-bold text-slate-900">{tl.format(t.genel_toplam)}</div></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HizliEylem({ icon: Icon, baslik, renk, onClick }: {
  icon: React.ComponentType<{ size?: number; className?: string }>; baslik: string; renk: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card-interactive flex items-center gap-3 p-3 sm:p-4 text-left w-full">
      <div className={`${renk} text-white rounded-xl p-2.5 shrink-0 shadow-card`}><Icon size={18} /></div>
      <span className="text-sm font-semibold text-slate-800 flex-1">{baslik}</span>
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );
}

const AKSIYON_RENK: Record<string, string> = {
  amber: "border-amber-400 bg-amber-100 text-amber-600",
  sky: "border-sky-400 bg-sky-100 text-sky-600",
};

function AksiyonKart({ baslik, icon: Icon, renk, kayitlar, bos, sag }: {
  baslik: string;
  icon: React.ComponentType<{ size?: number }>;
  renk: "amber" | "sky";
  kayitlar: TeklifListItem[];
  bos: string;
  sag: (t: TeklifListItem) => React.ReactNode;
}) {
  const [borderC, bgC, textC] = AKSIYON_RENK[renk].split(" ");
  return (
    <div className={`card border-l-4 ${borderC}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`grid place-items-center h-8 w-8 rounded-lg ${bgC} ${textC}`}><Icon size={16} /></span>
        <h2 className="font-semibold text-slate-800">{baslik}</h2>
        <span className="ml-auto text-xs font-semibold text-slate-400">{kayitlar.length}</span>
      </div>
      {kayitlar.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">{bos}</div>
      ) : (
        <div className="space-y-0.5">
          {kayitlar.map((t) => (
            <Link key={t.id} to={`/teklifler/${t.id}`} className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 rounded-xl text-sm transition-colors group">
              <div className="min-w-0">
                <span className="font-mono text-xs text-brand-600">{t.teklif_no}</span>
                <span className="ml-2 font-medium group-hover:text-brand-700 truncate">{t.firma_adi}</span>
              </div>
              <div className="shrink-0 ml-3">{sag(t)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function KartBox({ icon: Icon, baslik, deger, renk, vurgu = false }: {
  icon: React.ComponentType<{ size?: number; className?: string }>; baslik: string; deger: string; renk: string; vurgu?: boolean;
}) {
  return (
    <div className={`card-interactive flex items-center gap-3 sm:gap-4 p-3 sm:p-5 ${vurgu ? "ring-rose-200" : ""}`}>
      <div className={`bg-gradient-to-br ${renk} text-white rounded-xl p-2.5 sm:p-3 shrink-0 shadow-card`}><Icon size={20} /></div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">{baslik}</div>
        <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-0.5 truncate">{deger}</div>
      </div>
    </div>
  );
}
