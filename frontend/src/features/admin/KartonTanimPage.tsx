/** Karton (malzeme) cinsi tanımları. Teklif formundaki "Karton Cinsi" dropdown'ını besler. */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Info, Layers } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";

type Karton = { kod: string; ad: string; aktif: boolean };

export default function KartonTanimPage() {
  const toast = useToast((s) => s.push);
  const qc = useQueryClient();
  const { data: liste = [] } = useQuery<Karton[]>({
    queryKey: ["tanim-karton"],
    queryFn: async () => (await api.get("/tanim/karton-cinsi")).data,
  });
  const sonra = () => {
    qc.invalidateQueries({ queryKey: ["tanim-karton"] });
    qc.invalidateQueries({ queryKey: ["master-all"] });
  };
  const guncelle = useMutation({
    mutationFn: async ({ kod, ad }: { kod: string; ad: string }) =>
      (await api.patch(`/tanim/karton-cinsi/${kod}`, { ad })).data,
    onSuccess: () => { sonra(); toast("ok", "Kaydedildi"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });
  const ekle = useMutation({
    mutationFn: async (ad: string) => (await api.post("/tanim/karton-cinsi", { ad })).data,
    onSuccess: () => { sonra(); toast("ok", "Eklendi"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });
  const sil = useMutation({
    mutationFn: async (kod: string) => (await api.delete(`/tanim/karton-cinsi/${kod}`)).data,
    onSuccess: () => { sonra(); toast("ok", "Kaldırıldı"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });
  const [silOnay, setSilOnay] = useState<Karton | null>(null);
  const [yeni, setYeni] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Karton Malzeme Cinsi</h1>
        <p className="text-sm text-slate-500">Teklifteki "Karton Cinsi" listesini besler.</p>
      </div>
      <div className="card border-l-4 border-blue-400">
        <div className="flex gap-2 items-start text-sm text-slate-700">
          <Info size={16} className="mt-0.5 text-blue-500" />
          <div>Buradaki değişiklikler <b>yeni tekliflerin</b> seçeneklerini etkiler.</div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Malzemeler</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr><th className="text-left px-3 py-2">Malzeme Adı</th><th className="w-40"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.map((m) => (
                <Row key={m.kod} ad={m.ad} kaydet={(ad) => guncelle.mutate({ kod: m.kod, ad })} sil={() => setSilOnay(m)} />
              ))}
              {liste.length === 0 && (
                <tr><td colSpan={2} className="px-3 py-6 text-center text-slate-400">
                  <Layers size={28} className="mx-auto mb-2 opacity-40" /> Henüz malzeme yok
                </td></tr>
              )}
              <tr className="bg-slate-50">
                <td className="px-3 py-2">
                  <input className="input" placeholder="örn: Kuşe Kroma" value={yeni} onChange={(e) => setYeni(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <button className="btn-primary w-full" disabled={!yeni.trim() || ekle.isPending}
                    onClick={() => { ekle.mutate(yeni.trim()); setYeni(""); }}>
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
        title="Malzemeyi kaldır"
        message={`"${silOnay?.ad}" kaldırılsın mı? (Pasife alınır; eski teklifler etkilenmez.)`}
        confirmText="Kaldır" danger
      />
    </div>
  );
}

function Row({ ad, kaydet, sil }: { ad: string; kaydet: (ad: string) => void; sil: () => void }) {
  const [v, setV] = useState(ad);
  useEffect(() => setV(ad), [ad]);
  const degisti = v.trim() !== ad && v.trim() !== "";
  return (
    <tr>
      <td className="px-3 py-2"><input className="input" value={v} onChange={(e) => setV(e.target.value)} /></td>
      <td className="px-3 py-2 flex gap-2">
        <button className={`btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} flex-1`}
          disabled={!degisti} onClick={() => kaydet(v.trim())}>
          <Save size={14} className="mr-1" /> Kaydet
        </button>
        <button onClick={sil} className="text-slate-400 hover:text-rose-600 px-2" title="Kaldır"><Trash2 size={16} /></button>
      </td>
    </tr>
  );
}
