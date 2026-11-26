import type { Sql } from "./pool";
import { ensure } from "../errors";

type QuotaKind = "demands" | "interests" | "messages";

const limits = {
  demands: { max: 50, period: "30 dias" },
  interests: { max: 500, period: "30 dias" },
  messages: { max: 2000, period: "24 horas" },
} as const;

/** Chamar dentro da mesma transação que cria o registro. O lock serializa a cota por conta. */
export async function checkAccountQuota(sql: Sql, accountId: string, kind: QuotaKind) {
  await sql.row("SELECT id FROM conta WHERE id = $1 FOR UPDATE", [accountId]);
  const queries: Record<QuotaKind, string> = {
    demands: `SELECT count(*) AS total FROM demanda d JOIN solicitante s ON s.id = d.solicitante_id
              WHERE s.conta_id = $1 AND d.enviada_em > now() - interval '30 days'`,
    interests: `SELECT count(*) AS total FROM interesse
                WHERE criado_por_conta_id = $1 AND criado_em > now() - interval '30 days'`,
    messages: `SELECT count(*) AS total FROM mensagem
               WHERE remetente_conta_id = $1 AND enviada_em > now() - interval '24 hours'`,
  };
  const total = Number((await sql.row<{ total: string }>(queries[kind], [accountId]))!.total);
  ensure(total < limits[kind].max, 429, `Limite de ${limits[kind].max} registros em ${limits[kind].period} atingido.`);
}
