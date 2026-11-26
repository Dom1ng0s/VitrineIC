import type { FastifyInstance } from "fastify";
import type { Database } from "./db/pool";
import type { Config } from "./config";
import { requireAccount } from "./security";
import { snapshot } from "./db/snapshot";
import { ensure, ensureUuid } from "./errors";
import { messageSchema } from "./schemas";
import { contas, demandas, interesses } from "./db/repositories";
import { criarMensagem, criarNotificacao, marcarNotificacaoLida, marcarTodasLidas } from "./db/mutations";
import { checkAccountQuota } from "./db/quotas";
import type { Sql } from "./db/pool";
import type { StoredAccount } from "./db/types";

async function sendToContact(tx: Sql, account: StoredAccount, interestId: string, content: string) {
  const interest = await interesses.porId(tx, interestId);
  ensure(interest, 404, "Interesse não encontrado.");
  ensure(interest.status === "contato_liberado", 409, "Mensagens ficam disponíveis após o aceite dos dois lados.");
  const demand = (await demandas.porId(tx, interest.demandId))!;
  ensure(
    (account.role === "student" && account.profileId === interest.studentId) ||
      (account.role === "requester" && account.profileId === demand.company),
    403,
    "Você não participa deste contato.",
  );
  const recipient =
    account.role === "student"
      ? await contas.doSolicitante(tx, demand.company)
      : await contas.doEstudante(tx, interest.studentId);
  ensure(recipient, 409, "O destinatário ainda não tem conta na plataforma.");
  await checkAccountQuota(tx, account.id, "messages");
  const messageId = await criarMensagem(tx, interest.id, account.id, content);
  await criarNotificacao(tx, {
    destinatarioContaId: recipient.id,
    tipo: "MENSAGEM",
    demandaId: demand.id,
    interesseId: interest.id,
    mensagemId: messageId,
  });
}

export function inboxRoutes(app: FastifyInstance, db: Database, config: Config) {
  app.post<{ Params: { id: string } }>("/api/notifications/:id/read", async (request) => {
    ensureUuid(request.params.id, "Notificação");
    const account = await requireAccount(db, request);
    const existe = await db.sql.row("SELECT 1 FROM notificacao WHERE id = $1 AND destinatario_conta_id = $2", [
      request.params.id,
      account.id,
    ]);
    ensure(existe, 404, "Notificação não encontrada.");
    await marcarNotificacaoLida(db.sql, request.params.id, account.id);
    return snapshot(db.sql, config, account);
  });

  app.post("/api/notifications/read-all", async (request) => {
    const account = await requireAccount(db, request);
    await marcarTodasLidas(db.sql, account.id);
    return snapshot(db.sql, config, account);
  });

  app.post<{ Params: { id: string } }>("/api/notifications/:id/reply", async (request) => {
    ensureUuid(request.params.id, "Notificação");
    const account = await requireAccount(db, request);
    const data = messageSchema.parse(request.body);
    await db.transaction(async (tx) => {
      const notificacao = await tx.row<{ interesse_id: string | null }>(
        "SELECT interesse_id FROM notificacao WHERE id = $1 AND destinatario_conta_id = $2",
        [request.params.id, account.id],
      );
      ensure(notificacao, 404, "Notificação não encontrada.");

      ensure(notificacao.interesse_id, 409, "Esta notificação não permite resposta.");
      await sendToContact(tx, account, notificacao.interesse_id, data.content);
      await marcarNotificacaoLida(tx, request.params.id, account.id);
    });
    return snapshot(db.sql, config, account);
  });

  app.post<{ Params: { id: string } }>("/api/interests/:id/messages", async (request) => {
    const account = await requireAccount(db, request);
    const data = messageSchema.parse(request.body);
    await db.transaction((tx) => sendToContact(tx, account, request.params.id, data.content));
    return snapshot(db.sql, config, account);
  });
}
