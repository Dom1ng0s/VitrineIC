import type { Sql } from "./pool";

export const loginIsBlocked = async (sql: Sql, accountId: string) =>
  !!(await sql.row("SELECT 1 FROM tentativa_login WHERE conta_id = $1 AND bloqueado_ate > now()", [accountId]));

export const clearLoginAttempts = (sql: Sql, accountId: string) =>
  sql.run("DELETE FROM tentativa_login WHERE conta_id = $1", [accountId]);

export const recordFailedLogin = (sql: Sql, accountId: string) =>
  sql.run(
    `INSERT INTO tentativa_login (conta_id, falhas) VALUES ($1, 1)
     ON CONFLICT (conta_id) DO UPDATE SET
       falhas = CASE WHEN tentativa_login.primeira_falha_em < now() - interval '15 minutes'
                     THEN 1 ELSE tentativa_login.falhas + 1 END,
       primeira_falha_em = CASE WHEN tentativa_login.primeira_falha_em < now() - interval '15 minutes'
                               THEN now() ELSE tentativa_login.primeira_falha_em END,
       bloqueado_ate = CASE WHEN tentativa_login.primeira_falha_em >= now() - interval '15 minutes'
                            AND tentativa_login.falhas >= 4 THEN now() + interval '15 minutes'
                            ELSE NULL END`,
    [accountId],
  );
