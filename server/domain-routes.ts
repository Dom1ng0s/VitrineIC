import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Database } from "./db/pool";
import type { Config } from "./config";
import { accountFor, requireAccount, requireCuratorFunction, requireVerifiedAccount } from "./security";
import { ensure } from "./errors";
import { snapshot } from "./db/snapshot";
import { contas, demandas, estudantes, interesses, solicitantes } from "./db/repositories";
import {
  apagarDemanda,
  apagarProjeto,
  mudarStatusDaDemanda,
  mudarStatusDoInteresse,
  registrarResposta,
  salvarConta,
  salvarDemanda,
  salvarEstudante,
  salvarInteresse,
  salvarProjeto,
  salvarSolicitante,
} from "./db/mutations";
import {
  companyPatchSchema,
  closeDemandSchema,
  courseValid,
  demandSchema,
  interestSchema,
  projectSchema,
  prioritySchema,
  responseSchema,
  statusSchema,
  studentPatchSchema,
} from "./schemas";
import { initialStatus, nextStatus, turnOf, visibleToRequester } from "@/lib/interest";
import { isProfileVisible } from "@/lib/profile";
import { scoreStudent } from "@/lib/match";
import { canTriageTransition } from "@/lib/demand-status";
import { REQUESTER_KIND_LABEL } from "@/data/companies";
import { notificar, notificarInteresse } from "./notifications";
import type { Demand, Interest } from "@/types";
import { checkAccountQuota } from "./db/quotas";

