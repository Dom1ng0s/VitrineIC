import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { ZodError, z } from "zod";
import { Database } from "./db/pool";
import { readConfig, type Config } from "./config";
import { accountFor, requireCuratorFunction } from "./security";
import { ensure, HttpError } from "./errors";
import { snapshot } from "./db/snapshot";
import { migrate } from "./db/migrate";
import { syncCatalog } from "./db/sync-catalog";
import { authRoutes } from "./auth-routes";
import { domainRoutes } from "./domain-routes";
import { inboxRoutes } from "./inbox-routes";
import { fileRoutes } from "./file-routes";
import { createMailer, MailQueue, type Mailer } from "./mail";
import { accountRoutes } from "./account-routes";
import { curatorRoutes } from "./curator-routes";
import { createPostgresRateLimitStore } from "./rate-limit-store";

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

export async function buildApp(overrides: Partial<Config> = {}, services: { mailer?: Mailer } = {}) {
  const config = { ...readConfig(), ...overrides };
  ensure(!(config.production && config.demo), 500, "Modo de demonstração proibido em produção.");
  ensure(
    !(config.production && config.mail.mode === "file" && !services.mailer),
    500,
    "E-mails em arquivo são exclusivos de desenvolvimento.",
  );
  ensure(
    !config.requireVerifiedEmail || config.mail.mode !== "disabled",
    500,
    "A confirmação de e-mail exige um serviço de envio configurado.",
  );
  const mail = new MailQueue(services.mailer ?? createMailer(config.mail));
  const db = new Database(config.databaseUrl, config.pgPoolMax);
  await migrate(db);
  // Catálogo só na primeira subida; a recarga completa é do `pnpm db:migrate`.
  if (!(await db.sql.row("SELECT 1 FROM competencia LIMIT 1"))) await db.transaction(syncCatalog);
  if (config.production && (await db.sql.row("SELECT 1 FROM conta WHERE id IN ('ACC-001','ACC-002','ACC-003')"))) {
    await db.close();
    throw new Error("Use um banco sem contas de demonstração em produção.");
  }

  const metrics = {
    startedAt: new Date().toISOString(),
    requests: 0,
    errors4xx: 0,
    errors5xx: 0,
  };

  const trustProxy =
    typeof config.trustProxy === "number"
      ? config.trustProxy > 0
        ? (_address: string, hop: number) => hop <= (config.trustProxy as number)
        : false
      : config.trustProxy;

  const app = Fastify({
    logger: config.logger
      ? { redact: ["req.headers.cookie", "req.headers.authorization", "res.headers.set-cookie"] }
      : false,
    bodyLimit: 2 * 1024 * 1024,
    trustProxy,
    genReqId(req) {
      const incoming = req.headers["x-request-id"];
      if (typeof incoming === "string" && /^[A-Za-z0-9._-]{8,64}$/.test(incoming)) return incoming;
      return randomUUID();
    },
  });
  await app.register(cookie);
  await app.register(rateLimit, {
    max: 240,
    timeWindow: 60_000,
    store: createPostgresRateLimitStore(db, 60_000),
  });
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 0, parts: 1 } });
  app.addHook("onClose", async () => {
    await mail.drain();
    await db.close();
  });
  app.addHook("onRequest", async (request, reply) => {
    reply
      .header("X-Request-Id", request.id)
      .header("X-Content-Type-Options", "nosniff")
      .header("Referrer-Policy", "same-origin")
      .header("X-Frame-Options", "DENY")
      .header("Content-Security-Policy", CSP)
      .header("Permissions-Policy", PERMISSIONS_POLICY);
    if (config.production) reply.header("Strict-Transport-Security", "max-age=31536000");
    if (!request.url.startsWith("/api/")) return;
    reply.header("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      // Cabeçalho não simples impede CSRF inclusive em multipart; nenhuma origem recebe CORS.
      ensure(request.headers["x-vitrine-client"] === "web", 403, "Cabeçalho de segurança ausente.");
      ensure(!request.headers.origin || request.headers.origin === config.origin, 403, "Origem não autorizada.");
      ensure(request.headers["sec-fetch-site"] !== "cross-site", 403, "Requisição entre sites não autorizada.");
    }
  });
  app.addHook("onResponse", async (_request, reply) => {
    metrics.requests += 1;
    if (reply.statusCode >= 500) metrics.errors5xx += 1;
    else if (reply.statusCode >= 400) metrics.errors4xx += 1;
  });
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError)
      return reply
        .code(400)
        .send({ error: "Confira os dados enviados.", fields: error.flatten().fieldErrors, requestId: request.id });
    const status =
      error instanceof HttpError
        ? error.statusCode
        : typeof error === "object" && error && "statusCode" in error
          ? Number(error.statusCode)
          : 500;
    if (status >= 500) {
      request.log.error(
        { err: error, requestId: request.id, method: request.method, url: request.url },
        "Erro interno",
      );
    }
    const message =
      status >= 500
        ? "Não foi possível concluir a operação."
        : error instanceof Error
          ? error.message
          : "Requisição inválida.";
    return reply.code(status >= 400 && status < 600 ? status : 500).send({ error: message, requestId: request.id });
  });
  /** Liveness probe: verifica se o processo HTTP responde. */
  app.get("/api/health", async () => ({ status: "ok" }));
  /** Readiness probe: verifica se o banco PostgreSQL responde. */
  app.get("/api/ready", async (_request, reply) => {
    try {
      await db.sql.row("SELECT 1");
      return { status: "ready" };
    } catch {
      return reply.code(503).send({ status: "unavailable" });
    }
  });
  /** Métricas operacionais restritas à coordenação. */
  app.get("/api/metrics", async (request) => {
    await requireCuratorFunction(db, request, ["coordenacao"], config);
    return {
      ...metrics,
      uptimeSeconds: Math.round(process.uptime()),
      pool: {
        total: db.pool.totalCount,
        idle: db.pool.idleCount,
        waiting: db.pool.waitingCount,
        max: config.pgPoolMax,
      },
    };
  });
  app.get<{ Querystring: { offset?: string; limit?: string } }>("/api/state", async (request) => {
    const query = z
      .object({
        offset: z.coerce.number().int().min(0).default(0),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .strict()
      .parse(request.query);
    return snapshot(db.sql, config, await accountFor(db, request), query);
  });
  app.get("/api/impact", async () => (await snapshot(db.sql, config)).impact);
  await authRoutes(app, db, config, mail);
  accountRoutes(app, db, config, mail);
  domainRoutes(app, db, config);
  curatorRoutes(app, db, config, mail);
  inboxRoutes(app, db, config);
  fileRoutes(app, db, config);
  const dist = resolve("dist");
  if (existsSync(dist)) await app.register(staticFiles, { root: dist, prefix: "/" });
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api/") || request.method !== "GET" || !existsSync(resolve(dist, "index.html")))
      return reply.code(404).send({ error: "Rota não encontrada." });
    return reply.sendFile("index.html");
  });
  return { app, db, mail };
}
