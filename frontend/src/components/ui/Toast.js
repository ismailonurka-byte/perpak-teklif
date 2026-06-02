import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { create } from "zustand";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
export const useToast = create((set, get) => ({
    list: [],
    push: (tip, mesaj) => {
        const id = Date.now() + Math.random();
        set({ list: [...get().list, { id, tip, mesaj }] });
        setTimeout(() => get().remove(id), 4000);
    },
    remove: (id) => set({ list: get().list.filter((t) => t.id !== id) }),
}));
export function ToastContainer() {
    const list = useToast((s) => s.list);
    const remove = useToast((s) => s.remove);
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm", children: list.map((t) => {
            const Icon = t.tip === "ok" ? CheckCircle2 : t.tip === "err" ? XCircle : Info;
            const color = t.tip === "ok" ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                : t.tip === "err" ? "border-rose-500 bg-rose-50 text-rose-800"
                    : "border-blue-500 bg-blue-50 text-blue-800";
            return (_jsxs("div", { className: `flex items-start gap-2 rounded-lg border-l-4 px-3 py-2 shadow-sm ${color}`, children: [_jsx(Icon, { size: 18, className: "mt-0.5 shrink-0" }), _jsx("div", { className: "flex-1 text-sm", children: t.mesaj }), _jsx("button", { onClick: () => remove(t.id), className: "text-current opacity-50 hover:opacity-100", children: _jsx(X, { size: 14 }) })] }, t.id));
        }) }));
}
