import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Modal from "./Modal";
export default function Confirm({ open, onClose, onConfirm, title = "Onayla", message, confirmText = "Onayla", danger = false, }) {
    return (_jsx(Modal, { open: open, onClose: onClose, title: title, size: "sm", footer: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: "btn-ghost", onClick: onClose, children: "Vazge\u00E7" }), _jsx("button", { className: `btn ${danger ? "bg-rose-600 text-white hover:bg-rose-700" : "btn-primary"}`, onClick: () => { onConfirm(); onClose(); }, children: confirmText })] }), children: _jsx("p", { className: "text-sm text-slate-700", children: message }) }));
}
