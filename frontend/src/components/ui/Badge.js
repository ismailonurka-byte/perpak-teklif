import { jsx as _jsx } from "react/jsx-runtime";
export default function Badge({ children, className = "" }) {
    return (_jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`, children: children }));
}
