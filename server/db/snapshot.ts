import type { Sql } from "./pool";
import type { Config } from "../config";
import type { StoredAccount } from "./types";
import type { Attachment, ImpactStats, Notification, VitrineState } from "@/types/api";
import type { Demand, Interest, Student } from "@/types";
import type { Company } from "@/data/companies";
import { SQL_DEMANDA, SQL_ESTUDANTE, SQL_INTERESSE, comoEstudante, contas, limpar, solicitantes } from "./repositories";
import { visibleToRequester } from "@/lib/interest";

/**
 * Estado que a API devolve, montado por consultas filtradas.
 *
 * A versão anterior varria students, demands, interests, companies, accounts e
 * notifications inteiras e filtrava em JavaScript. Aqui cada recorte vai ao
 * banco já restrito ao que a conta pode ver, e os indicadores são agregados
 * pelo próprio PostgreSQL. Ver docs/mapa-de-queries.md.
 */

/** Caixa de uma conta: usa notificacao_caixa, não varre a tabela. */
const LIMITE_NOTIFICACOES = 200;

async function lerInteressesVisiveis(sql: Sql, conta?: StoredAccount): Promise<Interest[]> {
  if (!conta) return [];
  if (conta.role === "curator") {
    return (await sql.rows<Interest>(`${SQL_INTERESSE} ORDER BY i.criado_em DESC`)).map(limpar);
  }
  if (conta.role === "student") {
    return (
      await sql.rows<Interest>(`${SQL_INTERESSE} WHERE i.estudante_id = $1 ORDER BY i.criado_em DESC`, [
        conta.profileId,
      ])
    ).map(limpar);
  }
  const doSolicitante = (
    await sql.rows<Interest>(
      `${SQL_INTERESSE}
     WHERE i.demanda_id IN (SELECT d.id FROM demanda d JOIN solicitante s ON s.id = d.solicitante_id WHERE s.nome = $1)
     ORDER BY i.criado_em DESC`,
      [conta.profileId],
    )
  ).map(limpar);
  // A sugestão só aparece ao solicitante depois que o estudante aceita.
  return doSolicitante.filter(visibleToRequester);
}

async function lerIndicadores(sql: Sql, exigirVerificado: boolean): Promise<ImpactStats> {
  const visivel = `
    EXISTS (SELECT 1 FROM estudante_competencia ec WHERE ec.estudante_id = e.id)
    ${exigirVerificado ? "AND co.email_confirmado_em IS NOT NULL" : ""}`;
  const base = `FROM estudante e JOIN conta co ON co.id = e.conta_id WHERE ${visivel}`;

  const totais = (await sql.row<{ liberados: string; projetos: string; demandas: string; estudantes: string }>(`
    SELECT
      (SELECT count(*) FROM interesse WHERE status = 'contato_liberado')          AS liberados,
      (SELECT count(*) FROM projeto_estudante p
         WHERE p.estudante_id IN (SELECT e.id ${base}))                            AS projetos,
      (SELECT count(*) FROM demanda)                                              AS demandas,
      (SELECT count(*) ${base})                                                   AS estudantes
  `))!;

  const porArea = await sql.rows<{ chave: string; total: string }>(`
    SELECT COALESCE(a.nome, '') AS chave, count(*) AS total
    FROM demanda d LEFT JOIN area a ON a.id = d.area_id
    GROUP BY 1 ORDER BY count(*) DESC, 1`);

  const porCurso = await sql.rows<{ chave: string; total: string }>(`
    SELECT COALESCE(cu.nome, '') AS chave, count(*) AS total
    FROM estudante e
    JOIN conta co ON co.id = e.conta_id
    LEFT JOIN curso cu ON cu.id = e.curso_id
    WHERE ${visivel}
    GROUP BY 1 ORDER BY count(*) DESC, 1`);

  const pares = (linhas: { chave: string; total: string }[]): [string, number][] =>
    linhas.map((l) => [l.chave, Number(l.total)]);

  const metasLinhas = await sql.rows<{ chave: string; valor_meta: string }>(
    "SELECT chave, valor_meta FROM meta_indicador",
  );
  const targets: ImpactStats["targets"] = {};
  for (const row of metasLinhas) {
    if (row.chave === "released" || row.chave === "projects" || row.chave === "demands" || row.chave === "students") {
      targets[row.chave] = Number(row.valor_meta);
    }
  }

  const datas = await sql.row<{ inicio: string | null; fim: string | null }>(`
    SELECT
      to_char(LEAST(
        (SELECT min(enviada_em) FROM demanda),
        (SELECT min(criado_em) FROM interesse),
        (SELECT min(criado_em) FROM projeto_estudante)
      ), 'YYYY-MM-DD') AS inicio,
      to_char(GREATEST(
        (SELECT max(enviada_em) FROM demanda),
        (SELECT max(criado_em) FROM interesse),
        (SELECT max(criado_em) FROM projeto_estudante)
      ), 'YYYY-MM-DD') AS fim
  `);

  const formatMonth = (iso: string) =>
    new Date(`${iso}T12:00:00Z`)
      .toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" })
      .replace(".", "");
  let period = "";
  if (datas?.inicio && datas?.fim) {
    const start = formatMonth(datas.inicio);
    const end = formatMonth(datas.fim);
    period = start === end ? start : `${start} — ${end}`;
  }

  return {
    released: Number(totais.liberados),
    projects: Number(totais.projetos),
    demands: Number(totais.demandas),
    students: Number(totais.estudantes),
    period,
    targets,
    byArea: pares(porArea),
    byCourse: pares(porCurso),
  };
}

