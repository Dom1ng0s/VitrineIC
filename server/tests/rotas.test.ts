import { test } from "node:test";
import assert from "node:assert/strict";
import type { FastifyInstance, InjectOptions } from "fastify";
import { buildApp } from "../app";
import { configDeTeste, criarConta, prepararBanco } from "./apoio";
import type { ImpactStats, VitrineState } from "@/types/api";
import type { Demand } from "@/types";

/**
 * Rotas que os outros arquivos não cobriam: saúde, indicadores, ranking da
 * curadoria, marcar tudo como lido, autorização do perfil do solicitante,
 * exclusão de demanda pelo dono e as transições de status recusadas.
 */

const headers = { "x-vitrine-client": "web", origin: "http://localhost:5173" };
const studentData = {
  name: "Estudante Rotas",
  email: "rotas-aluno@ic.ufal.br",
  password: "teste12345",
  unit: "IC",
  course: "Ciência da Computação",
  consent: true,
};
const requesterData = {
  organization: "Org Rotas",
  contactName: "Responsável",
  email: "rotas-org@example.com",
  password: "teste12345",
  city: "Maceió",
  kind: "empresa",
  site: "",
};
const demandData = {
  title: "Demanda de rotas",
  description: "Uma demanda para exercitar as rotas.",
  area: "Software",
  scope: "Pequeno",
  deadline: "2027-12-01",
  skills: ["React", "SQL"],
};

const cookieOf = (response: { headers: Record<string, unknown> }) =>
  String(response.headers["set-cookie"]).split(";")[0];
const request = (
  app: FastifyInstance,
  method: InjectOptions["method"],
  url: string,
  payload?: object,
  cookie?: string,
) => app.inject({ method, url, payload, headers: { ...headers, ...(cookie ? { cookie } : {}) } });

async function setup() {
  const limpo = await prepararBanco();
  await criarConta(limpo, {
    id: "curator-rotas",
    email: "curador-rotas@example.com",
    senha: "curator12345",
    name: "Curadoria",
    role: "curator",
  });
  await limpo.close();
  const built = await buildApp(configDeTeste({ demo: false, production: false }));
  const student = await request(built.app, "POST", "/api/auth/students", studentData);
  assert.equal(student.statusCode, 201, student.body);
  const requester = await request(built.app, "POST", "/api/auth/requesters", requesterData);
  assert.equal(requester.statusCode, 201, requester.body);
  const curator = await request(built.app, "POST", "/api/auth/login", {
    email: "curador-rotas@example.com",
    password: "curator12345",
  });
  assert.equal(curator.statusCode, 200, curator.body);
  return {
    ...built,
    studentId: student.json<VitrineState>().accounts[0].profileId,
    studentCookie: cookieOf(student),
    requesterCookie: cookieOf(requester),
    curatorCookie: cookieOf(curator),
  };
}

/** Publica uma demanda e a leva até `aprovada`. */
async function demandaAprovada(c: Awaited<ReturnType<typeof setup>>): Promise<Demand> {
  const criada = await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie);
  assert.equal(criada.statusCode, 201, criada.body);
  const demand = criada.json<{ demand: Demand }>().demand;
  const aprovada = await request(
    c.app,
    "PATCH",
    `/api/demands/${demand.id}/status`,
    { status: "aprovada" },
    c.curatorCookie,
  );
  assert.equal(aprovada.statusCode, 200, aprovada.body);
  return demand;
}

test("saúde e indicadores respondem sem sessão", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());

  const health = await request(c.app, "GET", "/api/health");
  assert.equal(health.statusCode, 200);
  assert.deepEqual(health.json(), { status: "ok" });

  const impact = await request(c.app, "GET", "/api/impact");
  assert.equal(impact.statusCode, 200);
  const stats = impact.json<ImpactStats>();
  assert.deepEqual(Object.keys(stats).sort(), ["byArea", "byCourse", "demands", "projects", "released", "students"]);
  assert.equal(typeof stats.released, "number");
  // Indicador é derivado: sem perfil visível, ninguém é contado.
  assert.equal(stats.students, 0);
  assert.ok(!impact.body.includes("@"), "indicador público não leva e-mail");
});

