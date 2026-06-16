/**
 * Dinamik form renderer — KalemTipi.alan_semasi'na göre form alanlarını otomatik üretir.
 * Lookup alanları master verisinden beslenir.
 *
 * Desteklenen tipler:
 *  - text, number, int, bool
 *  - lookup (kaynak: master kategorisi)
 *  - lookup_multi (multi-select kategoriden)
 *  - percent (kullanıcı 35 yazar, değer 0.35 saklanır)
 *  - auto (otomatik hesaplanır, kullanıcı düzenleyemez, mavi arkaplan)
 *  - ilave_islemler (her ilave işlem için fiyat girişi — sıvama, lak vs.)
 *  - renk_multi (renk sayısı kadar renk seçimi)
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
            {g.alanlar.map((a: any) => (
              <FieldRenderer
                key={a.key}
                alan={a}
                value={degerler[a.key]}
                tumDegerler={degerler}
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
  alan, value, tumDegerler, onChange, master,
}: {
  alan: any;
  value: any;
  tumDegerler: Record<string, any>;
  onChange: (v: any) => void;
  master: MasterData;
}) {
  const label = (
    <label className="label">
      {alan.label} {alan.zorunlu && <span className="text-rose-500">*</span>}
    </label>
  );

  // ─── AUTO (otomatik hesaplanan — read-only, mavi arkaplan) ─────────
  if (alan.tip === "auto") {
    // Hesaplama: alan.hesapla bir formül string'i; basit fields toplama
    let computed = "";
    if (alan.formul === "ek_gecis") {
      const ba = Number(tumDegerler.baski_adedi ?? tumDegerler.tabaka_adedi ?? 0);
      computed = String(Math.max(0, ba - 3000));
    } else if (alan.formul === "baski_adedi") {
      computed = String(tumDegerler.tabaka_adedi ?? "");
    } else if (alan.formul === "siparis_miktari") {
      const ta = Number(tumDegerler.tabaka_adedi ?? 0);
      const ac = Number(tumDegerler.acinim ?? 0);
      computed = String(ta * ac);
    } else if (alan.formul === "tabaka_adedi") {
      const sm = Number(tumDegerler.siparis_miktari ?? 0);
      const ac = Number(tumDegerler.acinim ?? 0);
      computed = ac > 0 ? String(Math.ceil(sm / ac)) : "";
    } else if (alan.formul === "koli_levha_en") {
      // KOLİ Levha EN = Koli En + Koli Yükseklik + 6
      const en = Number(tumDegerler.koli_en ?? 0);
      const y = Number(tumDegerler.koli_yukseklik ?? 0);
      computed = en > 0 && y > 0 ? String(en + y + 6) : "";
    } else if (alan.formul === "koli_levha_boy") {
      // KOLİ Levha BOY = (Koli En + Koli Boy) × 2 + 30
      const en = Number(tumDegerler.koli_en ?? 0);
      const boy = Number(tumDegerler.koli_boy ?? 0);
      computed = en > 0 && boy > 0 ? String((en + boy) * 2 + 30) : "";
    }
    // Otomatik gelen değer state'e de yazılsın ki backend'e gönderilsin
    if (computed && computed !== String(value ?? "")) {
      setTimeout(() => onChange(Number(computed)), 0);
    }
    return (
      <div>
        {label}
        <div className="input bg-blue-50 text-slate-700 border-blue-200" title="Otomatik hesaplanır">
          {computed || value || "—"}
        </div>
        {alan.aciklama && <div className="text-xs text-slate-400 mt-1">{alan.aciklama}</div>}
      </div>
    );
  }

  // ─── SECMELI (checkbox + fiyat; seçilince listeden otomatik, manuel düzenlenebilir) ─
  if (alan.tip === "secmeli") {
    const oto = Number(master.birim_fiyat?.[alan.fiyat_kaynak] ?? 0);
    // value: sayı → seçili (o fiyat) · null → seçili değil · undefined → varsayılan seçili (oto)
    if (value === undefined) {
      setTimeout(() => onChange(oto), 0);
    }
    const aktif = value !== null && value !== undefined;
    return (
      <div>
        <label className="label flex items-center gap-2">
          <input
            type="checkbox"
            checked={aktif}
            onChange={(e) => onChange(e.target.checked ? oto : null)}
          />
          {alan.label}
        </label>
        <input
          className="input"
          type="number"
          step="any"
          inputMode="decimal"
          disabled={!aktif}
          placeholder={aktif ? "" : "Seçili değil"}
          value={aktif ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </div>
    );
  }

  // ─── PERCENT (kullanıcı 35 yazar, 0.35 saklanır) ─────────────────────
  if (alan.tip === "percent") {
    const yuzde = value != null ? Number(value) * 100 : "";
    return (
      <div>
        {label}
        <div className="relative">
          <input
            className="input pr-8"
            type="number"
            step="any"
            value={yuzde}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? null : Number(v) / 100);
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
        </div>
      </div>
    );
  }

  // ─── BOOL ─────────────────────────────────────────────────────────────
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

  // ─── LOOKUP (tekli) ───────────────────────────────────────────────────
  if (alan.tip === "lookup" && alan.kaynak) {
    const options = getKaynak(alan.kaynak, master);
    return (
      <div>
        {label}
        <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">— Seçin —</option>
          {options.map((o) => (
            <option key={o.kod} value={o.kod}>{o.ad}</option>
          ))}
        </select>
      </div>
    );
  }

  // ─── RENK_MULTI — renk sayısına göre renk seçimi ─────────────────────
  if (alan.tip === "renk_multi") {
    const renkSayisi = Number(tumDegerler.renk_sayisi || 0);
    const renkler = master.renk;
    const secili: string[] = Array.isArray(value) ? value : [];

    // CMYK seçilirse otomatik 4 renk doldur
    const cmykOto = secili.length === 0 && renkSayisi === 4 && tumDegerler.baski_turu?.includes("ROLAND");
    if (cmykOto) {
      setTimeout(() => onChange(["CYAN", "MAGENTA", "SARI", "SIYAH"]), 0);
    }

    return (
      <div className="sm:col-span-2 lg:col-span-3">
        {label}
        <div className="text-xs text-slate-500 mb-1">
          {renkSayisi > 0 ? `${renkSayisi} renk seçilebilir` : "Önce renk sayısını girin"}
        </div>
        <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg bg-white max-h-40 overflow-y-auto">
          {renkler.map((o) => {
            const aktif = secili.includes(o.kod);
            return (
              <button
                type="button"
                key={o.kod}
                onClick={() => {
                  if (aktif) onChange(secili.filter((s) => s !== o.kod));
                  else if (secili.length < renkSayisi || renkSayisi === 0) onChange([...secili, o.kod]);
                }}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                  aktif ? "bg-brand-700 text-white border-brand-700" : "bg-white border-slate-200 hover:border-brand-400"
                }`}
                style={aktif && o.hex ? { backgroundColor: o.hex, borderColor: o.hex } : {}}
              >
                {o.ad}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── ILAVE_ISLEMLER — her bir ilave işlem için fiyat alanı ──────────
  if (alan.tip === "ilave_islemler") {
    const birim = alan.birim || "TL"; // OFSET: TL/m², KOLİ: TL (koli başına)
    // Şemadaki "ekstra" satırlar (örn. Yapıştırma TL/adet) listeye eklenir
    const ekstra: { kod: string; ad: string; birim?: string }[] = alan.ekstra || [];
    const tum: { kod: string; ad: string; birim?: string; tl_m2?: number }[] = [...master.baski_sonrasi_islem, ...ekstra];
    // Otomatik default fiyat (müdahaleye açık):
    //  - Baskı sonrası işlemler → master sabit fiyatı (tl_m2) — Fiyatlar ekranından yönetilir
    //  - Ekstra Yapıştırma → birim_fiyat.yapistirma_tl_ad
    const bf = master.birim_fiyat || {};
    const OTO_FIYAT: Record<string, number> = {
      YAPISTIRMA: bf.yapistirma_tl_ad ?? 0,
    };
    const defaultFiyat = (islem: { kod: string; tl_m2?: number }) =>
      (islem.tl_m2 ?? OTO_FIYAT[islem.kod]) ?? 0;
    // Custom: değer = { kod: fiyat, ... }
    const detay: Record<string, number> = (value && typeof value === "object") ? value : {};
    return (
      <div className="sm:col-span-2 lg:col-span-3">
        {label}
        <div className="border border-slate-300 rounded-lg bg-white p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tum.map((islem) => {
              const aktif = islem.kod in detay;
              const phBirim = islem.birim || birim;
              return (
                <div key={islem.kod} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={aktif}
                    onChange={(e) => {
                      const yeni = { ...detay };
                      // İşaretlenince master sabit fiyatı otomatik gelir; sonra elle değiştirilebilir
                      if (e.target.checked) yeni[islem.kod] = defaultFiyat(islem);
                      else delete yeni[islem.kod];
                      onChange(yeni);
                    }}
                    className="shrink-0"
                  />
                  <span className="text-xs flex-1 truncate" title={islem.ad}>{islem.ad}</span>
                  <input
                    type="number"
                    step="any"
                    placeholder={phBirim}
                    className="w-20 text-xs border border-slate-200 rounded px-1.5 py-0.5"
                    value={aktif ? (detay[islem.kod] || "") : ""}
                    onChange={(e) => onChange({ ...detay, [islem.kod]: Number(e.target.value || 0) })}
                    disabled={!aktif}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── LOOKUP_MULTI ─────────────────────────────────────────────────────
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

  // ─── NUMBER / INT ─────────────────────────────────────────────────────
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

  // ─── TEXT (default) ───────────────────────────────────────────────────
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

function getKaynak(kaynak: string, master: MasterData): { kod: string; ad: string; hex?: string | null }[] {
  switch (kaynak) {
    case "karton_cinsi": return master.karton_cinsi;
    case "gramaj": return master.gramaj.map((g) => ({ kod: String(g.deger), ad: `${g.deger} g/m²` }));
    case "oluklu_kalite": return master.oluklu_kalite.map((o) => ({ kod: o.kod, ad: o.kod }));
    case "baski_turu": return master.baski_turu.map((m) => ({
      kod: m.kod,
      ad: `${m.ad} — ${m.tip === "FASON" ? "Fason" : "Dahili"}`,
    }));
    case "renk": return master.renk;
    case "baski_sonrasi_islem": return master.baski_sonrasi_islem;
    case "eklenti": return master.eklenti;
    case "ambalaj_sekli": return master.ambalaj_sekli;
    case "grafik_durumu": return master.grafik_durumu;
    case "baskili_baskisiz": return [
      { kod: "BASKILI", ad: "Baskılı" },
      { kod: "BASKISIZ", ad: "Baskısız" },
    ];
    default: return [];
  }
}
