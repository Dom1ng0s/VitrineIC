import { MOSS, NAVY, OCHRE, SLATE, TERRACOTTA } from "@/styles/tokens";
import { StatusPill } from "@/components/app/StatusPill";
import type { DemandStatus } from "@/types";

/** Rótulos da curadoria para o vocabulário único de status da demanda. */
export const DEMAND_STATUS: Record<DemandStatus, { label: string; color: string }> = {
  nova: { label: "Nova", color: SLATE },
  em_analise: { label: "Em Análise", color: OCHRE },
  aprovada: { label: "Aprovada", color: MOSS },
  rejeitada: { label: "Rejeitada", color: TERRACOTTA },
  contato_liberado: { label: "Contato liberado", color: NAVY },
};

export const KANBAN_COLS: DemandStatus[] = ["nova", "em_analise", "aprovada", "rejeitada", "contato_liberado"];

export function StatusBadge({ status }: { status: DemandStatus }) {
  const cfg = DEMAND_STATUS[status];
  return (
    <StatusPill color={cfg.color} solid={status === "contato_liberado"}>
      {cfg.label}
    </StatusPill>
  );
}