test("ranking é da curadoria, ordena por aderência e não entrega contato", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);

  await request(c.app, "PATCH", `/api/students/${c.studentId}`, { skills: ["React", "SQL"] }, c.studentCookie);

  const semSessao = await request(c.app, "GET", `/api/demands/${demand.id}/ranking`);
  assert.equal(semSessao.statusCode, 401);
  const comoAluno = await request(c.app, "GET", `/api/demands/${demand.id}/ranking`, undefined, c.studentCookie);
  assert.equal(comoAluno.statusCode, 403);
  const comoSolicitante = await request(
    c.app,
    "GET",
    `/api/demands/${demand.id}/ranking`,
    undefined,
    c.requesterCookie,
  );
  assert.equal(comoSolicitante.statusCode, 403);

  const ranking = await request(c.app, "GET", `/api/demands/${demand.id}/ranking`, undefined, c.curatorCookie);
  assert.equal(ranking.statusCode, 200, ranking.body);
  const linhas = ranking.json<{ student: { id: string; email: string }; score: number }[]>();
  assert.equal(linhas.length, 1, "só perfis visíveis entram no ranking");
  assert.equal(linhas[0].score, 100);
  assert.equal(linhas[0].student.email, "", "o ranking não entrega e-mail do estudante");
  assert.deepEqual(
    [...linhas].sort((a, b) => b.score - a.score).map((l) => l.student.id),
    linhas.map((l) => l.student.id),
  );

  const inexistente = await request(c.app, "GET", "/api/demands/VIC-0000/ranking", undefined, c.curatorCookie);
  assert.equal(inexistente.statusCode, 404);
});

test("perfil sem competência fica fora do ranking", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);

  const ranking = await request(c.app, "GET", `/api/demands/${demand.id}/ranking`, undefined, c.curatorCookie);
  assert.equal(ranking.statusCode, 200);
  assert.deepEqual(ranking.json(), []);
});

test("marcar tudo como lido zera a caixa só de quem pediu", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  await demandaAprovada(c);

  const antes = await request(c.app, "GET", "/api/state", undefined, c.requesterCookie);
  const naoLidas = antes.json<VitrineState>().notifications.filter((n) => n.unread);
  assert.ok(naoLidas.length >= 2, "receber e aprovar a demanda gera avisos");

  const semSessao = await request(c.app, "POST", "/api/notifications/read-all");
  assert.equal(semSessao.statusCode, 401);

  const lido = await request(c.app, "POST", "/api/notifications/read-all", {}, c.requesterCookie);
  assert.equal(lido.statusCode, 200, lido.body);
  assert.deepEqual(
    lido.json<VitrineState>().notifications.filter((n) => n.unread),
    [],
  );

  // A caixa do estudante não é tocada pela ação do solicitante.
  const doAluno = await request(c.app, "POST", "/api/notifications/read-all", {}, c.studentCookie);
  assert.equal(doAluno.statusCode, 200);

  const alheia = await request(
    c.app,
    "POST",
    `/api/notifications/${antes.json<VitrineState>().notifications[0].id}/read`,
    {},
    c.studentCookie,
  );
  assert.equal(alheia.statusCode, 404, "notificação de outra conta não existe para quem não é dono");
});

test("perfil do solicitante só é editável pela própria conta", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());

  assert.equal((await request(c.app, "PATCH", "/api/company", { city: "Arapiraca" })).statusCode, 401);
  assert.equal((await request(c.app, "PATCH", "/api/company", { city: "Arapiraca" }, c.studentCookie)).statusCode, 403);
  assert.equal((await request(c.app, "PATCH", "/api/company", { city: "Arapiraca" }, c.curatorCookie)).statusCode, 403);

  const ok = await request(c.app, "PATCH", "/api/company", { city: "Arapiraca", kind: "professor" }, c.requesterCookie);
  assert.equal(ok.statusCode, 200, ok.body);
  const empresa = ok.json<VitrineState>().companies.find((e) => e.name === requesterData.organization)!;
  assert.equal(empresa.city, "Arapiraca");
  assert.equal(empresa.kind, "professor");
  assert.equal(empresa.type, "Professor ou laboratório", "o rótulo acompanha o tipo");

  assert.equal(
    (await request(c.app, "PATCH", "/api/company", { name: "Outro nome" }, c.requesterCookie)).statusCode,
    400,
    "campo fora do schema é recusado",
  );
});

