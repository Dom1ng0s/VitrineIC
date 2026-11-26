import type { DemandStatus } from "@/types";

/** Transições escolhidas na triagem. Encerramento pelo solicitante usa rota própria. */
export const DEMAND_TRANSITIONS: Record<DemandStatus, DemandStatus[]> = {
  nova: ["em_analise", "aprovada", "rejeitada"],
  em_analise: ["nova", "aprovada", "rejeitada"],
  aprovada: ["em_analise", "rejeitada"],
  rejeitada: ["nova", "em_analise"],
  contato_liberado: [],
  cancelada: [],
  encerrada: [],
};

export function canTriageTransition(
  current: DemandStatus,
  target: DemandStatus,
  curatorFunction: "curador" | "coordenacao" | "comite",
) {
  return (
    DEMAND_TRANSITIONS[current].includes(target) &&
    (curatorFunction === "coordenacao" ||
      (curatorFunction === "curador" && (target === "nova" || target === "em_analise")))
  );
}
