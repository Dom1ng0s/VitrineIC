import * as React from "react";
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
  const listId = React.useId();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div ref={ref} className="relative">
      {label && <Label>{label}</Label>}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}
        className={`flex min-h-[41px] w-full items-center justify-between rounded-[10px] border bg-white px-3.5 py-2.5 text-left font-sans text-sm text-navy transition-[border-color,box-shadow] ${
          open ? "border-navy shadow-[0_0_0_4px_rgba(11,37,69,0.08)]" : "border-navy/15"
        }`}
      >
        <span className={`truncate ${value.length === 0 ? "opacity-60" : ""}`}>
          {value.length === 0 ? "Selecione..." : value.join(", ")}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label ?? "Opções"}
          className="mt-1 max-h-[200px] overflow-y-auto rounded-lg border border-navy/20 bg-offwhite shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          {options.map((o) => {
            const selected = value.includes(o);
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(o)}
                className="flex w-full items-center gap-3 border-b border-navy/6 px-3 py-2.5 text-left font-sans text-[13px] text-navy transition-colors last:border-b-0 hover:bg-navy/[0.04]"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                    selected ? "border-navy bg-navy text-offwhite" : "border-navy/25 bg-transparent"
                  }`}
                >
                  {selected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
