import { StatusPill } from "./StatusPill";
import { MOSS, OCHRE, TERRACOTTA } from "@/styles/tokens";
import type { InterestOrigin, InterestStatus } from "@/types";

/** Quem está olhando: muda o rótulo ("Aguardando sua resposta" x "Aguardando estudante"). */
export type InterestViewer = "estudante" | "solicitante" | "curadoria";

function label(status: InterestStatus, viewer: InterestViewer, origin?: InterestOrigin) {
  switch (status) {
    case "aguardando_estudante":
      return viewer === "estudante" ? "Aguardando sua resposta" : "Aguardando estudante";
    case "aguardando_solicitante":
      return viewer === "solicitante" ? "Aguardando sua resposta" : "Aguardando solicitante";
    case "contato_liberado":
      return "Contato liberado";
    case "recusado_estudante":
      if (origin === "candidatura") return "Candidatura retirada";
      return viewer === "estudante" ? "Você recusou" : "Recusado pelo estudante";
    case "recusado_solicitante":
      return viewer === "solicitante" ? "Você recusou" : "Recusado pelo solicitante";
  }
}

const COLOR: Record<InterestStatus, string> = {
  aguardando_estudante: OCHRE,
  aguardando_solicitante: OCHRE,
  contato_liberado: MOSS,
  recusado_estudante: TERRACOTTA,
  recusado_solicitante: TERRACOTTA,
};

/** Pílula do andamento de um interesse, com o rótulo do ponto de vista de quem vê. */
export function InterestStatusPill({
  status,
  viewer,
  origin,
}: {
  status: InterestStatus;
  viewer: InterestViewer;
  origin?: InterestOrigin;
}) {
  return <StatusPill color={COLOR[status]}>{label(status, viewer, origin)}</StatusPill>;
}
