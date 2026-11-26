import type { Demand } from "@/types";

const LABELS: {
  key: keyof Pick<Demand, "audience" | "academicLevel" | "notes" | "teamSize" | "budget">;
  label: string;
}[] = [
  { key: "audience", label: "Público-alvo" },
  { key: "academicLevel", label: "Nível acadêmico" },
  { key: "teamSize", label: "Tamanho da equipe" },
  { key: "budget", label: "Orçamento" },
  { key: "notes", label: "Entregáveis e observações" },
];

/** Exibe os campos complementares da demanda quando preenchidos. */
export function DemandExtras({ demand, compact = false }: { demand: Demand; compact?: boolean }) {
  const filled = LABELS.filter(({ key }) => Boolean(demand[key]?.trim()));
  if (filled.length === 0) return null;

  if (compact) {
    return (
      <dl className="mt-3 flex flex-col gap-1.5 border-t border-navy/8 pt-3">
        {filled.map(({ key, label }) => (
          <div key={key} className="flex flex-wrap gap-x-2 text-xs">
            <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">{label}:</dt>
            <dd className="font-sans text-navy/75">{demand[key]}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="mt-5 grid gap-4 border-t border-navy/8 pt-5 sm:grid-cols-2">
      {filled.map(({ key, label }) => (
        <div key={key} className={key === "notes" ? "sm:col-span-2" : undefined}>
          <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/55">{label}</dt>
          <dd className="mt-1 font-sans text-sm leading-[1.55] text-navy">{demand[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
