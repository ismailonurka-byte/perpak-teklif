import { jsx as _jsx } from "react/jsx-runtime";
export default function Badge({ children, className = "" }) {
    return (_jsx("span", { className: `badge ${className}`, children: children }));
}
