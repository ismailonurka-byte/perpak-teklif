import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, ShieldCheck, Trash2, Pencil, Lock } from "lucide-react";

import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { IzinKatalog, RolT } from "@/types";

export default function RollerPage() {
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const [yeniAcik, setYeniAcik] = useState(false);
  const [izinDuzenle, setIzinDuzenle] = useState<RolT | null>(null);

  const { data: roller = [], isLoading } = useQuery<RolT[]>({
    queryKey: ["roller"],
    queryFn: async () => (await api.get("/rol")).data,
  });
  const { data: katalog = [] } = useQuery<IzinKatalog[]>({
    queryKey: ["izin-katalog"],
    queryFn: async () => (await api.get("/rol/izinler")).data,
  });

  const sil = useMutation({
    mutationFn: async (id: string) => api.delete(`/rol/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roller"] });
      toast("ok", "Rol silindi");
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Silinemedi"),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="page-title">Roller & Yetkiler</h1>
          <p className="text-sm text-slate-500">{roller.length} rol · {katalog.length} izin tanımı</p>
        </div>
        <button className="btn-primary" onClick={() => setYeniAcik(true)}>
          <Plus size={16} className="mr-1" /> Yeni Rol
        </button>
      </div>

      {isLoading ? (
        <div className="card text-center text-slate-400 py-10">Yükleniyor...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {roller.map((r) => (
            <div key={r.id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`grid place-items-center h-9 w-9 rounded-xl ${r.sistem_rol ? "bg-accent-100 text-accent-600" : "bg-brand-100 text-brand-700"}`}>
                    {r.sistem_rol ? <ShieldCheck size={18} /> : <Shield size={18} />}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">{r.ad}</div>
                    {r.sistem_rol && <Badge className="bg-accent-100 text-accent-700 mt-0.5">Sistem rolü</Badge>}
                  </div>
                </div>
                {!r.sistem_rol && (
                  <button
                    onClick={() => { if (confirm(`"${r.ad}" rolü silinsin mi?`)) sil.mutate(r.id); }}
                    className="text-slate-300 hover:text-rose-600"
                    title="Rolü sil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {r.aciklama && <p className="text-sm text-slate-500">{r.aciklama}</p>}
              <div className="text-xs text-slate-400">
                {r.sistem_rol ? "Tüm izinler (değiştirilemez)" : `${r.izinler.length} izin atanmış`}
              </div>
              <button
                className="btn-secondary btn-sm mt-auto self-start"
                disabled={r.sistem_rol}
                onClick={() => setIzinDuzenle(r)}
              >
                {r.sistem_rol ? <><Lock size={13} /> Tam yetkili</> : <><Pencil size={13} /> İzinleri Düzenle</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {yeniAcik && <YeniRolModal onClose={() => setYeniAcik(false)} />}
      {izinDuzenle && (
        <IzinDuzenleModal rol={izinDuzenle} katalog={katalog} onClose={() => setIzinDuzenle(null)} />
      )}
    </div>
  );
}

function YeniRolModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");

  const olustur = useMutation({
    mutationFn: async () => (await api.post("/rol", { ad, aciklama: aciklama || null })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roller"] });
      toast("ok", "Rol oluşturuldu");
      onClose();
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Oluşturulamadı"),
  });

  return (
    <Modal open onClose={onClose} title="Yeni Rol" size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn-primary" disabled={!ad.trim() || olustur.isPending} onClick={() => olustur.mutate()}>
            {olustur.isPending ? "Kaydediliyor..." : "Oluştur"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Rol Adı *</label>
          <input className="input" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="örn: Planlama, Depo, Üretim Şefi" autoFocus />
        </div>
        <div>
          <label className="label">Açıklama</label>
          <textarea className="input min-h-[60px]" value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Bu rol ne yapar?" />
        </div>
        <p className="text-xs text-slate-400">Rolü oluşturduktan sonra "İzinleri Düzenle" ile yetkilerini seçin.</p>
      </div>
    </Modal>
  );
}

type Secim = { checked: boolean; kapsam: string | null };

function IzinDuzenleModal({ rol, katalog, onClose }: { rol: RolT; katalog: IzinKatalog[]; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);

  const [secim, setSecim] = useState<Record<string, Secim>>(() => {
    const m: Record<string, Secim> = {};
    for (const ri of rol.izinler) m[ri.izin_kod] = { checked: true, kapsam: ri.kapsam ?? null };
    return m;
  });

  // Modül → Ekran gruplaması
  const gruplu = useMemo(() => {
    const moduller: Record<string, Record<string, IzinKatalog[]>> = {};
    for (const i of [...katalog].sort((a, b) => a.sira - b.sira)) {
      (moduller[i.modul] ??= {});
      (moduller[i.modul][i.ekran] ??= []).push(i);
    }
    return moduller;
  }, [katalog]);

  const toggle = (kod: string, kapsam_destekler: boolean) =>
    setSecim((p) => {
      const cur = p[kod];
      if (cur?.checked) { const n = { ...p }; delete n[kod]; return n; }
      return { ...p, [kod]: { checked: true, kapsam: kapsam_destekler ? "own" : null } };
    });

  const setKapsam = (kod: string, kapsam: string) =>
    setSecim((p) => ({ ...p, [kod]: { checked: true, kapsam } }));

  const kaydet = useMutation({
    mutationFn: async () => {
      const izinler = Object.entries(secim).map(([izin_kod, v]) => ({ izin_kod, kapsam: v.kapsam }));
      return api.put(`/rol/${rol.id}/izinler`, izinler);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roller"] });
      toast("ok", "İzinler güncellendi");
      onClose();
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Kaydedilemedi"),
  });

  return (
    <Modal open onClose={onClose} title={`İzinler — ${rol.ad}`} size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">{Object.keys(secim).length} izin seçili</span>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose}>İptal</button>
            <button className="btn-primary" disabled={kaydet.isPending} onClick={() => kaydet.mutate()}>
              {kaydet.isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
        {Object.entries(gruplu).map(([modul, ekranlar]) => (
          <div key={modul}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-2">{modul}</div>
            <div className="space-y-3">
              {Object.entries(ekranlar).map(([ekran, izinler]) => (
                <div key={ekran} className="rounded-xl ring-1 ring-slate-200/70 p-3">
                  <div className="text-sm font-semibold text-slate-700 mb-2">{ekran}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {izinler.map((iz) => {
                      const sec = secim[iz.kod];
                      return (
                        <div key={iz.kod} className="flex items-start gap-2 rounded-lg p-2 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={Boolean(sec?.checked)}
                            onChange={() => toggle(iz.kod, iz.kapsam_destekler)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-800">{iz.gorunen_ad}</div>
                            {iz.aciklama && <div className="text-xs text-slate-400">{iz.aciklama}</div>}
                            <div className="text-[10px] font-mono text-slate-300 mt-0.5">{iz.kod}</div>
                            {sec?.checked && iz.kapsam_destekler && (
                              <select
                                className="input btn-sm mt-1.5 py-1 text-xs w-auto"
                                value={sec.kapsam ?? "own"}
                                onChange={(e) => setKapsam(iz.kod, e.target.value)}
                              >
                                <option value="own">Kapsam: Kendi kayıtları</option>
                                <option value="all">Kapsam: Tüm kayıtlar</option>
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
