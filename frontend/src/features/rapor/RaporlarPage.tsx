/**
 * Raporlar — Teklif → Sipariş dönüşüm raporu.
 * - Filtre: tarih aralığı, sadece sipariş, sadece benim
 * - Tablo: oluşturma → teklif verme → sipariş tarihleri, dönüşüm günü
 * - Özet kartları: toplam teklif, dönüşen, dönüşüm %, ortalama gün
 * - CSV indir
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, TrendingUp, Clock, CheckCircle, Activity } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI, type TeklifDurum } from "@/types";
import { formatDate, formatDateTime, tl, tlShort } from "@/lib/format";

type Satir = {
  teklif_id: string;
  teklif_no: string;
  firma_adi: string;
  olusturan_ad: string;
  su_anki_durum: TeklifDurum;
  tutar: number;
  olusturma_ts: string | null;
  teklif_verme_ts: string | null;
  kabul_ts: string | null;
  siparis_ts: string | null;
  olusum_siparis_gun: number | null;
  teklif_siparis_gun: number | null;
};

type Rapor = {
  ozet: {
    toplam_teklif: number;
    siparise_donen: number;
    donusum_orani_yuzde: number;
    ortalama_donusum_gun: number | null;
    toplam_siparis_tutari: number;
  };
  satirlar: Satir[];
};

export default function RaporlarPage() {
  const kullanici = useAuth((s) => s.kullanici);
  const [baslangic, setBaslangic] = useState("");
  const [bitis, setBitis] = useState("");
  const [sadeceSiparis, setSadeceSiparis] = useState(false);
  const [benimMi, setBenimMi] = useState(false);

  const { data, isLoading } = useQuery<Rapor>({
    queryKey: ["rapor-donusum", baslangic, bitis, sadeceSiparis, benimMi],
    queryFn: async () => {
      const params: any = {};
      if (baslangic) params.baslangic = baslangic;
      if (bitis) params.bitis = bitis;
      if (sadeceSiparis) params.sadece_siparis = true;
      if (benimMi) params.benim_mi = true;
      return (await api.get("/rapor/teklif-donusum", { params })).data;
    },
  });

  const csvIndir = () => {
    if (!data) return;
    const headers = [
      "Teklif No", "Müşteri", "Satış", "Şu Anki Durum", "Tutar (TL)",
      "Oluşturma", "Teklif Verme", "Kabul", "Sipariş",
      "Oluşum→Sipariş (gün)", "Teklif→Sipariş (gün)",
    ];
    const rows = data.satirlar.map((s) => [
      s.teklif_no,
      s.firma_adi,
      s.olusturan_ad,
      DURUM_ETIKET[s.su_anki_durum],
      s.tutar.toFixed(2),
      s.olusturma_ts ? new Date(s.olusturma_ts).toLocaleString("tr-TR") : "",
      s.teklif_verme_ts ? new Date(s.teklif_verme_ts).toLocaleString("tr-TR") : "",
      s.kabul_ts ? new Date(s.kabul_ts).toLocaleString("tr-TR") : "",
      s.siparis_ts ? new Date(s.siparis_ts).toLocaleString("tr-TR") : "",
      s.olusum_siparis_gun ?? "",
      s.teklif_siparis_gun ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    // UTF-8 BOM ekle (Excel'de Türkçe karakter için)
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teklif-donusum-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-sm text-slate-500">Teklif → Sipariş Dönüşüm</p>
        </div>
        <button
          onClick={csvIndir}
          disabled={!data || data.satirlar.length === 0}
          className="btn-ghost border border-slate-300"
        >
          <Download size={16} className="mr-1" /> Excel/CSV İndir
        </button>
      </div>

      {/* Filtreler */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">Sipariş Başlangıç</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                className="input pl-9"
                value={baslangic}
                onChange={(e) => setBaslangic(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Sipariş Bitiş</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                className="input pl-9"
                value={bitis}
                onChange={(e) => setBitis(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sadeceSiparis}
                onChange={(e) => setSadeceSiparis(e.target.checked)}
              />
              Sadece siparişe dönmüş
            </label>
          </div>
          {kullanici?.rol === "ADMIN" && (
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={benimMi}
                  onChange={(e) => setBenimMi(e.target.checked)}
                />
                Sadece benim
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KartBox icon={Activity} renk="bg-blue-500" baslik="Toplam Teklif" deger={String(data?.ozet.toplam_teklif ?? 0)} />
        <KartBox icon={CheckCircle} renk="bg-emerald-500" baslik="Sipariş'e Dönen" deger={String(data?.ozet.siparise_donen ?? 0)} />
        <KartBox icon={TrendingUp} renk="bg-amber-500" baslik="Dönüşüm Oranı" deger={`%${data?.ozet.donusum_orani_yuzde ?? 0}`} />
        <KartBox
          icon={Clock} renk="bg-violet-500"
          baslik="Ort. Dönüşüm Süresi"
          deger={data?.ozet.ortalama_donusum_gun !== null && data?.ozet.ortalama_donusum_gun !== undefined
            ? `${data.ozet.ortalama_donusum_gun} gün`
            : "—"}
        />
      </div>

      <div className="card mb-4">
        <div className="text-sm text-slate-600">
          Toplam siparişe dönen tutar:
          <span className="ml-2 font-semibold text-emerald-700">
            {tl.format(data?.ozet.toplam_siparis_tutari ?? 0)}
          </span>
        </div>
      </div>

      {/* Tablo */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Yükleniyor...</div>
        ) : !data || data.satirlar.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Filtreye uyan teklif yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-3 py-3">Teklif No</th>
                  <th className="text-left px-3 py-3">Müşteri</th>
                  <th className="text-left px-3 py-3">Satış</th>
                  <th className="text-left px-3 py-3">Durum</th>
                  <th className="text-right px-3 py-3">Tutar</th>
                  <th className="text-left px-3 py-3">Oluşturma</th>
                  <th className="text-left px-3 py-3">Teklif Verme</th>
                  <th className="text-left px-3 py-3">Sipariş</th>
                  <th className="text-right px-3 py-3" title="Teklif verme → Sipariş arası gün sayısı">Süre (gün)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.satirlar.map((s) => (
                  <tr key={s.teklif_id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Link to={`/teklifler/${s.teklif_id}`} className="font-mono text-xs text-brand-700 hover:underline">
                        {s.teklif_no}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-medium">{s.firma_adi}</td>
                    <td className="px-3 py-2 text-slate-600">{s.olusturan_ad}</td>
                    <td className="px-3 py-2">
                      <Badge className={DURUM_RENGI[s.su_anki_durum]}>{DURUM_ETIKET[s.su_anki_durum]}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{tlShort.format(s.tutar)}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTime(s.olusturma_ts)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {s.teklif_verme_ts ? formatDateTime(s.teklif_verme_ts) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {s.siparis_ts
                        ? <span className="text-emerald-700 font-medium">{formatDateTime(s.siparis_ts)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {s.teklif_siparis_gun !== null
                        ? <span className="text-violet-700">{s.teklif_siparis_gun}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KartBox({ icon: Icon, renk, baslik, deger }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  renk: string; baslik: string; deger: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`${renk} text-white rounded-lg p-2.5 shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{baslik}</div>
        <div className="text-xl font-semibold mt-0.5">{deger}</div>
      </div>
    </div>
  );
}
