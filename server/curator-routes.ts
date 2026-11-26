import { randomBytes, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Database } from "./db/pool";
import type { Config } from "./config";
import type { MailQueue } from "./mail";
import { requireCuratorFunction, hashPassword } from "./security";
import { ensure } from "./errors";
import { contas, demandas } from "./db/repositories";
import { salvarConta } from "./db/mutations";
import {
  addCommitteeOpinion,
  changeCurator,
  committeeOpinions,
  countActiveCoordinators,
  curatorMember,
  curatorMembers,
  lockCuratorTeam,
} from "./db/curators";
import { emailSchema } from "./schemas";
import { requestAccountMail } from "./account-tokens";

const functionSchema = z.enum(["curador", "coordenacao", "comite"]);
const inviteSchema = z
  .object({ name: z.string().trim().min(1).max(150), email: emailSchema, function: functionSchema })
  .strict();
const memberSchema = z.object({ function: functionSchema, active: z.boolean() }).strict();
const opinionSchema = z.object({ text: z.string().trim().min(1).max(3000) }).strict();

export function curatorRoutes(app: FastifyInstance, db: Database, config: Config, mail: MailQueue) {
  app.get("/api/curators", async (request) => {
    await requireCuratorFunction(db, request, ["curador", "coordenacao", "comite"]);
    return curatorMembers(db.sql);
  });

  app.post("/api/curators", async (request, reply) => {
    await requireCuratorFunction(db, request, ["coordenacao"], config);
    ensure(config.mail.mode !== "disabled", 503, "Configure o envio de e-mail para convidar a equipe.");
    const data = inviteSchema.parse(request.body);
    const account = {
      id: `ACC-${randomUUID()}`,
      email: data.email,
      name: data.name,
      role: "curator" as const,
      profileId: "",
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(randomBytes(32).toString("hex")),
    };
    await db.transaction(async (tx) => {
      ensure(!(await contas.porEmail(tx, data.email)), 409, "Já existe uma conta com este e-mail.");
      await salvarConta(tx, account);
      await changeCurator(tx, account.id, data.function, true);
    });
    await requestAccountMail(db, config, mail, account, "reset_password", () =>
      app.log.error("Falha ao entregar convite à curadoria."),
    );
    if (config.requireVerifiedEmail) {
      await requestAccountMail(db, config, mail, account, "verify_email", () =>
        app.log.error("Falha ao entregar confirmação à curadoria."),
      );
    }
    reply.code(201);
    return curatorMember(db.sql, account.id);
  });

  app.patch<{ Params: { id: string } }>("/api/curators/:id", async (request) => {
    await requireCuratorFunction(db, request, ["coordenacao"], config);
    const data = memberSchema.parse(request.body);
    await db.transaction(async (tx) => {
      await lockCuratorTeam(tx);
      const current = await curatorMember(tx, request.params.id);
      ensure(current, 404, "Integrante não encontrado.");
      if (current.active && current.function === "coordenacao" && (!data.active || data.function !== "coordenacao")) {
        ensure((await countActiveCoordinators(tx)) > 1, 409, "A equipe precisa manter uma coordenação ativa.");
      }
      await changeCurator(tx, request.params.id, data.function, data.active);
    });
    return curatorMember(db.sql, request.params.id);
  });

  app.get<{ Params: { id: string } }>("/api/demands/:id/opinions", async (request) => {
    await requireCuratorFunction(db, request, ["curador", "coordenacao", "comite"]);
    ensure(await demandas.porId(db.sql, request.params.id), 404, "Demanda não encontrada.");
    return committeeOpinions(db.sql, request.params.id);
  });

  app.post<{ Params: { id: string } }>("/api/demands/:id/opinions", async (request, reply) => {
    const account = await requireCuratorFunction(db, request, ["comite"], config);
    const data = opinionSchema.parse(request.body);
    ensure(await demandas.porId(db.sql, request.params.id), 404, "Demanda não encontrada.");
    await addCommitteeOpinion(db.sql, request.params.id, account.id, data.text);
    reply.code(201);
    return committeeOpinions(db.sql, request.params.id);
  });
}