export function domainRoutes(app: FastifyInstance, db: Database, config: Config) {
  const estado = async (request: FastifyRequest) => snapshot(db.sql, config, await requireAccount(db, request));

  app.get<{ Params: { id: string } }>("/api/students/:id/photo", async (request, reply) => {
    const photo = await estudantes.foto(db.sql, request.params.id);
    const account = await accountFor(db, request);
    ensure(
      photo && (account?.id === photo.accountId || (photo.visible && (!config.requireVerifiedEmail || photo.verified))),
      404,
      "Foto não encontrada.",
    );
    const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(photo.photo ?? "");
    ensure(match, 404, "Foto não encontrada.");
    return reply.type(`image/${match[1]}`).send(Buffer.from(match[2], "base64"));
  });

  app.patch<{ Params: { id: string } }>("/api/students/:id", async (request) => {
    const account = await requireAccount(db, request, "student");
    ensure(account.profileId === request.params.id, 403, "Você só pode editar seu perfil.");
    const patch = studentPatchSchema.parse(request.body);
    await db.transaction(async (tx) => {
      const atual = (await estudantes.porId(tx, account.profileId))!;
      const proximo = { ...atual, ...patch };
      ensure(courseValid(proximo), 400, "Curso inválido para a unidade.");
      await salvarEstudante(tx, proximo, account.id);
      if (patch.name) await salvarConta(tx, { ...account, name: patch.name });
    });
    return estado(request);
  });

  app.patch("/api/company", async (request) => {
    const account = await requireAccount(db, request, "requester");
    const patch = companyPatchSchema.parse(request.body);
    await db.transaction(async (tx) => {
      const atual = (await solicitantes.porNome(tx, account.profileId))!;
      await salvarSolicitante(
        tx,
        {
          ...atual,
          ...patch,
          type: patch.kind ? REQUESTER_KIND_LABEL[patch.kind] : atual.type,
        },
        account.id,
      );
      if (patch.contactName) await salvarConta(tx, { ...account, name: patch.contactName });
    });
    return estado(request);
  });

  app.post("/api/projects", async (request, reply) => {
    const account = await requireVerifiedAccount(db, request, config, "student");
    const data = projectSchema.parse(request.body);
    const project = { ...data, id: `PRJ-${randomUUID()}` };
    await db.transaction(async (tx) => {
      const total = await tx.row<{ c: string }>("SELECT count(*) c FROM projeto_estudante WHERE estudante_id = $1", [
        account.profileId,
      ]);
      ensure(Number(total!.c) < 100, 409, "Limite de 100 projetos por perfil.");
      await salvarProjeto(tx, account.profileId, project);
    });
    reply.code(201);
    return { state: await estado(request), project };
  });

  app.put<{ Params: { id: string } }>("/api/projects/:id", async (request) => {
    const account = await requireVerifiedAccount(db, request, config, "student");
    const patch = projectSchema.parse(request.body);
    await db.transaction(async (tx) => {
      const existe = await tx.row("SELECT 1 FROM projeto_estudante WHERE id = $1 AND estudante_id = $2", [
        request.params.id,
        account.profileId,
      ]);
      ensure(existe, 404, "Projeto não encontrado.");
      await salvarProjeto(tx, account.profileId, { ...patch, id: request.params.id });
    });
    return estado(request);
  });

  app.delete<{ Params: { id: string } }>("/api/projects/:id", async (request) => {
    const account = await requireAccount(db, request, "student");
    const removidos = await apagarProjeto(db.sql, request.params.id, account.profileId);
    ensure(removidos > 0, 404, "Projeto não encontrado.");
    return estado(request);
  });

  app.post("/api/demands", async (request, reply) => {
    const account = await requireVerifiedAccount(db, request, config, "requester");
    const data = demandSchema.parse(request.body);
    const demand: Demand = {
      ...data,
      id: `VIC-${new Date().getFullYear()}-${randomUUID()}`,
      company: account.profileId,
      submitted: new Date().toISOString(),
      status: "nova",
      priority: "normal",
    };
    await db.transaction(async (tx) => {
      await checkAccountQuota(tx, account.id, "demands");
      await salvarDemanda(tx, demand);
      await notificar(
        tx,
        account.id,
        demand.title,
        "Sua demanda foi recebida e está aguardando a curadoria.",
        demand.id,
      );
    });
    reply.code(201);
    return { state: await estado(request), demand };
  });

  app.patch<{ Params: { id: string } }>("/api/demands/:id", async (request) => {
    const account = await requireVerifiedAccount(db, request, config, "requester");
    const patch = demandSchema.partial().parse(request.body);
    ensure(Object.keys(patch).length > 0, 400, "Informe ao menos um campo para alterar.");
    await db.transaction(async (tx) => {
      const current = await demandas.porId(tx, request.params.id);
      ensure(current, 404, "Demanda não encontrada.");
      ensure(
        current.company === account.profileId && current.status === "nova",
        403,
        "Esta demanda não pode ser editada.",
      );
      await salvarDemanda(tx, { ...current, ...patch });
    });
    return estado(request);
  });

  app.patch<{ Params: { id: string } }>("/api/demands/:id/priority", async (request) => {
    await requireCuratorFunction(db, request, ["coordenacao"], config);
    const { priority } = prioritySchema.parse(request.body);
    const current = await demandas.porId(db.sql, request.params.id);
    ensure(current, 404, "Demanda não encontrada.");
    await db.sql.run("UPDATE demanda SET prioridade = $2 WHERE id = $1", [current.id, priority]);
    return estado(request);
  });

  app.post<{ Params: { id: string } }>("/api/demands/:id/close", async (request) => {
    const account = await requireVerifiedAccount(db, request, config, "requester");
    const body = request.body === undefined ? {} : request.body;
    const { reason } = closeDemandSchema.parse(body);
    await db.transaction(async (tx) => {
      const demand = await demandas.porId(tx, request.params.id);
      ensure(demand, 404, "Demanda não encontrada.");
      ensure(demand.company === account.profileId, 403, "Você não pode encerrar esta demanda.");
      ensure(!["cancelada", "encerrada"].includes(demand.status), 409, "A demanda já foi encerrada.");
      const closed = demand.status === "contato_liberado";
      if (!closed)
        ensure(!(await interesses.existeAtivoNaDemanda(tx, demand.id)), 409, "A demanda tem interesses ativos.");
      await mudarStatusDaDemanda(tx, demand.id, closed ? "encerrada" : "cancelada", account.id, reason);
    });
    return estado(request);
  });

  app.patch<{ Params: { id: string } }>("/api/demands/:id/status", async (request) => {
    const { status, observation } = statusSchema.parse(request.body);
    const account = await requireCuratorFunction(
      db,
      request,
      status === "aprovada" || status === "rejeitada" ? ["coordenacao"] : ["curador", "coordenacao"],
      config,
    );
    await db.transaction(async (tx) => {
      const demanda = await demandas.porId(tx, request.params.id);
      ensure(demanda, 404, "Demanda não encontrada.");
      ensure(demanda.status !== "contato_liberado", 409, "Uma demanda com contato liberado não volta à triagem.");
      if (demanda.status === status) return;
      ensure(
        canTriageTransition(demanda.status, status, account.curatorFunction ?? "comite"),
        409,
        "Transição de status inválida.",
      );
      ensure(
        !(await interesses.existeAtivoNaDemanda(tx, demanda.id)),
        409,
        "A demanda tem interesses ativos e não pode voltar à triagem.",
      );
      await mudarStatusDaDemanda(tx, demanda.id, status, account.id, observation);
      const dono = await contas.doSolicitante(tx, demanda.company);
      if (dono) {
        await notificar(
          tx,
          dono.id,
          demanda.title,
          `O status da demanda mudou para ${status.replaceAll("_", " ")}.`,
          demanda.id,
        );
      }
    });
    return estado(request);
  });

  app.delete<{ Params: { id: string } }>("/api/demands/:id", async (request) => {
    const account = await requireAccount(db, request);
    await db.transaction(async (tx) => {
      const demanda = await demandas.porId(tx, request.params.id);
      ensure(demanda, 404, "Demanda não encontrada.");
      const isCoordinator =
        account.role === "curator"
          ? !!(await tx.row("SELECT 1 FROM curador WHERE conta_id = $1 AND funcao_codigo = 'coordenacao' AND ativo", [
              account.id,
            ]))
          : false;
      ensure(
        isCoordinator ||
          (account.role === "requester" && account.profileId === demanda.company && demanda.status === "nova"),
        403,
        "Você não pode excluir esta demanda.",
      );
      ensure(
        !(await interesses.existeNaDemanda(tx, demanda.id)),
        409,
        "Demandas com histórico de interesses não podem ser excluídas.",
      );
      await apagarDemanda(tx, demanda.id);
    });
    return estado(request);
  });

  app.get<{ Params: { id: string } }>("/api/demands/:id/ranking", async (request) => {
    await requireCuratorFunction(db, request, ["curador", "coordenacao", "comite"]);
    const demanda = await demandas.porId(db.sql, request.params.id);
    ensure(demanda, 404, "Demanda não encontrada.");
    // Só o que o ranking precisa: nada de montar o estado inteiro para descartá-lo.
    const candidatos = await estudantes.visiveis(db.sql);
    return candidatos
      .map((student) => ({ student: { ...student, email: "" }, score: scoreStudent(student, demanda) }))
      .sort((a, b) => b.score - a.score);
  });

  app.post("/api/interests", async (request, reply) => {
    const account = await requireVerifiedAccount(db, request, config);
    const data = interestSchema.parse(request.body);
    const interesse = await db.transaction(async (tx) => {
      const demanda = await demandas.porId(tx, data.demandId);
      const estudante = await estudantes.porId(tx, data.studentId);
      ensure(demanda && estudante, 404, "Demanda ou estudante não encontrado.");
      ensure(
        demanda.status === "aprovada" || (demanda.status === "contato_liberado" && data.origin === "convite"),
        409,
        "Esta demanda não está aberta para novos interesses.",
      );
      ensure(isProfileVisible(estudante), 409, "O estudante precisa cadastrar ao menos uma competência.");
      if (config.requireVerifiedEmail) {
        const conta = await contas.doEstudante(tx, estudante.id);
        ensure(conta?.emailVerifiedAt, 409, "O estudante precisa confirmar o e-mail antes de receber interesses.");
      }
      ensure(
        (data.origin === "candidatura" && account.role === "student" && account.profileId === estudante.id) ||
          (data.origin === "convite" && account.role === "requester" && account.profileId === demanda.company) ||
          (data.origin === "sugestao" &&
            account.role === "curator" &&
            !!(await tx.row(
              "SELECT 1 FROM curador WHERE conta_id = $1 AND funcao_codigo IN ('curador', 'coordenacao') AND ativo",
              [account.id],
            ))),
        403,
        "Você não pode criar este interesse.",
      );

      const existente = await interesses.ativoDoPar(tx, demanda.id, estudante.id);
      if (existente) {
        ensure(
          account.role !== "requester" || visibleToRequester(existente),
          409,
          "Não foi possível criar outro interesse para este perfil.",
        );
        return existente;
      }
      await checkAccountQuota(tx, account.id, "interests");
      const criado: Interest = {
        ...data,
        id: `INT-${randomUUID()}`,
        status: initialStatus(data.origin),
        createdAt: new Date().toISOString(),
      };
      await salvarInteresse(tx, criado, account.id);
      await notificarInteresse(tx, criado);
      return criado;
    });
    reply.code(201);
    return { state: await estado(request), interest: interesse };
  });

  app.post<{ Params: { id: string } }>("/api/interests/:id/respond", async (request) => {
    const account = await requireVerifiedAccount(db, request, config);
    const data = responseSchema.parse(request.body);
    await db.transaction(async (tx) => {
      const interesse = await interesses.porId(tx, request.params.id);
      ensure(interesse, 404, "Interesse não encontrado.");
      const demanda = (await demandas.porId(tx, interesse.demandId))!;
      const lado =
        account.role === "student" && account.profileId === interesse.studentId
          ? "estudante"
          : account.role === "requester" && account.profileId === demanda.company
            ? "solicitante"
            : null;
      ensure(lado, 403, "Você não participa deste interesse.");
      ensure(turnOf(interesse.status) === lado, 409, "Este interesse não aguarda sua resposta.");
      ensure(demanda.status === "aprovada" || demanda.status === "contato_liberado", 409, "Demanda indisponível.");

      const status = nextStatus(interesse.status, interesse.origin, lado, data.accept);
      await registrarResposta(tx, interesse.id, lado, data.accept, data.refusalReason);
      await mudarStatusDoInteresse(tx, interesse.id, status);
      if (status === "contato_liberado") {
        await mudarStatusDaDemanda(tx, demanda.id, "contato_liberado", account.id);
      }
      await notificarInteresse(tx, { ...interesse, status });
    });
    return estado(request);
  });
}
