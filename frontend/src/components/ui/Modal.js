import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
import { useEffect } from "react";
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
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4", children: _jsxs("div", { className: `relative w-full ${sizes[size]} max-h-[95vh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col`, children: [_jsxs("div", { className: "flex items-center justify-between border-b px-5 py-3", children: [_jsx("h3", { className: "text-lg font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-5 py-4", children: children }), footer && _jsx("div", { className: "border-t px-5 py-3 bg-slate-50 rounded-b-2xl", children: footer })] }) }));
}
