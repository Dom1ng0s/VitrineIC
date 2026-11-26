import type * as React from "react";

/** O `Label` da curadoria tinha outro tom de navy, sem decisão por trás. */
export { Label } from "@/components/app/Field";

export function Mono({ children, dim, red }: { children: React.ReactNode; dim?: boolean; red?: boolean }) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.04em] ${red ? "text-red" : dim ? "text-navy/50" : "text-navy"}`}
    >
      {children}
    </span>
  );
}

export { Rule } from "@/components/app/Field";

/** Tag de skill (.vt-pill). `highlight` marca a skill que cruza com a demanda. */
export function SkillTag({ children, highlight }: { children: React.ReactNode; highlight?: boolean; small?: boolean }) {
  return <span className={`vt-pill ${highlight ? "border-red/40! bg-red/5 text-red!" : ""}`}>{children}</span>;
}
