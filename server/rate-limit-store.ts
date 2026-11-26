import type { FastifyRateLimitStore, FastifyRateLimitStoreCtor } from "@fastify/rate-limit";
import type { Database } from "./db/pool";

interface StoreOptions {
  timeWindow?: number | string;
}

function parseWindowMs(value: number | string | undefined, fallback: number): number {
  if (typeof value === "number" && value > 0) return value;
  if (typeof value === "string") {
    const match = /^(\d+)\s*(ms|s|m|minute|minutes|h|hour|hours)?$/i.exec(value.trim());
    if (match) {
      const n = Number(match[1]);
      const unit = (match[2] ?? "ms").toLowerCase();
      if (unit === "ms") return n;
      if (unit === "s") return n * 1000;
      if (unit === "m" || unit === "minute" || unit === "minutes") return n * 60_000;
      if (unit === "h" || unit === "hour" || unit === "hours") return n * 3_600_000;
    }
  }
  return fallback;
}

/**
 * Store distribuído para `@fastify/rate-limit` sobre o próprio PostgreSQL.
 *
 * Permite múltiplas réplicas e proxies reversos sem depender de Redis: a
 * atualização da janela é atômica (`INSERT ... ON CONFLICT DO UPDATE`), com
 * namespace isolado por rota (`child()`), igual ao store em memória do plugin.
 */
export function createPostgresRateLimitStore(db: Database, defaultWindowMs: number): FastifyRateLimitStoreCtor {
  let childSeq = 0;

  class PostgresRateLimitStore implements FastifyRateLimitStore {
    private readonly windowMs: number;
    private readonly prefix: string;

    constructor(options: StoreOptions = {}, prefix = "global") {
      this.windowMs = parseWindowMs(options.timeWindow, defaultWindowMs);
      this.prefix = prefix;
    }

    incr(key: string, cb: (error: Error | null, result?: { current: number; ttl: number }) => void) {
      const fullKey = `${this.prefix}:${key}`;
      const expiresAt = new Date(Date.now() + this.windowMs).toISOString();
      db.sql
        .row<{ contagem: number; ttl_ms: number }>(
          `INSERT INTO rate_limit_bucket (chave, contagem, expira_em)
           VALUES ($1, 1, $2::timestamptz)
           ON CONFLICT (chave) DO UPDATE SET
             contagem  = CASE WHEN rate_limit_bucket.expira_em <= now() THEN 1 ELSE rate_limit_bucket.contagem + 1 END,
             expira_em = CASE WHEN rate_limit_bucket.expira_em <= now() THEN $2::timestamptz ELSE rate_limit_bucket.expira_em END
           RETURNING contagem, GREATEST(0, EXTRACT(EPOCH FROM (expira_em - now())) * 1000)::int AS ttl_ms`,
          [fullKey, expiresAt],
        )
        .then((row) => {
          cb(null, { current: Number(row?.contagem ?? 1), ttl: Number(row?.ttl_ms ?? this.windowMs) });
        })
        .catch((err: unknown) => {
          cb(err instanceof Error ? err : new Error("Falha no controle de taxa."));
        });
    }

    child(routeOptions: Parameters<FastifyRateLimitStore["child"]>[0]) {
      const opts = routeOptions as unknown as {
        timeWindow?: number | string;
        method?: string | string[];
        url?: string;
        routeInfo?: { method?: string; url?: string };
      };
      const method = Array.isArray(opts.method)
        ? opts.method.join(",")
        : (opts.routeInfo?.method ?? opts.method ?? "ALL");
      const url = opts.routeInfo?.url ?? opts.url;
      const prefix = url ? `${method}:${url}` : `route-${++childSeq}`;
      return new PostgresRateLimitStore({ timeWindow: opts.timeWindow ?? this.windowMs }, prefix);
    }
  }

  return PostgresRateLimitStore as unknown as FastifyRateLimitStoreCtor;
}
