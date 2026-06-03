import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Shield } from "lucide-react";

import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Kullanici, Rol } from "@/types";
import { formatDateTime } from "@/lib/format";

const ROL_RENGI: Record<Rol, string> = {
  ADMIN: "bg-rose-100 text-rose-700",
  SATIS: "bg-blue-100 text-blue-700",
  URETIM: "bg-slate-100 text-slate-700",
};

export default function KullaniciListPage() {
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<Kullanici | "new" | null>(null);

  const { data: liste = [], isLoading } = useQuery<Kullanici[]>({
    queryKey: ["kullanici-liste"],
    queryFn: async () => (await api.get("/kullanici")).data,
  });

  const kaydet = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { id, ...rest } = data;
        return (await api.patch(`/kullanici/${id}`, rest)).data;
      }
      return (await api.post("/kullanici", data)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kullanici-liste"] });
      toast("ok", "Kullanıcı kaydedildi");
      setEditing(null);
    },
    onError: (e: any) => toast("err", e?.response?.data?.detail ?? "Hata"),
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
                  <th className="text-left px-4 py-3">Rol</th>
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
                      <Badge className={ROL_RENGI[u.rol]}>
                        <Shield size={10} className="mr-1 inline" />
                        {u.rol}
                      </Badge>
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
          onSave={(d) => kaydet.mutate(d)}
          saving={kaydet.isPending}
        />
      )}
    </div>
  );
}

function KullaniciForm({
  kullanici, onClose, onSave, saving,
}: {
  kullanici: Kullanici | null;
  onClose: () => void;
  onSave: (d: any) => void;
  saving: boolean;
}) {
  const [f, setF] = useState({
    id: kullanici?.id,
    kullanici_adi: kullanici?.kullanici_adi ?? "",
    sifre: "",
    ad_soyad: kullanici?.ad_soyad ?? "",
    unvan: kullanici?.unvan ?? "",
    rol: kullanici?.rol ?? ("SATIS" as Rol),
    telefon: kullanici?.telefon ?? "",
    email: kullanici?.email ?? "",
    aktif: kullanici?.aktif ?? true,
  });
  const upd = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const data: any = { ...f };
    if (!data.sifre) delete data.sifre;
    if (!data.id) delete data.id;
    onSave(data);
  };

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
            disabled={!f.kullanici_adi || !f.ad_soyad || (!kullanici && !f.sifre) || saving}
            onClick={submit}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
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
          <input
            className="input"
            value={f.kullanici_adi}
            onChange={(e) => upd("kullanici_adi", e.target.value)}
            disabled={Boolean(kullanici)}
          />
        </div>
        <div>
          <label className="label">{kullanici ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre *"}</label>
          <input
            className="input"
            type="password"
            value={f.sifre}
            onChange={(e) => upd("sifre", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Ünvan (proformada yazılır)</label>
          <input
            className="input"
            placeholder="örn: Satış Temsilcisi, Genel Müdür"
            value={f.unvan}
            onChange={(e) => upd("unvan", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Rol</label>
          <select className="input" value={f.rol} onChange={(e) => upd("rol", e.target.value)}>
            <option value="ADMIN">Yönetici</option>
            <option value="SATIS">Satış Temsilcisi</option>
            <option value="URETIM">Üretim</option>
          </select>
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={f.telefon} onChange={(e) => upd("telefon", e.target.value)} />
        </div>
        <div>
          <label className="label">E-posta</label>
          <input className="input" type="email" value={f.email} onChange={(e) => upd("email", e.target.value)} />
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
