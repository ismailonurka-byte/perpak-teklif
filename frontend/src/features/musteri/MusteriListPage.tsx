import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Building2, Trash2, Power } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useIzin } from "@/hooks/useAuth";
import Modal from "@/components/ui/Modal";
import Confirm from "@/components/ui/Confirm";
import type { Firma } from "@/types";
import { formatDate } from "@/lib/format";

export default function MusteriListPage() {
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const canEdit = useIzin("firma.update");
  const [q, setQ] = useState("");
  const [pasifGoster, setPasifGoster] = useState(false);
  const [editing, setEditing] = useState<Firma | "new" | null>(null);
  const [silOnay, setSilOnay] = useState<Firma | null>(null);

  const { data: liste = [], isLoading } = useQuery<Firma[]>({
    queryKey: ["firma-liste", q, pasifGoster],
    queryFn: async () =>
      (await api.get("/firma", { params: { ...(q ? { q } : {}), aktif_mi: !pasifGoster } })).data,
  });

  const kaydet = useMutation({
    mutationFn: async (f: Partial<Firma>) => {
      if (f.id) return (await api.patch(`/firma/${f.id}`, f)).data;
      return (await api.post("/firma", f)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["firma-liste"] });
      toast("ok", "Müşteri kaydedildi");
      setEditing(null);
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  const aktiflikDegistir = useMutation({
    mutationFn: async (f: Firma) => (await api.patch(`/firma/${f.id}`, { aktif: !f.aktif })).data,
    onSuccess: (_d, f) => {
      qc.invalidateQueries({ queryKey: ["firma-liste"] });
      toast("ok", f.aktif ? "Müşteri pasife alındı" : "Müşteri aktifleştirildi");
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  const sil = useMutation({
    mutationFn: async (f: Firma) => (await api.delete(`/firma/${f.id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["firma-liste"] });
      toast("ok", "Müşteri silindi");
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Silinemedi"),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Müşteriler</h1>
          <p className="text-sm text-slate-500">{liste.length} kayıt</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 px-1 select-none">
            <input
              type="checkbox"
              checked={pasifGoster}
              onChange={(e) => setPasifGoster(e.target.checked)}
            />
            Pasifleri göster
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 w-full sm:w-64"
              placeholder="Müşteri ara..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button className="btn-primary whitespace-nowrap" onClick={() => setEditing("new")}>
            <Plus size={16} className="mr-1" /> Yeni
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Yükleniyor...</div>
        ) : liste.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Building2 size={32} className="mx-auto mb-2 opacity-40" />
            Henüz müşteri yok
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Müşteri</th>
                    <th className="text-left px-4 py-3">Yetkili</th>
                    <th className="text-left px-4 py-3">Telefon</th>
                    <th className="text-left px-4 py-3">E-posta</th>
                    <th className="text-left px-4 py-3">Eklendi</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liste.map((f) => (
                    <tr key={f.id} className={`hover:bg-slate-50 ${!f.aktif ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 font-medium">
                        {f.ad}
                        {!f.aktif && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{f.yetkili ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{f.telefon ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{f.email ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(f.olusturma_ts)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditing(f)}
                            className="p-1.5 text-slate-400 hover:text-brand-700"
                            title="Düzenle"
                          >
                            <Edit size={16} />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => aktiflikDegistir.mutate(f)}
                                className={`p-1.5 ${f.aktif ? "text-slate-400 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-700"}`}
                                title={f.aktif ? "Pasife al" : "Aktifleştir"}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => setSilOnay(f)}
                                className="p-1.5 text-slate-400 hover:text-rose-600"
                                title="Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-slate-100">
              {liste.map((f) => (
                <div key={f.id} className={`p-4 ${!f.aktif ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1" onClick={() => setEditing(f)}>
                      <div className="font-medium">
                        {f.ad}
                        {!f.aktif && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Pasif
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {f.yetkili ?? "—"} · {f.telefon ?? "—"}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => aktiflikDegistir.mutate(f)}
                          className={`p-1.5 ${f.aktif ? "text-slate-400" : "text-emerald-500"}`}
                          title={f.aktif ? "Pasife al" : "Aktifleştir"}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => setSilOnay(f)}
                          className="p-1.5 text-slate-400"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Confirm
        open={silOnay !== null}
        onClose={() => setSilOnay(null)}
        onConfirm={() => silOnay && sil.mutate(silOnay)}
        title="Müşteriyi sil"
        message={`"${silOnay?.ad}" müşterisini kalıcı olarak silmek istediğinize emin misiniz? Teklifi olan müşteri silinemez — bu durumda pasife alabilirsiniz.`}
        confirmText="Sil"
        danger
      />

      {editing && (
        <MusteriForm
          firma={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(d) => kaydet.mutate(d)}
          saving={kaydet.isPending}
        />
      )}
    </div>
  );
}

function MusteriForm({
  firma, onClose, onSave, saving,
}: {
  firma: Firma | null;
  onClose: () => void;
  onSave: (d: Partial<Firma>) => void;
  saving: boolean;
}) {
  const [f, setF] = useState<Partial<Firma>>(
    firma ?? { ad: "", yetkili: "", telefon: "", email: "", adres: "", vergi_no: "", vergi_dairesi: "", notlar: "" }
  );
  const upd = (k: keyof Firma, v: any) => setF((p) => ({ ...p, [k]: v }));
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast((s) => s.push);

  // Kaydet: React state + DOM birleşimi. Tarayıcı otomatik-doldurması veya IME
  // onChange'i tetiklemese bile görünen değeri DOM'dan okuyup kaydeder.
  const submit = () => {
    const data: Partial<Firma> = { ...f };
    const el = formRef.current;
    if (el) {
      const fd = new FormData(el);
      (["ad", "yetkili", "telefon", "email", "adres", "vergi_no", "vergi_dairesi", "notlar"] as (keyof Firma)[])
        .forEach((k) => {
          const v = fd.get(k as string);
          const cur = (data as any)[k];
          if ((cur == null || cur === "") && typeof v === "string" && v.trim()) (data as any)[k] = v;
        });
    }
    if (!String(data.ad ?? "").trim()) {
      toast("err", "Firma adı zorunludur");
      return;
    }
    onSave(data);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={firma ? "Müşteri Düzenle" : "Yeni Müşteri"}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>İptal</button>
          <button
            className="btn-primary"
            type="button"
            disabled={saving}
            onClick={submit}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      }
    >
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Firma Adı *</label>
          <input name="ad" className="input" value={f.ad ?? ""} onChange={(e) => upd("ad", e.target.value)} />
        </div>
        <div>
          <label className="label">Yetkili</label>
          <input name="yetkili" className="input" value={f.yetkili ?? ""} onChange={(e) => upd("yetkili", e.target.value)} />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input name="telefon" className="input" value={f.telefon ?? ""} onChange={(e) => upd("telefon", e.target.value)} />
        </div>
        <div>
          <label className="label">E-posta</label>
          <input name="email" className="input" type="email" value={f.email ?? ""} onChange={(e) => upd("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Vergi No</label>
          <input name="vergi_no" className="input" value={f.vergi_no ?? ""} onChange={(e) => upd("vergi_no", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Vergi Dairesi</label>
          <input name="vergi_dairesi" className="input" value={f.vergi_dairesi ?? ""} onChange={(e) => upd("vergi_dairesi", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Adres</label>
          <textarea
            name="adres"
            className="input min-h-[70px]"
            value={f.adres ?? ""}
            onChange={(e) => upd("adres", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notlar</label>
          <textarea
            name="notlar"
            className="input min-h-[60px]"
            value={f.notlar ?? ""}
            onChange={(e) => upd("notlar", e.target.value)}
          />
        </div>
        {/* Görünmez submit — Enter ile kaydet çalışsın */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
