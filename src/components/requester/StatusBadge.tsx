import { MOSS, OCHRE, RED, TERRACOTTA } from "@/styles/tokens";
import { StatusPill } from "@/components/app/StatusPill";
import type { DemandStatus } from "@/types";

/** Rótulos do solicitante para o vocabulário único de status da demanda. */
export const STATUS_MAP: Record<DemandStatus, { label: string; color: string }> = {
  nova: { label: "Em Análise", color: OCHRE },
  em_analise: { label: "Em Análise", color: OCHRE },
  aprovada: { label: "Recebendo interesses", color: RED },
  rejeitada: { label: "Rejeitada", color: TERRACOTTA },
  contato_liberado: { label: "Contato liberado", color: MOSS },
};

export function StatusBadge({ status }: { status: DemandStatus }) {
  const cfg = STATUS_MAP[status];
  return <StatusPill color={cfg.color}>{cfg.label}</StatusPill>;
}
