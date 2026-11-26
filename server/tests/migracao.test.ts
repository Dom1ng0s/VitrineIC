import { test } from "node:test";
import assert from "node:assert/strict";
import { migrate } from "../db/migrate";
import { prepararBanco } from "./apoio";

/**
 * A trava de checksum existe para impedir que uma migração já aplicada seja
 * editada: o banco de quem já rodou não muda, e ambientes acabam com esquemas
 * diferentes sob o mesmo número.
 */
test("migração aplicada não roda de novo e não pode mudar depois", async (t) => {
  const db = await prepararBanco();
  t.after(() => db.close());

  assert.deepEqual(await migrate(db), [], "rodar outra vez não aplica nada");

  const linha = await db.sql.row<{ versao: string; hash: string }>(
    "SELECT versao, hash FROM schema_migration ORDER BY versao LIMIT 1",
  );
  assert.ok(linha?.hash, "o hash do arquivo fica guardado");

  await db.sql.run("UPDATE schema_migration SET hash = $1 WHERE versao = $2", ["conteudo-diferente", linha.versao]);
  await assert.rejects(() => migrate(db), /mudou depois de aplicada/, "arquivo editado interrompe a subida");

  // Linha antiga, de antes da trava: a primeira execução completa o hash.
  await db.sql.run("UPDATE schema_migration SET hash = NULL WHERE versao = $1", [linha.versao]);
  assert.deepEqual(await migrate(db), []);
  const restaurada = await db.sql.row<{ hash: string }>("SELECT hash FROM schema_migration WHERE versao = $1", [
    linha.versao,
  ]);
  assert.equal(restaurada?.hash, linha.hash);
});
