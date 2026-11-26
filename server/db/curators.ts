import type { Sql } from "./pool";
import type { CuratorFunction } from "../security";

export interface CuratorMember {
  accountId: string;
  name: string;
  email: string;
  function: CuratorFunction;
  active: boolean;
}

export const curatorMembers = (sql: Sql) =>
  sql.rows<CuratorMember>(
    `SELECT c.id AS "accountId", c.nome AS name, c.email,
            cur.funcao_codigo AS function, cur.ativo AS active
     FROM curador cur JOIN conta c ON c.id = cur.conta_id
     ORDER BY c.nome, c.id`,
  );

export const curatorMember = (sql: Sql, id: string) =>
  sql.row<CuratorMember>(
    `SELECT c.id AS "accountId", c.nome AS name, c.email,
            cur.funcao_codigo AS function, cur.ativo AS active
     FROM curador cur JOIN conta c ON c.id = cur.conta_id WHERE c.id = $1`,
    [id],
  );

export const countActiveCoordinators = async (sql: Sql) =>
  Number(
    (await sql.row<{ total: string }>(
      "SELECT count(*) AS total FROM curador WHERE funcao_codigo = 'coordenacao' AND ativo",
    ))!.total,
  );

export const lockCuratorTeam = (sql: Sql) => sql.run("LOCK TABLE curador IN SHARE ROW EXCLUSIVE MODE");

export const changeCurator = (sql: Sql, id: string, role: CuratorFunction, active: boolean) =>
  sql.run("UPDATE curador SET funcao_codigo = $2, ativo = $3 WHERE conta_id = $1", [id, role, active]);

export const addCommitteeOpinion = (sql: Sql, demandId: string, accountId: string, text: string) =>
  sql.run("INSERT INTO parecer_comite (demanda_id, curador_conta_id, texto) VALUES ($1,$2,$3)", [
    demandId,
    accountId,
    text,
  ]);

export const committeeOpinions = (sql: Sql, demandId: string) =>
  sql.rows<{ id: string; demandId: string; authorId: string; author: string; text: string; createdAt: string }>(
    `SELECT p.id, p.demanda_id AS "demandId", p.curador_conta_id AS "authorId",
            c.nome AS author, p.texto AS text, p.criado_em AS "createdAt"
     FROM parecer_comite p JOIN conta c ON c.id = p.curador_conta_id
     WHERE p.demanda_id = $1 ORDER BY p.criado_em, p.id`,
    [demandId],
  );