test("dono exclui a demanda só enquanto ela é nova", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());

  const nova = (await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).json<{ demand: Demand }>()
    .demand;
  assert.equal((await request(c.app, "DELETE", `/api/demands/${nova.id}`, undefined, c.studentCookie)).statusCode, 403);
  const apagada = await request(c.app, "DELETE", `/api/demands/${nova.id}`, undefined, c.requesterCookie);
  assert.equal(apagada.statusCode, 200, apagada.body);
  assert.equal(
    apagada.json<VitrineState>().demands.find((d) => d.id === nova.id),
    undefined,
  );

  const emAnalise = (await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).json<{
    demand: Demand;
  }>().demand;
  await request(c.app, "PATCH", `/api/demands/${emAnalise.id}/status`, { status: "em_analise" }, c.curatorCookie);
  assert.equal(
    (await request(c.app, "DELETE", `/api/demands/${emAnalise.id}`, undefined, c.requesterCookie)).statusCode,
    403,
    "depois da triagem começar, o dono não apaga mais",
  );
  assert.equal(
    (await request(c.app, "DELETE", `/api/demands/${emAnalise.id}`, undefined, c.curatorCookie)).statusCode,
    200,
    "a curadoria apaga em qualquer status",
  );

  assert.equal((await request(c.app, "DELETE", "/api/demands/VIC-0000", undefined, c.curatorCookie)).statusCode, 404);
});

test("transições de status recusadas", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = (await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).json<{
    demand: Demand;
  }>().demand;
  const status = (valor: string, cookie = c.curatorCookie) =>
    request(c.app, "PATCH", `/api/demands/${demand.id}/status`, { status: valor }, cookie);

  assert.equal(
    (await status("contato_liberado")).statusCode,
    400,
    "contato liberado não é status que a curadoria escolhe",
  );
  assert.equal((await status("inventado")).statusCode, 400);
  assert.equal((await status("aprovada", c.requesterCookie)).statusCode, 403);
  assert.equal((await status("aprovada", c.studentCookie)).statusCode, 403);

  assert.equal((await status("nova")).statusCode, 200, "mesmo status é no-op, não erro");
  assert.equal((await status("aprovada")).statusCode, 200);
  assert.equal((await status("nova")).statusCode, 409, "de aprovada não se volta para nova");

  const inexistente = await request(
    c.app,
    "PATCH",
    "/api/demands/VIC-0000/status",
    { status: "aprovada" },
    c.curatorCookie,
  );
  assert.equal(inexistente.statusCode, 404);
});

test("funções da curadoria separam triagem, decisão e leitura", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = (await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).json<{
    demand: Demand;
  }>().demand;
  const status = (valor: string) =>
    request(c.app, "PATCH", `/api/demands/${demand.id}/status`, { status: valor }, c.curatorCookie);
  await c.db.sql.run("UPDATE curador SET funcao_codigo = 'comite' WHERE conta_id = 'curator-rotas'");
  assert.equal((await status("em_analise")).statusCode, 403);
  assert.equal((await status("aprovada")).statusCode, 403);
  assert.equal(
    (await request(c.app, "GET", `/api/demands/${demand.id}/ranking`, undefined, c.curatorCookie)).statusCode,
    200,
  );
  assert.equal(
    (await request(c.app, "DELETE", `/api/demands/${demand.id}`, undefined, c.curatorCookie)).statusCode,
    403,
  );

  await c.db.sql.run("UPDATE curador SET funcao_codigo = 'curador' WHERE conta_id = 'curator-rotas'");
  assert.equal((await status("em_analise")).statusCode, 200);
  assert.equal((await status("aprovada")).statusCode, 403);
  assert.equal(
    (await request(c.app, "DELETE", `/api/demands/${demand.id}`, undefined, c.curatorCookie)).statusCode,
    403,
  );

  await c.db.sql.run("UPDATE curador SET funcao_codigo = 'coordenacao' WHERE conta_id = 'curator-rotas'");
  assert.equal((await status("aprovada")).statusCode, 200);
  assert.equal(
    (await request(c.app, "DELETE", `/api/demands/${demand.id}`, undefined, c.curatorCookie)).statusCode,
    200,
  );
});

