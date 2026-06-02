export const tl = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
});
export const tlShort = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
});
export const num = new Intl.NumberFormat("tr-TR");
export const formatDate = (d) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
export const formatDateTime = (d) => d
    ? new Date(d).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
    : "—";
export const gunFarki = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};
