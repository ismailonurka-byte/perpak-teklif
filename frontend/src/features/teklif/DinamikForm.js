import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function DinamikForm({ sema, degerler, onChange }) {
    const { data: master } = useMaster();
    if (!master)
        return _jsx("div", { className: "text-sm text-slate-400", children: "Master veri y\u00FCkleniyor..." });
    return (_jsx("div", { className: "space-y-5", children: sema.gruplar.map((g) => (_jsxs("div", { children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-brand-700 mb-2", children: g.ad }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: g.alanlar.map((a) => (_jsx(FieldRenderer, { alan: a, value: degerler[a.key], tumDegerler: degerler, onChange: (v) => onChange(a.key, v), master: master }, a.key))) })] }, g.ad))) }));
}
function FieldRenderer({ alan, value, tumDegerler, onChange, master, }) {
    const label = (_jsxs("label", { className: "label", children: [alan.label, " ", alan.zorunlu && _jsx("span", { className: "text-rose-500", children: "*" })] }));
    // ─── AUTO (otomatik hesaplanan — read-only, mavi arkaplan) ─────────
    if (alan.tip === "auto") {
        // Hesaplama: alan.hesapla bir formül string'i; basit fields toplama
        let computed = "";
        if (alan.formul === "ek_gecis") {
            const ba = Number(tumDegerler.baski_adedi ?? tumDegerler.tabaka_adedi ?? 0);
            computed = String(Math.max(0, ba - 3000));
        }
        else if (alan.formul === "baski_adedi") {
            computed = String(tumDegerler.tabaka_adedi ?? "");
        }
        else if (alan.formul === "siparis_miktari") {
            const ta = Number(tumDegerler.tabaka_adedi ?? 0);
            const ac = Number(tumDegerler.acinim ?? 0);
            computed = String(ta * ac);
        }
        else if (alan.formul === "tabaka_adedi") {
            const sm = Number(tumDegerler.siparis_miktari ?? 0);
            const ac = Number(tumDegerler.acinim ?? 0);
            computed = ac > 0 ? String(Math.ceil(sm / ac)) : "";
        }
        else if (alan.formul === "koli_levha_en") {
            // KOLİ Levha EN = Koli En + Koli Yükseklik + 6
            const en = Number(tumDegerler.koli_en ?? 0);
            const y = Number(tumDegerler.koli_yukseklik ?? 0);
            computed = en > 0 && y > 0 ? String(en + y + 6) : "";
        }
        else if (alan.formul === "koli_levha_boy") {
            // KOLİ Levha BOY = (Koli En + Koli Boy) × 2 + 30
            const en = Number(tumDegerler.koli_en ?? 0);
            const boy = Number(tumDegerler.koli_boy ?? 0);
            computed = en > 0 && boy > 0 ? String((en + boy) * 2 + 30) : "";
        }
        // Otomatik gelen değer state'e de yazılsın ki backend'e gönderilsin
        if (computed && computed !== String(value ?? "")) {
            setTimeout(() => onChange(Number(computed)), 0);
        }
        return (_jsxs("div", { children: [label, _jsx("div", { className: "input bg-blue-50 text-slate-700 border-blue-200", title: "Otomatik hesaplan\u0131r", children: computed || value || "—" }), alan.aciklama && _jsx("div", { className: "text-xs text-slate-400 mt-1", children: alan.aciklama })] }));
    }
    // ─── PERCENT (kullanıcı 35 yazar, 0.35 saklanır) ─────────────────────
    if (alan.tip === "percent") {
        const yuzde = value != null ? Number(value) * 100 : "";
        return (_jsxs("div", { children: [label, _jsxs("div", { className: "relative", children: [_jsx("input", { className: "input pr-8", type: "number", step: "any", value: yuzde, onChange: (e) => {
                                const v = e.target.value;
                                onChange(v === "" ? null : Number(v) / 100);
                            } }), _jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm", children: "%" })] })] }));
    }
    // ─── BOOL ─────────────────────────────────────────────────────────────
    if (alan.tip === "bool") {
        return (_jsxs("div", { children: [_jsx("label", { className: "label invisible", children: alan.label }), _jsxs("label", { className: "flex items-center gap-2 text-sm h-[38px] px-3 rounded-lg border border-slate-300 bg-white", children: [_jsx("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => onChange(e.target.checked) }), alan.label] })] }));
    }
    // ─── LOOKUP (tekli) ───────────────────────────────────────────────────
    if (alan.tip === "lookup" && alan.kaynak) {
        const options = getKaynak(alan.kaynak, master);
        return (_jsxs("div", { children: [label, _jsxs("select", { className: "input", value: value ?? "", onChange: (e) => onChange(e.target.value || null), children: [_jsx("option", { value: "", children: "\u2014 Se\u00E7in \u2014" }), options.map((o) => (_jsx("option", { value: o.kod, children: o.ad }, o.kod)))] })] }));
    }
    // ─── RENK_MULTI — renk sayısına göre renk seçimi ─────────────────────
    if (alan.tip === "renk_multi") {
        const renkSayisi = Number(tumDegerler.renk_sayisi || 0);
        const renkler = master.renk;
        const secili = Array.isArray(value) ? value : [];
        // CMYK seçilirse otomatik 4 renk doldur
        const cmykOto = secili.length === 0 && renkSayisi === 4 && tumDegerler.baski_turu?.includes("ROLAND");
        if (cmykOto) {
            setTimeout(() => onChange(["CYAN", "MAGENTA", "SARI", "SIYAH"]), 0);
        }
        return (_jsxs("div", { className: "sm:col-span-2 lg:col-span-3", children: [label, _jsx("div", { className: "text-xs text-slate-500 mb-1", children: renkSayisi > 0 ? `${renkSayisi} renk seçilebilir` : "Önce renk sayısını girin" }), _jsx("div", { className: "flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg bg-white max-h-40 overflow-y-auto", children: renkler.map((o) => {
                        const aktif = secili.includes(o.kod);
                        return (_jsx("button", { type: "button", onClick: () => {
                                if (aktif)
                                    onChange(secili.filter((s) => s !== o.kod));
                                else if (secili.length < renkSayisi || renkSayisi === 0)
                                    onChange([...secili, o.kod]);
                            }, className: `text-xs px-2 py-1 rounded-md border transition-colors ${aktif ? "bg-brand-700 text-white border-brand-700" : "bg-white border-slate-200 hover:border-brand-400"}`, style: aktif && o.hex ? { backgroundColor: o.hex, borderColor: o.hex } : {}, children: o.ad }, o.kod));
                    }) })] }));
    }
    // ─── ILAVE_ISLEMLER — her bir ilave işlem için fiyat alanı ──────────
    if (alan.tip === "ilave_islemler") {
        const tum = master.baski_sonrasi_islem;
        const birim = alan.birim || "TL"; // OFSET: TL/m², KOLİ: TL (koli başına)
        // Fiyat listesinden otomatik default (müdahaleye açık) — Lak & Sıvama
        const bf = master.birim_fiyat || {};
        const OTO_FIYAT = {
            LAK: bf.lak_tl_m2 ?? 0,
            SIVAMA: bf.sivama_tl_m2 ?? 0,
        };
        // Custom: değer = { kod: fiyat, ... }
        const detay = (value && typeof value === "object") ? value : {};
        return (_jsxs("div", { className: "sm:col-span-2 lg:col-span-3", children: [label, _jsx("div", { className: "border border-slate-300 rounded-lg bg-white p-3", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: tum.map((islem) => {
                            const aktif = islem.kod in detay;
                            return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: aktif, onChange: (e) => {
                                            const yeni = { ...detay };
                                            // İşaretlenince fiyatı listeden otomatik gelir (Lak/Sıvama); sonra elle değiştirilebilir
                                            if (e.target.checked)
                                                yeni[islem.kod] = OTO_FIYAT[islem.kod] ?? 0;
                                            else
                                                delete yeni[islem.kod];
                                            onChange(yeni);
                                        }, className: "shrink-0" }), _jsx("span", { className: "text-xs flex-1 truncate", title: islem.ad, children: islem.ad }), _jsx("input", { type: "number", step: "any", placeholder: birim, className: "w-20 text-xs border border-slate-200 rounded px-1.5 py-0.5", value: aktif ? (detay[islem.kod] || "") : "", onChange: (e) => onChange({ ...detay, [islem.kod]: Number(e.target.value || 0) }), disabled: !aktif })] }, islem.kod));
                        }) }) })] }));
    }
    // ─── LOOKUP_MULTI ─────────────────────────────────────────────────────
    if (alan.tip === "lookup_multi" && alan.kaynak) {
        const options = getKaynak(alan.kaynak, master);
        const selected = Array.isArray(value) ? value : [];
        return (_jsxs("div", { className: "sm:col-span-2 lg:col-span-3", children: [label, _jsx("div", { className: "flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg bg-white max-h-32 overflow-y-auto", children: options.map((o) => {
                        const aktif = selected.includes(o.kod);
                        return (_jsx("button", { type: "button", onClick: () => {
                                if (aktif)
                                    onChange(selected.filter((s) => s !== o.kod));
                                else
                                    onChange([...selected, o.kod]);
                            }, className: `text-xs px-2 py-1 rounded-md border transition-colors ${aktif ? "bg-brand-700 text-white border-brand-700" : "bg-white border-slate-200 hover:border-brand-400"}`, children: o.ad }, o.kod));
                    }) })] }));
    }
    // ─── NUMBER / INT ─────────────────────────────────────────────────────
    if (alan.tip === "number" || alan.tip === "int") {
        return (_jsxs("div", { children: [label, _jsx("input", { className: "input", type: "number", inputMode: alan.tip === "int" ? "numeric" : "decimal", min: alan.min, max: alan.max, step: alan.tip === "int" ? 1 : "any", value: value ?? "", onChange: (e) => onChange(e.target.value === "" ? null : Number(e.target.value)) })] }));
    }
    // ─── TEXT (default) ───────────────────────────────────────────────────
    return (_jsxs("div", { children: [label, _jsx("input", { className: "input", type: "text", value: value ?? "", onChange: (e) => onChange(e.target.value) })] }));
}
function getKaynak(kaynak, master) {
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
        case "baskili_baskisiz": return [
            { kod: "BASKILI", ad: "Baskılı" },
            { kod: "BASKISIZ", ad: "Baskısız" },
        ];
        default: return [];
    }
}