test("edição, prioridade e histórico da demanda respeitam autoria e função", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = (await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).json<{
    demand: Demand;
  }>().demand;
  const url = `/api/demands/${demand.id}`;
  assert.equal((await request(c.app, "PATCH", url, { title: "Alterada" }, c.studentCookie)).statusCode, 403);
  assert.equal((await request(c.app, "PATCH", url, { title: "Alterada" }, c.requesterCookie)).statusCode, 200);
  assert.equal(
    (await request(c.app, "PATCH", `${url}/priority`, { priority: "alta" }, c.requesterCookie)).statusCode,
    403,
  );
  await c.db.sql.run("UPDATE curador SET funcao_codigo = 'curador' WHERE conta_id = 'curator-rotas'");
  assert.equal(
    (await request(c.app, "PATCH", `${url}/priority`, { priority: "alta" }, c.curatorCookie)).statusCode,
    403,
  );
  await c.db.sql.run("UPDATE curador SET funcao_codigo = 'coordenacao' WHERE conta_id = 'curator-rotas'");
  assert.equal(
    (await request(c.app, "PATCH", `${url}/priority`, { priority: "alta" }, c.curatorCookie)).statusCode,
    200,
  );
  const updated = await request(
    c.app,
    "PATCH",
    `${url}/status`,
    { status: "rejeitada", observation: "Escopo incompleto" },
    c.curatorCookie,
  );
  assert.equal(updated.statusCode, 200, updated.body);
  const visible = updated.json<VitrineState>().demands.find((entry) => entry.id === demand.id)!;
  assert.equal(visible.priority, "alta");
  assert.equal(visible.statusHistory?.at(-1)?.observation, "Escopo incompleto");
  assert.equal((await request(c.app, "PATCH", url, { title: "Tarde" }, c.requesterCookie)).statusCode, 403);
});

test("equipe e parecer distinguem coordenação e comitê", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = (await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).json<{
    demand: Demand;
  }>().demand;
  const member = await criarConta(c.db, { email: "comite@example.com", senha: "comite12345", role: "curator" });
  await c.db.sql.run("UPDATE curador SET funcao_codigo = 'comite' WHERE conta_id = $1", [member.id]);
  const login = await request(c.app, "POST", "/api/auth/login", { email: member.email, password: "comite12345" });
  const committeeCookie = cookieOf(login);
  assert.equal((await request(c.app, "GET", "/api/curators", undefined, committeeCookie)).statusCode, 200);
  assert.equal((await request(c.app, "GET", "/api/curators", undefined, c.studentCookie)).statusCode, 403);
  assert.equal(
    (
      await request(
        c.app,
        "PATCH",
        `/api/curators/${member.id}`,
        { function: "curador", active: true },
        committeeCookie,
      )
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await request(
        c.app,
        "POST",
        "/api/curators",
        { name: "Outro", email: "outro@example.com", function: "curador" },
        committeeCookie,
      )
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await request(
        c.app,
        "POST",
        "/api/curators",
        { name: "Outro", email: "outro@example.com", function: "curador" },
        c.curatorCookie,
      )
    ).statusCode,
    503,
  );
  assert.equal(
    (await request(c.app, "POST", `/api/demands/${demand.id}/opinions`, { text: "Escopo adequado" }, c.curatorCookie))
      .statusCode,
    403,
  );
  assert.equal(
    (await request(c.app, "POST", `/api/demands/${demand.id}/opinions`, { text: "Escopo adequado" }, committeeCookie))
      .statusCode,
    201,
  );
  assert.equal(
    (await request(c.app, "GET", `/api/demands/${demand.id}/opinions`, undefined, c.curatorCookie)).json<unknown[]>()
      .length,
    1,
  );
  assert.equal(
    (
      await request(
        c.app,
        "PATCH",
        "/api/curators/curator-rotas",
        { function: "comite", active: true },
        c.curatorCookie,
      )
    ).statusCode,
    409,
  );
  assert.equal(
    (
      await request(
        c.app,
        "PATCH",
        `/api/curators/${member.id}`,
        { function: "comite", active: false },
        c.curatorCookie,
      )
    ).statusCode,
    200,
  );
  assert.equal((await request(c.app, "GET", "/api/curators", undefined, committeeCookie)).statusCode, 401);
});