async function lerNotificacoes(sql: Sql, conta: StoredAccount): Promise<Notification[]> {
  const linhas = await sql.rows<Notification & { interestStatus: string | null }>(
    `
    SELECT
      n.id, n.tipo AS type,
      COALESCE(rem.nome, 'VitrineIC')            AS "from",
      COALESCE(d.titulo, n.assunto, '')          AS project,
      to_char(n.criada_em, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS time,
      (n.lida_em IS NULL)                        AS unread,
      COALESCE(n.conteudo, m.conteudo, '')       AS content,
      n.demanda_id                               AS "demandId",
      n.interesse_id                             AS "interestId",
      i.status                                   AS "interestStatus"
    FROM notificacao n
    LEFT JOIN mensagem m   ON m.id = n.mensagem_id
    LEFT JOIN conta rem    ON rem.id = m.remetente_conta_id
    LEFT JOIN demanda d    ON d.id = n.demanda_id
    LEFT JOIN interesse i  ON i.id = n.interesse_id
    WHERE n.destinatario_conta_id = $1
    ORDER BY n.criada_em DESC
    LIMIT ${LIMITE_NOTIFICACOES}`,
    [conta.id],
  );

  return linhas.map(({ interestStatus, ...n }) =>
    limpar({
      ...n,
      canReply: interestStatus === "contato_liberado" && conta.role !== "curator",
    }),
  );
}

