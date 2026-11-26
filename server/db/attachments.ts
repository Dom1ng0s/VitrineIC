import type { Sql } from "./pool";

export const demandBriefing = (sql: Sql, demandId: string) =>
  sql.row<{ name: string; content: Buffer }>(
    "SELECT nome AS name, conteudo AS content FROM anexo_demanda WHERE demanda_id = $1",
    [demandId],
  );

export const saveDemandBriefing = (sql: Sql, demandId: string, name: string, content: Buffer) =>
  sql.run(
    `INSERT INTO anexo_demanda (demanda_id, nome, mime, conteudo, tamanho_bytes)
     VALUES ($1,$2,'application/pdf',$3,$4)
     ON CONFLICT (demanda_id) DO UPDATE SET
       nome = excluded.nome, conteudo = excluded.conteudo,
       tamanho_bytes = excluded.tamanho_bytes, enviado_em = now()`,
    [demandId, name, content, content.length],
  );

export const removeDemandBriefing = (sql: Sql, demandId: string) =>
  sql.run("DELETE FROM anexo_demanda WHERE demanda_id = $1", [demandId]);

export const portfolioFiles = (sql: Sql, studentId: string) =>
  sql.rows<{ id: string; name: string; size: number }>(
    `SELECT id, nome AS name, tamanho_bytes AS size
     FROM anexo_estudante WHERE estudante_id = $1 AND categoria = 'portfolio'
     ORDER BY enviado_em DESC`,
    [studentId],
  );

export const requesterCanViewPortfolio = async (sql: Sql, requesterName: string, studentId: string) =>
  !!(await sql.row(
    `SELECT 1 FROM interesse i JOIN demanda d ON d.id = i.demanda_id
     JOIN solicitante s ON s.id = d.solicitante_id
     WHERE i.estudante_id = $1 AND s.nome = $2 AND i.status = 'contato_liberado' LIMIT 1`,
    [studentId, requesterName],
  ));
