import * as React from "react";
import { NAVY, OFFWHITE, WHITE } from "@/styles/tokens";
import { Label } from "@/components/app/Field";

/**
 * Campos da área do estudante. `Label`, `Input` e `Select` são os
 * compartilhados (`components/app/Field.tsx`); aqui fica só o que é desta
 * área.
 */
export { Label, Input, Select, Rule } from "@/components/app/Field";

export function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div ref={ref} className="relative">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: "Geist, Inter, system-ui, sans-serif",
          color: NAVY,
          fontSize: "14px",
          border: `1px solid ${open ? NAVY : `${NAVY}26`}`,
          boxShadow: open ? `0 0 0 4px ${NAVY}14` : "none",
          borderRadius: "10px",
          background: WHITE,
          width: "100%",
          padding: "10px 14px",
          cursor: "pointer",
          minHeight: "41px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            opacity: value.length === 0 ? 0.6 : 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value.length === 0 ? "Selecione..." : value.join(", ")}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {open && (
        <div
          style={{
            marginTop: "4px",
            background: OFFWHITE,
            border: `1px solid ${NAVY}30`,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((o) => (
            <div
              key={o}
              onClick={() => toggle(o)}
              className="px-3 py-2.5 flex items-center gap-3 transition-colors cursor-pointer"
              style={{
                fontFamily: "Geist, Inter, system-ui, sans-serif",
                color: NAVY,
                fontSize: "13px",
                borderBottom: `1px solid ${NAVY}10`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${NAVY}05`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                style={{
                  border: `1px solid ${value.includes(o) ? NAVY : `${NAVY}40`}`,
                  borderRadius: "4px",
                  background: value.includes(o) ? NAVY : "transparent",
                }}
              >
                {value.includes(o) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ color: OFFWHITE }}>
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
