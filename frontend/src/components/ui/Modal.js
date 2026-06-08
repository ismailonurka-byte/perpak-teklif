import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
};
export default function Modal({ open, onClose, title, children, size = "md", footer }) {
    useEffect(() => {
        const h = (e) => e.key === "Escape" && onClose();
        if (open)
            document.addEventListener("keydown", h);
        return () => document.removeEventListener("keydown", h);
    }, [open, onClose]);
    // Açıkken arka plan kaydırması kilitlensin
    useEffect(() => {
        if (!open)
            return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);
    if (!open)
        return null;
    // Portal ile doğrudan body'ye render — sayfa sarmalayıcısındaki transform
    // (animate-fade-in) "position: fixed"i bozmasın, modal hep viewport'a göre ortalansın.
    return createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in", onClick: onClose, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: `relative w-full ${sizes[size]} max-h-[95vh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-elevated ring-1 ring-slate-200/60 flex flex-col animate-slide-up sm:animate-scale-in`, children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-5 py-4", children: [_jsx("h3", { className: "text-lg font-semibold font-display text-slate-900", children: title }), _jsx("button", { onClick: onClose, className: "h-8 w-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors", children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-5 py-4", children: children }), footer && _jsx("div", { className: "border-t border-slate-100 px-5 py-3 bg-slate-50/70 rounded-b-2xl", children: footer })] }) }), document.body);
}