export async function snapshot(
  sql: Sql,
  config: Config,
  conta?: StoredAccount,
  page?: { offset: number; limit: number },
): Promise<VitrineState> {
  const interesses = await lerInteressesVisiveis(sql, conta);
  const idsDeEstudantes = [...new Set(interesses.map((i) => i.studentId))];
  const idsDeDemandas = [...new Set(interesses.map((i) => i.demandId))];
  const curador = conta?.role === "curator";
  const proprioEstudante = conta?.role === "student" ? conta.profileId : null;
  const proprioSolicitante = conta?.role === "requester" ? conta.profileId : null;

  const pageClause = page ? ` LIMIT ${page.limit + 1} OFFSET ${page.offset}` : "";
  const estudantesBrutos = (
    await sql.rows<Student>(
      `
    ${SQL_ESTUDANTE}
    WHERE (
      (EXISTS (SELECT 1 FROM estudante_competencia ec WHERE ec.estudante_id = e.id)
        ${config.requireVerifiedEmail ? "AND co.email_confirmado_em IS NOT NULL" : ""})
      OR e.id = $1
      OR e.id = ANY($2::text[])
    )
    ORDER BY e.id${pageClause}`,
      [proprioEstudante, idsDeEstudantes],
    )
  ).map(comoEstudante);

  const demandasBrutas = (
    await sql.rows<Demand>(
      `
    ${SQL_DEMANDA}
    WHERE $1::boolean
       OR s.nome = $2
       OR d.status IN ('aprovada', 'contato_liberado')
       OR d.id = ANY($3::text[])
    ORDER BY d.enviada_em DESC, d.id${pageClause}`,
      [curador, proprioSolicitante, idsDeDemandas],
    )
  ).map(limpar);
  const estudantes = page ? estudantesBrutos.slice(0, page.limit) : estudantesBrutos;
  const demandas = page ? demandasBrutas.slice(0, page.limit) : demandasBrutas;

  // Contato só aparece depois do aceite dos dois lados — nem para a curadoria.
  const liberados = new Set(interesses.filter((i) => i.status === "contato_liberado").map((i) => i.studentId));
  const empresasLiberadas = new Set(
    (
      await sql.rows<{ nome: string }>(
        `SELECT DISTINCT s.nome FROM interesse i JOIN demanda d ON d.id = i.demanda_id
       JOIN solicitante s ON s.id = d.solicitante_id
       WHERE i.id = ANY($1::text[]) AND i.status = 'contato_liberado'`,
        [interesses.map((i) => i.id)],
      )
    ).map((row) => row.nome),
  );

  const empresasBrutas = (await solicitantes.todos(sql)).map((empresa: Company) => ({
    ...empresa,
    contactEmail:
      proprioSolicitante === empresa.name || (proprioEstudante && empresasLiberadas.has(empresa.name))
        ? empresa.contactEmail
        : "",
  }));
  const empresas = page ? empresasBrutas.slice(page.offset, page.offset + page.limit) : empresasBrutas;
  const interessesDaPagina = page ? interesses.slice(page.offset, page.offset + page.limit) : interesses;
  const hasNext =
    !!page &&
    (estudantesBrutos.length > page.limit ||
      demandasBrutas.length > page.limit ||
      empresasBrutas.length > page.offset + page.limit ||
      interesses.length > page.offset + page.limit);

  const anexos: Attachment[] =
    conta?.role === "student"
      ? await sql.rows<Attachment>(
          `SELECT id, nome AS name, categoria AS category, tamanho_bytes AS size
         FROM anexo_estudante WHERE estudante_id = $1 ORDER BY enviado_em DESC`,
          [conta.profileId],
        )
      : [];

  return {
    accounts: conta ? [contas.publica(conta)] : [],
    session: conta ? { accountId: conta.id } : null,
    students: estudantes.map((estudante) => {
      const proprio = proprioEstudante === estudante.id;
      const contato = proprio || (!!proprioSolicitante && liberados.has(estudante.id));
      const { matricula, certificados, ...publico } = estudante;
      return {
        ...publico,
        email: contato ? estudante.email : "",
        ...(proprio ? { matricula, certificados } : {}),
      } as Student;
    }),
    companies: empresas,
    demands: demandas.map((demanda) => {
      if (curador || proprioSolicitante === demanda.company) return demanda;
      const { statusHistory: _history, ...publica } = demanda;
      return publica;
    }),
    interests: interessesDaPagina.map((interesse) => {
      if (conta?.role !== "student") return interesse;
      const { refusalReason: _motivo, responseHistory: _history, ...semMotivo } = interesse;
      return semMotivo as Interest;
    }),
    inProject: Object.fromEntries(estudantes.map((e) => [e.id, !!e.inProject])),
    notifications: conta ? await lerNotificacoes(sql, conta) : [],
    attachments: anexos,
    impact: await lerIndicadores(sql, config.requireVerifiedEmail),
    demo: config.demo,
    auth: { emailEnabled: config.mail.mode !== "disabled", verificationRequired: config.requireVerifiedEmail },
    ...(page ? { pagination: { nextOffset: hasNext ? page.offset + page.limit : null } } : {}),
  };
}
