/**
 * Birim Fiyat Yönetimi — Excel'deki "HESAPLAMA VERİ DOSYASI" karşılığı.
 * 3 bölüm: Genel fiyatlar, OFSET baskı (gramaja göre), Geçiş çarpanı (renge göre).
 *
 * Buradaki değerler değişince yeni teklifler bu fiyatlarla hesaplar.
 * Eski teklifler kendi snapshot'ında kalır.
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Info } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Confirm from "@/components/ui/Confirm";

type Genel = {
  lak_tl_m2: number;
  sivama_tl_m2: number;
  kesim_tl: number;
  yapistirma_tl_ad: number;
  flekso_baski_kesim_tl: number;
  flekso_kesim_tl: number;
  flekso_yapistirma_tl_ad: number;
  koli_dikis_birim_tl: number;
};

const GENEL_ETIKET: Record<keyof Genel, { ad: string; aciklama: string }> = {
  lak_tl_m2: { ad: "Lak", aciklama: "TL / m² — ofset kutu üzerine sürülen lak" },
  sivama_tl_m2: { ad: "Sıvama", aciklama: "TL / m² — kuşe kağıt yapıştırma" },
  kesim_tl: { ad: "Kesim", aciklama: "Tabaka başı kesim ücreti (TL)" },
  yapistirma_tl_ad: { ad: "Yapıştırma (Ofset)", aciklama: "TL / adet — ofset kutu yapıştırma" },
  flekso_baski_kesim_tl: { ad: "Flekso Baskı+Kesim", aciklama: "TL — flekso birim baskı + kesim paketi" },
  flekso_kesim_tl: { ad: "Flekso Kesim", aciklama: "TL — flekso ayrı kesim" },
  flekso_yapistirma_tl_ad: { ad: "Flekso Yapıştırma", aciklama: "TL / adet — flekso kutu yapıştırma" },
  koli_dikis_birim_tl: { ad: "Koli Dikiş", aciklama: "TL / dikiş — oluklu koli için (her dikiş başına)" },
};

export default function FiyatYonetimiPage() {
  const toast = useToast((s) => s.push);
  const qc = useQueryClient();

  // ─── GENEL ──────────────────────────────────────────────────────
  const { data: genel } = useQuery<Genel>({
    queryKey: ["fiyat-genel"],
    queryFn: async () => (await api.get("/fiyat/genel")).data,
  });

  const [genelDraft, setGenelDraft] = useState<Partial<Genel>>({});
  useEffect(() => { if (genel) setGenelDraft(genel); }, [genel]);

  const genelKaydet = useMutation({
    mutationFn: async (data: Partial<Genel>) =>
      (await api.patch("/fiyat/genel", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiyat-genel"] });
      qc.invalidateQueries({ queryKey: ["master-all"] });
      toast("ok", "Genel fiyatlar güncellendi");
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  // ─── OFSET BASKI (gramaj → TL) ──────────────────────────────────
  const { data: ofset = [] } = useQuery<{ gramaj: number; baski_tl: number }[]>({
    queryKey: ["fiyat-ofset"],
    queryFn: async () => (await api.get("/fiyat/ofset")).data,
  });
  const [yeniGramaj, setYeniGramaj] = useState("");
  const [yeniGramajTL, setYeniGramajTL] = useState("");
  const [silOnayOfset, setSilOnayOfset] = useState<number | null>(null);

  const ofsetKaydet = useMutation({
    mutationFn: async ({ gramaj, baski_tl }: { gramaj: number; baski_tl: number }) =>
      (await api.put(`/fiyat/ofset/${gramaj}`, null, { params: { baski_tl } })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiyat-ofset"] });
      toast("ok", "Kaydedildi");
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  const ofsetSil = useMutation({
    mutationFn: async (gramaj: number) =>
      (await api.delete(`/fiyat/ofset/${gramaj}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiyat-ofset"] });
      toast("ok", "Silindi");
    },
  });

  // ─── ÇARPAN (renk → çarpan) ─────────────────────────────────────
  const { data: carpan = [] } = useQuery<{ renk_sayisi: number; carpan: number }[]>({
    queryKey: ["fiyat-carpan"],
    queryFn: async () => (await api.get("/fiyat/carpan")).data,
  });

  const carpanKaydet = useMutation({
    mutationFn: async ({ renk_sayisi, carpan: c }: { renk_sayisi: number; carpan: number }) =>
      (await api.put(`/fiyat/carpan/${renk_sayisi}`, null, { params: { carpan: c } })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiyat-carpan"] });
      toast("ok", "Kaydedildi");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Birim Fiyat Yönetimi</h1>
        <p className="text-sm text-slate-500">
          Excel'deki "HESAPLAMA VERİ DOSYASI" karşılığı. Buradaki değişiklikler **yeni teklifler**'i etkiler;
          eski teklifler kendi hesap snapshot'ında kalır.
        </p>
      </div>

      <div className="card border-l-4 border-blue-400">
        <div className="flex gap-2 items-start text-sm text-slate-700">
          <Info size={16} className="mt-0.5 text-blue-500" />
          <div>
            Kağıt zammı / işçilik değişimi geldiğinde **bu sayfadan** fiyatları güncelleyin. Sistem otomatik
            tüm yeni hesaplamalarda yeni değerleri kullanacaktır.
          </div>
        </div>
      </div>

      {/* GENEL FİYATLAR */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Genel Birim Fiyatlar</h2>
        {!genel ? (
          <div className="text-slate-400">Yükleniyor...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(GENEL_ETIKET) as (keyof Genel)[]).map((k) => (
                <div key={k}>
                  <label className="label">{GENEL_ETIKET[k].ad}</label>
                  <input
                    className="input"
                    type="number"
                    step="0.001"
                    value={genelDraft[k] ?? ""}
                    onChange={(e) =>
                      setGenelDraft((p) => ({ ...p, [k]: Number(e.target.value) }))
                    }
                  />
                  <div className="text-xs text-slate-400 mt-1">{GENEL_ETIKET[k].aciklama}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="btn-primary"
                onClick={() => genelKaydet.mutate(genelDraft)}
                disabled={genelKaydet.isPending}
              >
                <Save size={16} className="mr-1" />
                {genelKaydet.isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* OFSET BASKI TL — GRAMAJ TABLOSU */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Ofset Baskı TL — Gramaj Bazında</h2>
        <p className="text-sm text-slate-500 mb-4">
          Her gramaj için baskı kalıp + sabit maliyet. (Excel: HESAPLAMA VERİ DOSYASI B sütunu)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left px-3 py-2">Gramaj (g/m²)</th>
                <th className="text-left px-3 py-2">Baskı TL</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ofset.map((r) => (
                <OfsetRow
                  key={r.gramaj}
                  baslangic={r}
                  kaydet={(tl) => ofsetKaydet.mutate({ gramaj: r.gramaj, baski_tl: tl })}
                  sil={() => setSilOnayOfset(r.gramaj)}
                />
              ))}
              <tr className="bg-slate-50">
                <td className="px-3 py-2">
                  <input
                    className="input"
                    type="number"
                    placeholder="örn: 500"
                    value={yeniGramaj}
                    onChange={(e) => setYeniGramaj(e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="input"
                    type="number"
                    step="any"
                    placeholder="örn: 2750"
                    value={yeniGramajTL}
                    onChange={(e) => setYeniGramajTL(e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    className="btn-primary w-full"
                    disabled={!yeniGramaj || !yeniGramajTL}
                    onClick={() => {
                      ofsetKaydet.mutate({
                        gramaj: Number(yeniGramaj),
                        baski_tl: Number(yeniGramajTL),
                      });
                      setYeniGramaj("");
                      setYeniGramajTL("");
                    }}
                  >
                    <Plus size={14} className="mr-1" /> Ekle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GEÇİŞ ÇARPANI — RENK TABLOSU */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Geçiş Çarpanı — Renk Sayısı Bazında</h2>
        <p className="text-sm text-slate-500 mb-4">
          3000 baskı adedinin üstünde her ek geçiş için kullanılır.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left px-3 py-2">Renk Sayısı</th>
                <th className="text-left px-3 py-2">Çarpan</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carpan.map((r) => (
                <CarpanRow
                  key={r.renk_sayisi}
                  baslangic={r}
                  kaydet={(c) => carpanKaydet.mutate({ renk_sayisi: r.renk_sayisi, carpan: c })}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Confirm
        open={silOnayOfset !== null}
        onClose={() => setSilOnayOfset(null)}
        onConfirm={() => silOnayOfset !== null && ofsetSil.mutate(silOnayOfset)}
        message={`${silOnayOfset} g/m² satırını silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        danger
      />
    </div>
  );
}

function OfsetRow({
  baslangic, kaydet, sil,
}: {
  baslangic: { gramaj: number; baski_tl: number };
  kaydet: (tl: number) => void;
  sil: () => void;
}) {
  const [val, setVal] = useState(String(baslangic.baski_tl));
  useEffect(() => setVal(String(baslangic.baski_tl)), [baslangic.baski_tl]);
  const degisti = Number(val) !== Number(baslangic.baski_tl);
  return (
    <tr>
      <td className="px-3 py-2 font-medium">{baslangic.gramaj}</td>
      <td className="px-3 py-2">
        <input
          className="input"
          type="number"
          step="any"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </td>
      <td className="px-3 py-2 flex gap-2">
        <button
          className={`btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} flex-1`}
          disabled={!degisti}
          onClick={() => kaydet(Number(val))}
        >
          <Save size={14} className="mr-1" /> Kaydet
        </button>
        <button onClick={sil} className="text-slate-400 hover:text-rose-600 px-2">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

function CarpanRow({
  baslangic, kaydet,
}: {
  baslangic: { renk_sayisi: number; carpan: number };
  kaydet: (c: number) => void;
}) {
  const [val, setVal] = useState(String(baslangic.carpan));
  useEffect(() => setVal(String(baslangic.carpan)), [baslangic.carpan]);
  const degisti = Number(val) !== Number(baslangic.carpan);
  return (
    <tr>
      <td className="px-3 py-2 font-medium">{baslangic.renk_sayisi} renk</td>
      <td className="px-3 py-2">
        <input
          className="input"
          type="number"
          step="0.001"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </td>
      <td className="px-3 py-2">
        <button
          className={`btn ${degisti ? "btn-primary" : "btn-ghost border border-slate-200"} w-full`}
          disabled={!degisti}
          onClick={() => kaydet(Number(val))}
        >
          <Save size={14} className="mr-1" /> Kaydet
        </button>
      </td>
    </tr>
  );
}
