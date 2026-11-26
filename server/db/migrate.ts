import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./pool";

const directory = join(dirname(fileURLToPath(import.meta.url)), "migrations");

const hashDe = (sql: string) => createHash("sha256").update(sql).digest("hex");

/**
 * Aplica os arquivos de `migrations/` em ordem de nome, cada um numa transação
 * própria, registrando o que já rodou. Um arquivo aplicado nunca roda de novo.
 *
 * O hash do arquivo aplicado fica guardado: editar uma migração que já rodou
 * não tem efeito no banco de quem já a aplicou, e o silêncio disso produz
 * ambientes com esquemas diferentes sob o mesmo número. Com o hash, a subida
 * para e diz qual arquivo mudou — a correção é sempre uma migração nova.
 *
 * Linhas gravadas antes desta checagem não têm hash; a primeira execução as
 * completa com o conteúdo atual, que é o melhor que dá para afirmar sobre elas.
 */
export async function migrate(db: Database): Promise<string[]> {
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
}
