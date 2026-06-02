export const DURUM_RENGI = {
    TASLAK: "bg-slate-200 text-slate-700",
    TEKLIF_VERILDI: "bg-blue-100 text-blue-700",
    BEKLEMEDE: "bg-amber-100 text-amber-700",
    KABUL: "bg-emerald-100 text-emerald-700",
    SIPARIS: "bg-violet-100 text-violet-700",
    RED: "bg-rose-100 text-rose-700",
    IPTAL: "bg-slate-100 text-slate-500",
};
export const DURUM_ETIKET = {
    TASLAK: "Taslak",
    TEKLIF_VERILDI: "Teklif Verildi",
    BEKLEMEDE: "Beklemede",
    KABUL: "Kabul",
    SIPARIS: "Sipariş",
    RED: "Red",
    IPTAL: "İptal",
};
/**
 * Açık (henüz kapanmamış) sayılan durumlar — dashboard'da "açık teklifler"
 * ve eskime uyarısı bu kümeye uygulanır.
 */
export const ACIK_DURUMLAR = ["TASLAK", "TEKLIF_VERILDI", "BEKLEMEDE"];