test("coordenação convida integrante por link sem expor senha", async (t) => {
  const c = await setup();
  await c.app.close();
  const sent: string[] = [];
  const built = await buildApp(
    configDeTeste({
      demo: false,
      production: false,
      mail: { mode: "file", directory: ".", from: "contato@ic.ufal.br", port: 587, secure: false },
    }),
    {
      mailer: {
        async send(message) {
          sent.push(message.text);
        },
      },
    },
  );
  t.after(() => built.app.close());
  const payload = { name: "Nova Curadora", email: "nova-curadora@example.com", function: "curador" };
  assert.equal((await request(built.app, "POST", "/api/curators", payload, c.studentCookie)).statusCode, 403);
  const invited = await request(built.app, "POST", "/api/curators", payload, c.curatorCookie);
  assert.equal(invited.statusCode, 201, invited.body);
  assert.equal(invited.json<{ function: string }>().function, "curador");
  assert.equal((await request(built.app, "POST", "/api/curators", payload, c.curatorCookie)).statusCode, 409);
  await built.mail.drain();
  assert.equal(sent.length, 1);
  assert.match(sent[0], /reset-password/);
});

test("parâmetros UUID inválidos devolvem 404", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  assert.equal(
    (await request(c.app, "POST", "/api/notifications/invalido/read", undefined, c.studentCookie)).statusCode,
    404,
  );
  assert.equal(
    (await request(c.app, "POST", "/api/notifications/invalido/reply", { content: "Oi" }, c.studentCookie)).statusCode,
    404,
  );
  assert.equal((await request(c.app, "GET", "/api/attachments/invalido", undefined, c.studentCookie)).statusCode, 404);
  assert.equal(
    (await request(c.app, "DELETE", "/api/attachments/invalido", undefined, c.studentCookie)).statusCode,
    404,
  );
});

test("cota de demandas é por conta e bloqueia a próxima criação", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const first = await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie);
  assert.equal(first.statusCode, 201);
  await c.db.sql.run(
    `INSERT INTO demanda (id, solicitante_id, titulo, descricao, prazo)
     SELECT 'VIC-COTA-' || n, solicitante_id, titulo, descricao, prazo
     FROM demanda CROSS JOIN generate_series(1,49) AS seq(n) WHERE id = $1`,
    [first.json<{ demand: Demand }>().demand.id],
  );
  assert.equal((await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie)).statusCode, 429);
});

test("cota de interesses bloqueia criação após o limite por conta", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);
  assert.equal(
    (await request(c.app, "PATCH", `/api/students/${c.studentId}`, { skills: ["React"] }, c.studentCookie)).statusCode,
    200,
  );
  const accountId = (await c.db.sql.row<{ conta_id: string }>("SELECT conta_id FROM estudante WHERE id = $1", [
    c.studentId,
  ]))!.conta_id;
  await c.db.sql.run(
    `INSERT INTO interesse (id, demanda_id, estudante_id, origem, status, criado_por_conta_id)
     SELECT 'INT-COTA-' || n, $1, $2, 'candidatura', 'recusado_estudante', $3
     FROM generate_series(1,500) AS seq(n)`,
    [demand.id, c.studentId, accountId],
  );
  assert.equal(
    (
      await request(
        c.app,
        "POST",
        "/api/interests",
        { demandId: demand.id, studentId: c.studentId, origin: "candidatura" },
        c.studentCookie,
      )
    ).statusCode,
    429,
  );
});

test("cota de mensagens bloqueia resposta após o limite por conta", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);
  await request(c.app, "PATCH", `/api/students/${c.studentId}`, { skills: ["React"] }, c.studentCookie);
  const created = await request(
    c.app,
    "POST",
    "/api/interests",
    { demandId: demand.id, studentId: c.studentId, origin: "candidatura" },
    c.studentCookie,
  );
  assert.equal(created.statusCode, 201, created.body);
  const interestId = created.json<{ interest: { id: string } }>().interest.id;
  assert.equal(
    (await request(c.app, "POST", `/api/interests/${interestId}/respond`, { accept: true }, c.requesterCookie))
      .statusCode,
    200,
  );
  const accountId = (await c.db.sql.row<{ conta_id: string }>("SELECT conta_id FROM solicitante WHERE nome = $1", [
    requesterData.organization,
  ]))!.conta_id;
  await c.db.sql.run(
    `INSERT INTO mensagem (interesse_id, remetente_conta_id, conteudo)
     SELECT $1, $2, 'Mensagem de teste' FROM generate_series(1,2000)`,
    [interestId, accountId],
  );
  const state = await request(c.app, "GET", "/api/state", undefined, c.requesterCookie);
  const notice = state.json<VitrineState>().notifications.find((n) => n.interestId === interestId)!;
  assert.ok(notice);
  assert.equal(
    (await request(c.app, "POST", `/api/notifications/${notice.id}/reply`, { content: "Oi" }, c.requesterCookie))
      .statusCode,
    429,
  );
});

