/** Oluklu cinsi (kalite) tanımları. Teklifteki "Oluklu Cinsi/Kalite" listesini besler.
 *  Kod örn: "T090/S080/ - E" — kod kullanıcı tarafından girilir; düzenlemede kod sabittir. */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Info, Box } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";

type Oluklu = { kod: string; tip: string; aciklama: string | null; aktif: boolean };

export default function OlukluTanimPage() {
  const toast = useToast((s) => s.push);
  const qc = useQueryClient();
  const { data: liste = [] } = useQuery<Oluklu[]>({
    queryKey: ["tanim-oluklu"],
    queryFn: async () => (await api.get("/tanim/oluklu-kalite")).data,
  });
  const sonra = () => {
    qc.invalidateQueries({ queryKey: ["tanim-oluklu"] });
    qc.invalidateQueries({ queryKey: ["master-all"] });
  };
  const upsert = useMutation({
    mutationFn: async (o: { kod: string; tip: string; aciklama: string }) =>
      (await api.post("/tanim/oluklu-kalite", { ...o, aktif: true })).data,
    onSuccess: () => { sonra(); toast("ok", "Kaydedildi"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });
  const sil = useMutation({
    mutationFn: async (kod: string) => (await api.post("/tanim/oluklu-kalite/sil", { kod })).data,
    onSuccess: () => { sonra(); toast("ok", "Kaldırıldı"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });
  const [silOnay, setSilOnay] = useState<Oluklu | null>(null);
  const [yKod, setYKod] = useState("");
  const [yTip, setYTip] = useState("");
  const [yAcik, setYAcik] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Oluklu Cinsi</h1>
        <p className="text-sm text-slate-500">Teklifteki "Oluklu Cinsi/Kalite" listesini besler.</p>
      </div>
      <div className="card border-l-4 border-blue-400">
        <div className="flex gap-2 items-start text-sm text-slate-700">
          <Info size={16} className="mt-0.5 text-blue-500" />
          <div>Kod örn. <b>T090/S080/ - E</b>. Düzenlemede kod sabittir; değiştirmek için kaldırıp yeniden ekleyin.</div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Oluklu Kaliteleri</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left px-3 py-2">Kod (oluklu yapısı)</th>
                <th className="text-left px-3 py-2 w-24">Tip</th>
                <th className="text-left px-3 py-2">Açıklama</th>
                <th className="w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.map((o) => (
                <Row key={o.kod} o={o}
                  kaydet={(tip, aciklama) => upsert.mutate({ kod: o.kod, tip, aciklama })}
                  sil={() => setSilOnay(o)} />
              ))}
              {liste.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                  <Box size={28} className="mx-auto mb-2 opacity-40" /> Henüz oluklu kalitesi yok
                </td></tr>
              )}
              <tr className="bg-slate-50">
                <td className="px-3 py-2">
                  <input className="input" placeholder="örn: T090/S080/ - E" value={yKod} onChange={(e) => setYKod(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input className="input" placeholder="E / B / C / BC" value={yTip} onChange={(e) => setYTip(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input className="input" placeholder="(opsiyonel)" value={yAcik} onChange={(e) => setYAcik(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <button className="btn-primary w-full" disabled={!yKod.trim() || upsert.isPending}
                    onClick={() => {
                      upsert.mutate({ kod: yKod.trim(), tip: yTip.trim(), aciklama: yAcik.trim() });
                      setYKod(""); setYTip(""); setYAcik("");
                    }}>
                    <Plus size={14} className="mr-1" /> Ekle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Confirm
        open={silOnay !== null}
        onClose={() => setSilOnay(null)}
        onConfirm={() => silOnay && sil.mutate(silOnay.kod)}
        title="Oluklu kalitesini kaldır"
        message={`"${silOnay?.kod}" kaldırılsın mı? (Pasife alınır; eski teklifler etkilenmez.)`}
        confirmText="Kaldır" danger
      />
    </div>
  );
}

function Row({ o, kaydet, sil }: { o: Oluklu; kaydet: (tip: string, aciklama: string) => void; sil: () => void }) {
  const [tip, setTip] = useState(o.tip);
  const [acik, setAcik] = useState(o.aciklama ?? "");
  useEffect(() => { setTip(o.tip); setAcik(o.aciklama ?? ""); }, [o]);
  const degisti = tip !== o.tip || acik !== (o.aciklama ?? "");
  return (
    <tr>
      <td className="px-3 py-2 font-medium font-mono text-xs">{o.kod}</td>
      <td className="px-3 py-2"><input className="input" value={tip} onChange={(e) => setTip(e.target.value)} /></td>
      <td className="px-3 py-2"><input className="input" value={acik} onChange={(e) => setAcik(e.target.value)} /></td>
      <td className="px-3 py-2 flex gap-2">
        <button className={`btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} flex-1`}
          disabled={!degisti} onClick={() => kaydet(tip, acik)}>
          <Save size={14} className="mr-1" /> Kaydet
        </button>
        <button onClick={sil} className="text-slate-400 hover:text-rose-600 px-2" title="Kaldır"><Trash2 size={16} /></button>
      </td>
    </tr>
  );
}
