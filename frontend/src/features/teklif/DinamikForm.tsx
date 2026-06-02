/**
 * Dinamik form renderer — KalemTipi.alan_semasi'na göre form alanlarını otomatik üretir.
 * Lookup alanları master verisinden beslenir.
 */
import { useMaster } from "@/hooks/useMaster";
import type { AlanSemasi, MasterData } from "@/types";

type Props = {
  sema: AlanSemasi;
  degerler: Record<string, any>;
  onChange: (key: string, value: any) => void;
};

export default function DinamikForm({ sema, degerler, onChange }: Props) {
  const { data: master } = useMaster();
  if (!master) return <div className="text-sm text-slate-400">Master veri yükleniyor...</div>;

  return (
    <div className="space-y-5">
      {sema.gruplar.map((g) => (
        <div key={g.ad}>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-2">{g.ad}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.alanlar.map((a) => (
              <FieldRenderer
                key={a.key}
                alan={a}
                value={degerler[a.key]}
                onChange={(v) => onChange(a.key, v)}
                master={master}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldRenderer({
  alan, value, onChange, master,
}: {
  alan: AlanSemasi["gruplar"][0]["alanlar"][0];
  value: any;
  onChange: (v: any) => void;
  master: MasterData;
}) {
  const label = (
    <label className="label">
      {alan.label} {alan.zorunlu && <span className="text-rose-500">*</span>}
    </label>
  );

  if (alan.tip === "bool") {
    return (
      <div>
        <label className="label invisible">{alan.label}</label>
        <label className="flex items-center gap-2 text-sm h-[38px] px-3 rounded-lg border border-slate-300 bg-white">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {alan.label}
        </label>
      </div>
    );
  }

  if (alan.tip === "lookup" && alan.kaynak) {
    const options = getKaynak(alan.kaynak, master);
    return (
      <div>
        {label}
        <select
          className="input"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">— Seçin —</option>
          {options.map((o) => (
            <option key={o.kod} value={o.kod}>{o.ad}</option>
          ))}
        </select>
      </div>
    );
  }

  if (alan.tip === "lookup_multi" && alan.kaynak) {
    const options = getKaynak(alan.kaynak, master);
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="sm:col-span-2 lg:col-span-3">
        {label}
        <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg bg-white max-h-32 overflow-y-auto">
          {options.map((o) => {
            const aktif = selected.includes(o.kod);
            return (
              <button
                type="button"
                key={o.kod}
                onClick={() => {
                  if (aktif) onChange(selected.filter((s) => s !== o.kod));
                  else onChange([...selected, o.kod]);
                }}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                  aktif ? "bg-brand-700 text-white border-brand-700" : "bg-white border-slate-200 hover:border-brand-400"
                }`}
              >
                {o.ad}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (alan.tip === "number" || alan.tip === "int") {
    return (
      <div>
        {label}
        <input
          className="input"
          type="number"
          inputMode={alan.tip === "int" ? "numeric" : "decimal"}
          min={alan.min}
          max={alan.max}
          step={alan.tip === "int" ? 1 : "any"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>
    );
  }

  // text
  return (
    <div>
      {label}
      <input
        className="input"
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function getKaynak(kaynak: string, master: MasterData): { kod: string; ad: string }[] {
  switch (kaynak) {
    case "karton_cinsi": return master.karton_cinsi;
    case "gramaj": return master.gramaj.map((g) => ({ kod: String(g.deger), ad: `${g.deger} g/m²` }));
    case "oluklu_kalite": return master.oluklu_kalite.map((o) => ({ kod: o.kod, ad: o.kod }));
    case "baski_turu": return master.baski_turu;
    case "renk": return master.renk;
    case "baski_sonrasi_islem": return master.baski_sonrasi_islem;
    case "eklenti": return master.eklenti;
    case "ambalaj_sekli": return master.ambalaj_sekli;
    case "grafik_durumu": return master.grafik_durumu;
    default: return [];
  }
}