test("login bloqueia tentativas repetidas da mesma conta", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const credentials = { email: "curador-rotas@example.com", password: "errada123" };
  for (let n = 0; n < 5; n++) {
    assert.equal((await request(c.app, "POST", "/api/auth/login", credentials)).statusCode, 401);
  }
  assert.equal(
    (await request(c.app, "POST", "/api/auth/login", { ...credentials, password: "curator12345" })).statusCode,
    429,
  );
  await c.db.sql.run(
    "UPDATE tentativa_login SET bloqueado_ate = now() - interval '1 second', primeira_falha_em = now() - interval '16 minutes'",
  );
  assert.equal(
    (await request(c.app, "POST", "/api/auth/login", { ...credentials, password: "curator12345" })).statusCode,
    200,
  );
});

test("foto do perfil sai do estado como URL e respeita visibilidade", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const content = Buffer.from("imagem-de-teste");
  const photo = `data:image/png;base64,${content.toString("base64")}`;
  const updated = await request(c.app, "PATCH", `/api/students/${c.studentId}`, { photo }, c.studentCookie);
  assert.equal(updated.statusCode, 200, updated.body);
  const own = updated.json<VitrineState>().students.find((student) => student.id === c.studentId)!;
  assert.equal(own.photo, `/api/students/${c.studentId}/photo`);
  assert.equal((await request(c.app, "GET", own.photo!, undefined, c.studentCookie)).statusCode, 200);
  assert.equal(
    (await request(c.app, "GET", own.photo!, undefined, c.studentCookie)).rawPayload.toString(),
    "imagem-de-teste",
  );
  assert.equal(
    (await request(c.app, "GET", `/api/students/${c.studentId}/photo`, undefined, c.requesterCookie)).statusCode,
    404,
  );
});

test("estado entrega páginas de demandas sem repetir registros", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const first = await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie);
  const id = first.json<{ demand: Demand }>().demand.id;
  await c.db.sql.run(
    `INSERT INTO demanda (id, solicitante_id, titulo, descricao, prazo)
     SELECT 'VIC-PAG-' || n, solicitante_id, titulo, descricao, prazo
     FROM demanda CROSS JOIN generate_series(1,19) AS seq(n) WHERE id = $1`,
    [id],
  );
  const firstPage = (
    await request(c.app, "GET", "/api/state?limit=10", undefined, c.requesterCookie)
  ).json<VitrineState>();
  assert.equal(firstPage.demands.length, 10);
  assert.equal(firstPage.pagination?.nextOffset, 10);
  const secondPage = (
    await request(c.app, "GET", "/api/state?offset=10&limit=10", undefined, c.requesterCookie)
  ).json<VitrineState>();
  assert.equal(secondPage.demands.length, 10);
  assert.equal(secondPage.pagination?.nextOffset, null);
  assert.equal(new Set([...firstPage.demands, ...secondPage.demands].map((d) => d.id)).size, 20);
  assert.equal((await request(c.app, "GET", "/api/state?limit=1000", undefined, c.requesterCookie)).statusCode, 400);
});

test("solicitante cancela demanda sem interesse ativo e não reabre pela triagem", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const created = await request(c.app, "POST", "/api/demands", demandData, c.requesterCookie);
  const id = created.json<{ demand: Demand }>().demand.id;
  const url = `/api/demands/${id}/close`;
  assert.equal((await request(c.app, "POST", url, {}, c.studentCookie)).statusCode, 403);
  assert.equal((await request(c.app, "POST", url, {}, c.curatorCookie)).statusCode, 403);
  const closed = await request(c.app, "POST", url, { reason: "Mudança de escopo" }, c.requesterCookie);
  assert.equal(closed.statusCode, 200, closed.body);
  const demand = closed.json<VitrineState>().demands.find((entry) => entry.id === id)!;
  assert.equal(demand.status, "cancelada");
  assert.equal(demand.statusHistory?.at(-1)?.observation, "Mudança de escopo");
  assert.equal((await request(c.app, "POST", url, {}, c.requesterCookie)).statusCode, 409);
  assert.equal(
    (await request(c.app, "PATCH", `/api/demands/${id}/status`, { status: "nova" }, c.curatorCookie)).statusCode,
    409,
  );
});

