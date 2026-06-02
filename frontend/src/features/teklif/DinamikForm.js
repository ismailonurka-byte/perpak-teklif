import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Dinamik form renderer — KalemTipi.alan_semasi'na göre form alanlarını otomatik üretir.
 * Lookup alanları master verisinden beslenir.
 */
import { useMaster } from "@/hooks/useMaster";
export default function DinamikForm({ sema, degerler, onChange }) {
    const { data: master } = useMaster();
    if (!master)
        return _jsx("div", { className: "text-sm text-slate-400", children: "Master veri y\u00FCkleniyor..." });
    return (_jsx("div", { className: "space-y-5", children: sema.gruplar.map((g) => (_jsxs("div", { children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-brand-700 mb-2", children: g.ad }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: g.alanlar.map((a) => (_jsx(FieldRenderer, { alan: a, value: degerler[a.key], onChange: (v) => onChange(a.key, v), master: master }, a.key))) })] }, g.ad))) }));
}
function FieldRenderer({ alan, value, onChange, master, }) {
    const label = (_jsxs("label", { className: "label", children: [alan.label, " ", alan.zorunlu && _jsx("span", { className: "text-rose-500", children: "*" })] }));
    if (alan.tip === "bool") {
        return (_jsxs("div", { children: [_jsx("label", { className: "label invisible", children: alan.label }), _jsxs("label", { className: "flex items-center gap-2 text-sm h-[38px] px-3 rounded-lg border border-slate-300 bg-white", children: [_jsx("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => onChange(e.target.checked) }), alan.label] })] }));
    }
    if (alan.tip === "lookup" && alan.kaynak) {
        const options = getKaynak(alan.kaynak, master);
        return (_jsxs("div", { children: [label, _jsxs("select", { className: "input", value: value ?? "", onChange: (e) => onChange(e.target.value || null), children: [_jsx("option", { value: "", children: "\u2014 Se\u00E7in \u2014" }), options.map((o) => (_jsx("option", { value: o.kod, children: o.ad }, o.kod)))] })] }));
    }
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
    if (alan.tip === "number" || alan.tip === "int") {
        return (_jsxs("div", { children: [label, _jsx("input", { className: "input", type: "number", inputMode: alan.tip === "int" ? "numeric" : "decimal", min: alan.min, max: alan.max, step: alan.tip === "int" ? 1 : "any", value: value ?? "", onChange: (e) => onChange(e.target.value === "" ? null : Number(e.target.value)) })] }));
    }
    // text
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
        default: return [];
    }
}
