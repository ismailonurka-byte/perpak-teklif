/**
 * Baskı Makineleri tanımı (Tanımlar).
 * Her makine: ad, tip (Dahili/Fason), Baskı Kalıp TL, Geçiş Çarpanı.
 * Bu değerler teklifte makine seçilince otomatik dolar (orada düzenlenebilir).
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Info, Factory } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";

type Makine = {
  kod: string;
  ad: string;
  tip: string; // DAHILI | FASON
  baski_kalip_tl: number;
  gecis_carpan: number;
  aktif: boolean;
};

export default function MakineTanimPage() {
  const toast = useToast((s) => s.push);
  const qc = useQueryClient();

  const { data: liste = [] } = useQuery<Makine[]>({
    queryKey: ["tanim-makine"],
    queryFn: async () => (await api.get("/tanim/baski-makinesi")).data,
  });

  const sonra = () => {
    qc.invalidateQueries({ queryKey: ["tanim-makine"] });
    qc.invalidateQueries({ queryKey: ["master-all"] });
  };

  const guncelle = useMutation({
    mutationFn: async ({ kod, ...rest }: Partial<Makine> & { kod: string }) =>
      (await api.patch(`/tanim/baski-makinesi/${kod}`, rest)).data,
    onSuccess: () => { sonra(); toast("ok", "Kaydedildi"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  const ekle = useMutation({
    mutationFn: async (m: { ad: string; tip: string; baski_kalip_tl: number; gecis_carpan: number }) =>
      (await api.post("/tanim/baski-makinesi", m)).data,
    onSuccess: () => { sonra(); toast("ok", "Makine eklendi"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  const sil = useMutation({
    mutationFn: async (kod: string) => (await api.delete(`/tanim/baski-makinesi/${kod}`)).data,
    onSuccess: () => { sonra(); toast("ok", "Makine kaldırıldı"); },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  const [silOnay, setSilOnay] = useState<Makine | null>(null);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniTip, setYeniTip] = useState("DAHILI");
  const [yeniKalip, setYeniKalip] = useState("");
  const [yeniCarpan, setYeniCarpan] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Baskı Makineleri</h1>
        <p className="text-sm text-slate-500">
          Ofset baskı makineleri. Teklifte makine seçilince <b>Baskı Kalıp TL</b> ve <b>Geçiş Çarpanı</b> buradan
          otomatik gelir (teklifte yine değiştirilebilir). <b>Dahili/Fason</b> sadece bilgi amaçlıdır.
        </p>
      </div>

      <div className="card border-l-4 border-blue-400">
        <div className="flex gap-2 items-start text-sm text-slate-700">
          <Info size={16} className="mt-0.5 text-blue-500" />
          <div>Buradaki değişiklikler <b>yeni teklifleri</b> etkiler; eski teklifler kendi snapshot'ında kalır.</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Makineler</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left px-3 py-2">Makine Adı</th>
                <th className="text-left px-3 py-2">Tip</th>
                <th className="text-left px-3 py-2">Baskı Kalıp TL</th>
                <th className="text-left px-3 py-2">Geçiş Çarpanı</th>
                <th className="w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.map((m) => (
                <MakineRow
                  key={m.kod}
                  baslangic={m}
                  kaydet={(d) => guncelle.mutate({ kod: m.kod, ...d })}
                  sil={() => setSilOnay(m)}
                />
              ))}
              {liste.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  <Factory size={28} className="mx-auto mb-2 opacity-40" /> Henüz makine yok
                </td></tr>
              )}
              {/* Yeni makine ekle */}
              <tr className="bg-slate-50">
                <td className="px-3 py-2">
                  <input className="input" placeholder="örn: Heidelberg SM 102" value={yeniAd}
                    onChange={(e) => setYeniAd(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <select className="input" value={yeniTip} onChange={(e) => setYeniTip(e.target.value)}>
                    <option value="DAHILI">Dahili</option>
                    <option value="FASON">Fason</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input className="input" type="number" step="any" placeholder="örn: 1450" value={yeniKalip}
                    onChange={(e) => setYeniKalip(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input className="input" type="number" step="0.001" placeholder="örn: 0,40" value={yeniCarpan}
                    onChange={(e) => setYeniCarpan(e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <button className="btn-primary w-full" disabled={!yeniAd.trim() || ekle.isPending}
                    onClick={() => {
                      ekle.mutate({
                        ad: yeniAd.trim(), tip: yeniTip,
                        baski_kalip_tl: Number(yeniKalip || 0), gecis_carpan: Number(yeniCarpan || 0),
                      });
                      setYeniAd(""); setYeniTip("DAHILI"); setYeniKalip(""); setYeniCarpan("");
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
        title="Makineyi kaldır"
        message={`"${silOnay?.ad}" makinesini kaldırmak istediğinize emin misiniz? (Pasife alınır; eski teklifler etkilenmez.)`}
        confirmText="Kaldır"
        danger
      />
    </div>
  );
}

function MakineRow({
  baslangic, kaydet, sil,
}: {
  baslangic: Makine;
  kaydet: (d: { ad: string; tip: string; baski_kalip_tl: number; gecis_carpan: number }) => void;
  sil: () => void;
}) {
  const [ad, setAd] = useState(baslangic.ad);
  const [tip, setTip] = useState(baslangic.tip);
  const [kalip, setKalip] = useState(String(baslangic.baski_kalip_tl));
  const [carpan, setCarpan] = useState(String(baslangic.gecis_carpan));
  useEffect(() => {
    setAd(baslangic.ad); setTip(baslangic.tip);
    setKalip(String(baslangic.baski_kalip_tl)); setCarpan(String(baslangic.gecis_carpan));
  }, [baslangic]);

  const degisti =
    ad !== baslangic.ad || tip !== baslangic.tip ||
    Number(kalip) !== Number(baslangic.baski_kalip_tl) ||
    Number(carpan) !== Number(baslangic.gecis_carpan);

  return (
    <tr>
      <td className="px-3 py-2">
        <input className="input" value={ad} onChange={(e) => setAd(e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <select className="input" value={tip} onChange={(e) => setTip(e.target.value)}>
          <option value="DAHILI">Dahili</option>
          <option value="FASON">Fason</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <input className="input" type="number" step="any" value={kalip} onChange={(e) => setKalip(e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <input className="input" type="number" step="0.001" value={carpan} onChange={(e) => setCarpan(e.target.value)} />
      </td>
      <td className="px-3 py-2 flex gap-2">
        <button
          className={`btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} flex-1`}
          disabled={!degisti}
          onClick={() => kaydet({ ad, tip, baski_kalip_tl: Number(kalip || 0), gecis_carpan: Number(carpan || 0) })}
        >
          <Save size={14} className="mr-1" /> Kaydet
        </button>
        <button onClick={sil} className="text-slate-400 hover:text-rose-600 px-2" title="Kaldır">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