test("solicitante encerra demanda depois de liberar contato", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);
  await request(c.app, "PATCH", `/api/students/${c.studentId}`, { skills: ["React"] }, c.studentCookie);
  const created = await request(
    c.app,
    "POST",
    "/api/interests",
    { demandId: demand.id, studentId: c.studentId, origin: "candidatura" },
    c.studentCookie,
  );
  const interestId = created.json<{ interest: { id: string } }>().interest.id;
  await request(c.app, "POST", `/api/interests/${interestId}/respond`, { accept: true }, c.requesterCookie);
  const closed = await request(c.app, "POST", `/api/demands/${demand.id}/close`, {}, c.requesterCookie);
  assert.equal(closed.statusCode, 200, closed.body);
  assert.equal(closed.json<VitrineState>().demands.find((entry) => entry.id === demand.id)?.status, "encerrada");
});

test("solicitante pode convidar outro estudante após liberar um contato", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);
  await request(c.app, "PATCH", `/api/students/${c.studentId}`, { skills: ["React"] }, c.studentCookie);
  const first = await request(
    c.app,
    "POST",
    "/api/interests",
    { demandId: demand.id, studentId: c.studentId, origin: "candidatura" },
    c.studentCookie,
  );
  const interestId = first.json<{ interest: { id: string } }>().interest.id;
  await request(c.app, "POST", `/api/interests/${interestId}/respond`, { accept: true }, c.requesterCookie);
  const secondStudent = await request(c.app, "POST", "/api/auth/students", {
    ...studentData,
    email: "segundo@ic.ufal.br",
  });
  const secondId = secondStudent.json<VitrineState>().accounts[0].profileId;
  await request(c.app, "PATCH", `/api/students/${secondId}`, { skills: ["SQL"] }, cookieOf(secondStudent));
  const invited = await request(
    c.app,
    "POST",
    "/api/interests",
    { demandId: demand.id, studentId: secondId, origin: "convite" },
    c.requesterCookie,
  );
  assert.equal(invited.statusCode, 201, invited.body);
  assert.equal(
    (
      await request(
        c.app,
        "POST",
        "/api/interests",
        { demandId: demand.id, studentId: secondId, origin: "candidatura" },
        cookieOf(secondStudent),
      )
    ).statusCode,
    409,
  );
});

test("tipo do solicitante acompanha a demanda no estado", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const signup = await request(c.app, "POST", "/api/auth/requesters", {
    ...requesterData,
    organization: "Laboratório de Pesquisa",
    email: "laboratorio@example.com",
    kind: "professor",
  });
  assert.equal(signup.statusCode, 201, signup.body);
  const created = await request(c.app, "POST", "/api/demands", demandData, cookieOf(signup));
  assert.equal(created.statusCode, 201, created.body);
  const demand = created
    .json<{ state: VitrineState }>()
    .state.demands.find((entry) => entry.company === "Laboratório de Pesquisa");
  assert.equal(demand?.requesterKind, "professor");
});

test("mensagem pode começar pelo interesse após o aceite duplo", async (t) => {
  const c = await setup();
  t.after(() => c.app.close());
  const demand = await demandaAprovada(c);
  await request(c.app, "PATCH", `/api/students/${c.studentId}`, { skills: ["React"] }, c.studentCookie);
  const created = await request(
    c.app,
    "POST",
    "/api/interests",
    { demandId: demand.id, studentId: c.studentId, origin: "candidatura" },
    c.studentCookie,
  );
  const id = created.json<{ interest: { id: string } }>().interest.id;
  const url = `/api/interests/${id}/messages`;
  assert.equal((await request(c.app, "POST", url, { content: "Antes" }, c.studentCookie)).statusCode, 409);
  await request(c.app, "POST", `/api/interests/${id}/respond`, { accept: true }, c.requesterCookie);
  assert.equal((await request(c.app, "POST", url, { content: "Olá" }, c.curatorCookie)).statusCode, 403);
  const sent = await request(c.app, "POST", url, { content: "Olá" }, c.studentCookie);
  assert.equal(sent.statusCode, 200, sent.body);
  const received = await request(c.app, "GET", "/api/state", undefined, c.requesterCookie);
  assert.ok(received.json<VitrineState>().notifications.some((notice) => notice.content === "Olá"));
});
