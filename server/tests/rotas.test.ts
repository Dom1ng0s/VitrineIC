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
