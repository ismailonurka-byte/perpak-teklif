import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Edit, FileDown, Send, Save, ArrowLeft, Building2,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";
import Badge from "@/components/ui/Badge";
import type { Firma, Teklif, TeklifKalem, TeklifDurum } from "@/types";
import { DURUM_ETIKET, DURUM_RENGI } from "@/types";
import { tl, formatDate } from "@/lib/format";
import KalemDrawer from "./KalemDrawer";
import DurumGecmisi from "./DurumGecmisi";

export default function TeklifEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const kullanici = useAuth((s) => s.kullanici);
  const toast = useToast((s) => s.push);

  // Form state
  const [firmaId, setFirmaId] = useState<string>("");
  const [yetkili, setYetkili] = useState("");
  const [tarih, setTarih] = useState(new Date().toISOString().slice(0, 10));
  const [gecerlilik, setGecerlilik] = useState("");
  const [vadeMetni, setVadeMetni] = useState("30 gün");
  const [sevkYeri, setSevkYeri] = useState("");
  const [notlar, setNotlar] = useState("İstanbul Avrupa Yakası nakliye firmamıza aittir. Sipariş ±%10 sapma ile imal edilebilir.");
  const [kdvOrani, setKdvOrani] = useState(0.2);
  const [durum, setDurum] = useState<TeklifDurum>("TASLAK");
  const [kalemler, setKalemler] = useState<TeklifKalem[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingKalem, setEditingKalem] = useState<TeklifKalem | undefined>();
  const [silOnay, setSilOnay] = useState<number | null>(null);

  // Veri yükleme
  const { data: teklif } = useQuery<Teklif>({
    queryKey: ["teklif", id],
    queryFn: async () => (await api.get(`/teklif/${id}`)).data,
    enabled: !isNew,
  });

  useEffect(() => {
    if (teklif) {
      setFirmaId(teklif.firma_id);
      setYetkili(teklif.yetkili ?? "");
      setTarih(teklif.tarih);
      setGecerlilik(teklif.gecerlilik ?? "");
      setVadeMetni(teklif.vade_metni ?? "");
      setSevkYeri(teklif.sevk_yeri ?? "");
      setNotlar(teklif.notlar ?? "");
      setKdvOrani(Number(teklif.kdv_orani));
      setDurum(teklif.durum);
      // Decimal alanları API'den string gelir → sayıya çevir
      setKalemler(
        teklif.kalemler.map((k) => ({
          ...k,
          adet: Number(k.adet),
          birim_fiyat: Number(k.birim_fiyat),
          toplam: k.toplam !== null && k.toplam !== undefined ? Number(k.toplam) : undefined,
        }))
      );
    }
  }, [teklif]);

  // Firma seçici
  const { data: firmalar = [] } = useQuery<Firma[]>({
    queryKey: ["firma-tum"],
    queryFn: async () => (await api.get("/firma")).data,
  });

  const araToplam = useMemo(
    () => kalemler.reduce((s, k) => s + (k.toplam ?? k.adet * k.birim_fiyat), 0),
    [kalemler]
  );
  const kdvTutari = useMemo(() => Number((araToplam * kdvOrani).toFixed(2)), [araToplam, kdvOrani]);
  const genelToplam = useMemo(() => Number((araToplam + kdvTutari).toFixed(2)), [araToplam, kdvTutari]);

  const kaydet = useMutation({
    mutationFn: async (yeniDurum?: TeklifDurum) => {
      const payload: any = {
        firma_id: firmaId,
        yetkili,
        tarih,
        gecerlilik: gecerlilik || null,
        vade_metni: vadeMetni,
        sevk_yeri: sevkYeri,
        notlar,
        kdv_orani: kdvOrani,
        durum: yeniDurum ?? durum,
        kalemler: kalemler.map((k) => ({
          sira_no: k.sira_no,
          kalem_tipi: k.kalem_tipi,
          urun_ismi: k.urun_ismi,
          adet: k.adet,
          birim_fiyat: k.birim_fiyat,
          toplam: k.toplam,
          termin: k.termin,
          spesifikasyon: k.spesifikasyon,
          hesap_detayi: k.hesap_detayi,
          notlar: k.notlar,
        })),
      };
      if (isNew) {
        return (await api.post("/teklif", payload)).data;
      }
      return (await api.patch(`/teklif/${id}`, payload)).data;
    },
    onSuccess: (data: Teklif) => {
      toast("ok", isNew ? "Teklif oluşturuldu" : "Teklif kaydedildi");
      qc.invalidateQueries({ queryKey: ["teklif-liste"] });
      qc.invalidateQueries({ queryKey: ["teklif-durum-log"] });
      if (isNew) navigate(`/teklifler/${data.id}`, { replace: true });
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Kayıt hatası"),
  });

  const sil = useMutation({
    mutationFn: async () => (await api.delete(`/teklif/${id}`)).data,
    onSuccess: () => {
      toast("ok", "Teklif silindi");
      qc.invalidateQueries({ queryKey: ["teklif-liste"] });
      navigate("/teklifler");
    },
  });

  const pdfIndir = async () => {
    try {
      const res = await api.get(`/teklif/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${teklif?.teklif_no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast("err", "PDF üretilemedi");
    }
  };

  const ekleKalem = (k: TeklifKalem) => {
    setKalemler((p) => {
      if (editingKalem) {
        return p.map((x) => (x.sira_no === editingKalem.sira_no ? k : x));
      }
      return [...p, k];
    });
    setDrawerOpen(false);
    setEditingKalem(undefined);
  };

  const silKalem = (sira: number) => {
    setKalemler((p) =>
      p.filter((k) => k.sira_no !== sira).map((k, i) => ({ ...k, sira_no: i + 1 }))
    );
    setSilOnay(null);
  };

  const yeniSiraNo = (kalemler.at(-1)?.sira_no ?? 0) + 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/teklifler")} className="btn-ghost p-2">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {isNew ? "Yeni Teklif" : teklif?.teklif_no}
            </h1>
            {!isNew && (
              <Badge className={DURUM_RENGI[durum]}>{DURUM_ETIKET[durum]}</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && (
            <button onClick={pdfIndir} className="btn-secondary">
              <FileDown size={16} /> PDF
            </button>
          )}
          <button
            onClick={() => kaydet.mutate(undefined)}
            disabled={kaydet.isPending || !firmaId || kalemler.length === 0}
            className="btn-primary"
          >
            <Save size={16} className="mr-1" /> {isNew ? "Kaydet" : "Güncelle"}
          </button>
          {!isNew && durum === "TASLAK" && (
            <button
              onClick={() => kaydet.mutate("TEKLIF_VERILDI")}
              className="btn text-white bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)]"
              disabled={kaydet.isPending}
            >
              <Send size={16} /> Teklif Ver
            </button>
          )}
          {!isNew && durum === "KABUL" && (
            <button
              onClick={() => kaydet.mutate("SIPARIS")}
              className="btn text-white bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-[0_8px_20px_-8px_rgba(139,92,246,0.5)]"
              disabled={kaydet.isPending}
            >
              Siparişe Dönüştür →
            </button>
          )}
          {!isNew && (
            <select
              className="input w-auto"
              value={durum}
              onChange={(e) => {
                const nd = e.target.value as TeklifDurum;
                setDurum(nd);
                kaydet.mutate(nd);
              }}
            >
              <option value="TASLAK">Taslak</option>
              <option value="TEKLIF_VERILDI">Teklif Verildi</option>
              <option value="BEKLEMEDE">Beklemede</option>
              <option value="KABUL">Kabul</option>
              <option value="SIPARIS">Sipariş</option>
              <option value="RED">Red</option>
              <option value="IPTAL">İptal</option>
            </select>
          )}
        </div>
      </div>

      {/* Üst başlık kartı */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="label">Müşteri *</label>
            <select className="input" value={firmaId} onChange={(e) => setFirmaId(e.target.value)}>
              <option value="">— Seçin —</option>
              {firmalar.map((f) => (
                <option key={f.id} value={f.id}>{f.ad}</option>
              ))}
            </select>
            {firmalar.length === 0 && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Building2 size={12} /> Önce müşteri eklemelisiniz
              </div>
            )}
          </div>
          <div>
            <label className="label">Yetkili</label>
            <input className="input" value={yetkili} onChange={(e) => setYetkili(e.target.value)} />
          </div>
          <div>
            <label className="label">Satış Temsilcisi</label>
            <div className="input bg-slate-50 text-slate-600">
              {teklif?.olusturan.ad_soyad ?? kullanici?.ad_soyad ?? "—"}
            </div>
          </div>
          <div>
            <label className="label">Tarih</label>
            <input className="input" type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
          </div>
          <div>
            <label className="label">Geçerlilik</label>
            <input className="input" type="date" value={gecerlilik} onChange={(e) => setGecerlilik(e.target.value)} />
          </div>
          <div>
            <label className="label">Vade</label>
            <input className="input" value={vadeMetni} onChange={(e) => setVadeMetni(e.target.value)} placeholder="örn: 30 gün" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label">Sevk Yeri</label>
            <input className="input" value={sevkYeri} onChange={(e) => setSevkYeri(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Kalemler tablosu */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Satırlar ({kalemler.length})</h2>
          <button
            onClick={() => { setEditingKalem(undefined); setDrawerOpen(true); }}
            className="btn-primary"
          >
            <Plus size={16} className="mr-1" /> Satır Ekle
          </button>
        </div>

        {kalemler.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Henüz satır yok. "Satır Ekle" ile başlayın.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3 w-10">#</th>
                    <th className="text-left px-4 py-3">Tip</th>
                    <th className="text-left px-4 py-3">Ürün</th>
                    <th className="text-right px-4 py-3">Adet</th>
                    <th className="text-right px-4 py-3">Birim Fiyat</th>
                    <th className="text-right px-4 py-3">Toplam</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kalemler.map((k) => (
                    <tr key={k.sira_no} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400">{k.sira_no}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-slate-100 text-slate-700">{k.kalem_tipi}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{k.urun_ismi}</td>
                      <td className="px-4 py-3 text-right">{k.adet.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-right">{tl.format(k.birim_fiyat)}</td>
                      <td className="px-4 py-3 text-right font-medium">{tl.format(k.toplam ?? k.adet * k.birim_fiyat)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingKalem(k); setDrawerOpen(true); }} className="text-slate-400 hover:text-brand-700">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setSilOnay(k.sira_no)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {kalemler.map((k) => (
                <div key={k.sira_no} className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">#{k.sira_no}</span>
                        <Badge className="bg-slate-100 text-slate-700">{k.kalem_tipi}</Badge>
                      </div>
                      <div className="font-medium mt-1">{k.urun_ismi}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {k.adet.toLocaleString("tr-TR")} × {tl.format(k.birim_fiyat)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{tl.format(k.toplam ?? k.adet * k.birim_fiyat)}</div>
                      <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => { setEditingKalem(k); setDrawerOpen(true); }}>
                          <Edit size={16} className="text-slate-400" />
                        </button>
                        <button onClick={() => setSilOnay(k.sira_no)}>
                          <Trash2 size={16} className="text-rose-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toplamlar */}
      <div className="max-w-md ml-auto mb-4 rounded-2xl overflow-hidden shadow-card ring-1 ring-slate-200/70">
        <div className="bg-white p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Ara Toplam</span>
            <span className="font-semibold text-slate-800">{tl.format(araToplam)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">KDV (%{Math.round(kdvOrani * 100)})</span>
            <span className="font-semibold text-slate-800">{tl.format(kdvTutari)}</span>
          </div>
        </div>
        <div className="bg-brand-grad text-white px-5 py-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-brand-100/80">Genel Toplam</span>
          <span className="text-xl font-bold font-display">{tl.format(genelToplam)}</span>
        </div>
      </div>

      <div className="card">
        <label className="label">Notlar</label>
        <textarea
          className="input min-h-[80px]"
          value={notlar}
          onChange={(e) => setNotlar(e.target.value)}
        />
      </div>

      {!isNew && id && (
        <div className="mt-4">
          <DurumGecmisi teklifId={id} />
        </div>
      )}

      {!isNew && teklif && (
        <div className="text-xs text-slate-400 mt-4 flex flex-wrap gap-x-4 gap-y-1">
          <span>Oluşturma: {formatDate(teklif.olusturma_ts)}</span>
          <span>Son güncelleme: {formatDate(teklif.guncelleme_ts)}</span>
          <span>Oluşturan: {teklif.olusturan.ad_soyad}</span>
        </div>
      )}

      <KalemDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingKalem(undefined); }}
        onSave={ekleKalem}
        initial={editingKalem}
        siraNo={yeniSiraNo}
      />

      <Confirm
        open={silOnay !== null}
        onClose={() => setSilOnay(null)}
        onConfirm={() => silOnay !== null && silKalem(silOnay)}
        message="Bu satırı silmek istediğinize emin misiniz?"
        confirmText="Sil"
        danger
      />
    </div>
  );
}
