import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./pool";

const here = join(dirname(fileURLToPath(import.meta.url)), "migrations");
const directory = existsSync(here) ? here : resolve("server/db/migrations");

/** Chave fixa para `pg_advisory_lock`: serializa migrações entre réplicas no boot. */
const MIGRATION_LOCK_KEY = 741852963;

const hashDe = (sql: string) => createHash("sha256").update(sql).digest("hex");

/**
 * Aplica os arquivos de `migrations/` em ordem de nome, cada um numa transação
 * própria, registrando o que já rodou. Um arquivo aplicado nunca roda de novo.
 *
 * Usa `pg_advisory_lock` numa conexão dedicada para impedir corrida quando
 * múltiplas réplicas sobem simultaneamente.
 */
export async function migrate(db: Database): Promise<string[]> {
  const lockClient = await db.pool.connect();
  await lockClient.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
  try {
    await db.sql.run(`
      CREATE TABLE IF NOT EXISTS schema_migration (
        versao      text PRIMARY KEY,
        aplicada_em timestamptz NOT NULL DEFAULT now()
      )
    `);
    await db.sql.run("ALTER TABLE schema_migration ADD COLUMN IF NOT EXISTS hash text");

    const arquivos = (await readdir(directory)).filter((f) => f.endsWith(".sql")).sort();
    const aplicadas = new Map(
      (await db.sql.rows<{ versao: string; hash: string | null }>("SELECT versao, hash FROM schema_migration")).map(
        (r) => [r.versao, r.hash],
      ),
    );
    const novas: string[] = [];

    for (const arquivo of arquivos) {
      const sql = await readFile(join(directory, arquivo), "utf8");
      const hash = hashDe(sql);

      if (aplicadas.has(arquivo)) {
        const guardado = aplicadas.get(arquivo);
        if (guardado === null) {
          await db.sql.run("UPDATE schema_migration SET hash = $1 WHERE versao = $2", [hash, arquivo]);
          continue;
        }
        if (guardado !== hash) {
          throw new Error(
            `A migração ${arquivo} mudou depois de aplicada neste banco. ` +
              "Restaure o arquivo e corrija o esquema numa migração nova.",
          );
        }
        continue;
      }

      await db.transaction(async (tx) => {
        await tx.run(sql);
        await tx.run("INSERT INTO schema_migration(versao, hash) VALUES($1, $2)", [arquivo, hash]);
      });
      novas.push(arquivo);
    }
    return novas;
  } finally {
    try {
      await lockClient.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
    } finally {
      lockClient.release();
    }
  }
}
