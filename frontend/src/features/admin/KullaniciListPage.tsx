import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Shield } from "lucide-react";

import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Kullanici, RolT } from "@/types";
import { formatDateTime } from "@/lib/format";

export default function KullaniciListPage() {
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<Kullanici | "new" | null>(null);

  const { data: liste = [], isLoading } = useQuery<Kullanici[]>({
    queryKey: ["kullanici-liste"],
    queryFn: async () => (await api.get("/kullanici")).data,
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="page-title">Kullanıcılar</h1>
          <p className="text-sm text-slate-500">{liste.length} kayıt</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1" /> Yeni Kullanıcı
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Ad Soyad</th>
                  <th className="text-left px-4 py-3">Kullanıcı Adı</th>
                  <th className="text-left px-4 py-3">Roller</th>
                  <th className="text-left px-4 py-3">E-posta</th>
                  <th className="text-left px-4 py-3">Son Giriş</th>
                  <th className="text-left px-4 py-3">Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liste.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{u.ad_soyad}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.kullanici_adi}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.roller && u.roller.length > 0 ? u.roller : ["—"]).map((r) => (
                          <Badge key={r} className="bg-brand-100 text-brand-700">
                            <Shield size={10} className="mr-1 inline" />{r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(u.son_giris)}</td>
                    <td className="px-4 py-3">
                      <span className={u.aktif ? "text-emerald-600" : "text-slate-400"}>
                        {u.aktif ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditing(u)} className="text-slate-400 hover:text-brand-700">
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <KullaniciForm
          kullanici={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["kullanici-liste"] });
            toast("ok", "Kullanıcı kaydedildi");
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function KullaniciForm({
  kullanici, onClose, onSaved,
}: {
  kullanici: Kullanici | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast((s) => s.push);
  const [f, setF] = useState({
    id: kullanici?.id,
    kullanici_adi: kullanici?.kullanici_adi ?? "",
    sifre: "",
    ad_soyad: kullanici?.ad_soyad ?? "",
    unvan: kullanici?.unvan ?? "",
    rol: kullanici?.rol ?? "SATIS",
    telefon: kullanici?.telefon ?? "",
    email: kullanici?.email ?? "",
    aktif: kullanici?.aktif ?? true,
  });
  const upd = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  // Tüm roller
  const { data: roller = [] } = useQuery<RolT[]>({
    queryKey: ["roller"],
    queryFn: async () => (await api.get("/rol")).data,
  });
  // Düzenlenen kullanıcının mevcut rol id'leri
  const { data: mevcutRolIds } = useQuery<string[]>({
    queryKey: ["kullanici-roller", kullanici?.id],
    queryFn: async () => (await api.get(`/rol/kullanici/${kullanici!.id}`)).data,
    enabled: Boolean(kullanici?.id),
  });
  const [seciliRoller, setSeciliRoller] = useState<string[]>([]);
  useEffect(() => {
    if (mevcutRolIds) setSeciliRoller(mevcutRolIds);
  }, [mevcutRolIds]);

  const toggleRol = (id: string) =>
    setSeciliRoller((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const kaydet = useMutation({
    mutationFn: async () => {
      const data: any = { ...f };
      if (!data.sifre) delete data.sifre;
      if (!data.id) delete data.id;
      // 1) Kullanıcıyı kaydet
      const saved = kullanici?.id
        ? (await api.patch(`/kullanici/${kullanici.id}`, data)).data
        : (await api.post("/kullanici", data)).data;
      // 2) Rolleri ata
      await api.put(`/rol/kullanici/${saved.id}`, { rol_ids: seciliRoller });
      return saved;
    },
    onSuccess: onSaved,
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={kullanici ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>İptal</button>
          <button
            className="btn-primary"
            disabled={!f.kullanici_adi || !f.ad_soyad || (!kullanici && !f.sifre) || kaydet.isPending}
            onClick={() => kaydet.mutate()}
          >
            {kaydet.isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Ad Soyad *</label>
          <input className="input" value={f.ad_soyad} onChange={(e) => upd("ad_soyad", e.target.value)} />
        </div>
        <div>
          <label className="label">Kullanıcı Adı *</label>
          <input className="input" value={f.kullanici_adi} onChange={(e) => upd("kullanici_adi", e.target.value)} disabled={Boolean(kullanici)} />
        </div>
        <div>
          <label className="label">{kullanici ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre *"}</label>
          <input className="input" type="password" value={f.sifre} onChange={(e) => upd("sifre", e.target.value)} />
        </div>
        <div>
          <label className="label">Ünvan (proformada yazılır)</label>
          <input className="input" placeholder="örn: Satış Temsilcisi, Genel Müdür" value={f.unvan} onChange={(e) => upd("unvan", e.target.value)} />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={f.telefon} onChange={(e) => upd("telefon", e.target.value)} />
        </div>
        <div>
          <label className="label">E-posta</label>
          <input className="input" type="email" value={f.email} onChange={(e) => upd("email", e.target.value)} />
        </div>

        {/* Erişim rolleri — yetkiler buradan gelir */}
        <div className="sm:col-span-2">
          <label className="label">Erişim Rolleri (yetkiler buradan)</label>
          <div className="grid sm:grid-cols-2 gap-1.5 rounded-xl ring-1 ring-slate-200/70 p-2 max-h-44 overflow-y-auto">
            {roller.length === 0 && <div className="text-xs text-slate-400 p-1">Henüz rol yok.</div>}
            {roller.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={seciliRoller.includes(r.id)} onChange={() => toggleRol(r.id)} />
                <Shield size={12} className={r.sistem_rol ? "text-accent-500" : "text-brand-500"} />
                {r.ad}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Birden fazla rol seçilebilir; izinler birleşir.</p>
        </div>

        {kullanici && (
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.aktif} onChange={(e) => upd("aktif", e.target.checked)} />
              Aktif
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
}
