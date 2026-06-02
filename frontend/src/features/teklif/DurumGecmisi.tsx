/**
 * Teklifin durum geçişlerinin zaman çizelgesi.
 * Hangi kullanıcı ne zaman hangi durumdan hangi duruma geçirdi.
 */
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight } from "lucide-react";

import { api } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import { DURUM_ETIKET, DURUM_RENGI, type TeklifDurum } from "@/types";
import { formatDateTime } from "@/lib/format";

type LogKaydi = {
  id: string;
  eski_durum: TeklifDurum | null;
  yeni_durum: TeklifDurum;
  degistiren_ad: string;
  aciklama: string | null;
  ts: string;
};

export default function DurumGecmisi({ teklifId }: { teklifId: string }) {
  const { data: kayitlar = [], isLoading } = useQuery<LogKaydi[]>({
    queryKey: ["teklif-durum-log", teklifId],
    queryFn: async () => (await api.get(`/teklif/${teklifId}/durum-log`)).data,
    enabled: Boolean(teklifId),
  });

  if (isLoading) return null;
  if (kayitlar.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-brand-700" />
        <h2 className="font-semibold text-sm">Durum Geçmişi ({kayitlar.length})</h2>
      </div>

      <ol className="space-y-2 relative">
        {kayitlar.map((k, i) => (
          <li key={k.id} className="flex items-start gap-3 text-sm">
            <div className="relative flex flex-col items-center pt-0.5">
              <div className={`w-3 h-3 rounded-full ${i === kayitlar.length - 1 ? "bg-brand-700 ring-2 ring-brand-200" : "bg-slate-300"}`} />
              {i < kayitlar.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[24px]" />}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {k.eski_durum ? (
                  <>
                    <Badge className={DURUM_RENGI[k.eski_durum]}>{DURUM_ETIKET[k.eski_durum]}</Badge>
                    <ArrowRight size={14} className="text-slate-400" />
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic">YENİ</span>
                )}
                <Badge className={DURUM_RENGI[k.yeni_durum]}>{DURUM_ETIKET[k.yeni_durum]}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {formatDateTime(k.ts)} · {k.degistiren_ad}
                {k.aciklama && <span className="ml-2 italic">— {k.aciklama}</span>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
