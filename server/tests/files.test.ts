import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app";
import { tokenHash } from "../security";
import { configDeTeste, criarConta, prepararBanco } from "./apoio";

const headers = { "x-vitrine-client": "web", origin: "http://localhost:5173" };

test("anexos privados: upload, formato, isolamento, download e exclusão", async (t) => {
  const limpo = await prepararBanco();
  await limpo.close();
  const { app } = await buildApp(configDeTeste());
  t.after(() => app.close());
  const signup = await app.inject({
    method: "POST",
    url: "/api/auth/students",
    headers,
    payload: {
      name: "Aluno",
      email: "files@ic.ufal.br",
      password: "teste12345",
      unit: "IC",
      course: "Ciência da Computação",
      consent: true,
    },
  });
  const cookie = String(signup.headers["set-cookie"]).split(";")[0];
  const boundary = "vitrine-test-boundary";
  const payload = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="certificado.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\narquivo de teste\r\n--${boundary}--\r\n`,
  );
  const uploaded = await app.inject({
    method: "POST",
    url: "/api/attachments/tech",
    headers: { ...headers, cookie, "content-type": `multipart/form-data; boundary=${boundary}` },
    payload,
  });
  assert.equal(uploaded.statusCode, 201, uploaded.body);
  const id = uploaded.json().attachments[0].id;
  const download = await app.inject({ url: `/api/attachments/${id}`, headers: { cookie } });
  assert.equal(download.statusCode, 200);
  assert.match(String(download.headers["content-disposition"]), /attachment/);
  assert.match(download.body, /%PDF-1.4/);
  assert.equal((await app.inject({ url: `/api/attachments/${id}` })).statusCode, 401);
  const other = await app.inject({
    method: "POST",
    url: "/api/auth/students",
    headers,
    payload: {
      name: "Outro",
      email: "other@ic.ufal.br",
      password: "teste12345",
      unit: "IC",
      course: "Ciência da Computação",
      consent: true,
    },
  });
  const otherCookie = String(other.headers["set-cookie"]).split(";")[0];
  assert.equal((await app.inject({ url: `/api/attachments/${id}`, headers: { cookie: otherCookie } })).statusCode, 403);
  assert.equal(
    (
      await app.inject({
        method: "DELETE",
        url: `/api/attachments/${id}`,
        headers: { ...headers, cookie: otherCookie },
      })
    ).statusCode,
    404,
  );
  const invalid = Buffer.from(payload.toString().replace("%PDF-1.4", "not-a-pdf"));
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/api/attachments/tech",
        headers: { ...headers, cookie, "content-type": `multipart/form-data; boundary=${boundary}` },
        payload: invalid,
      })
    ).statusCode,
    400,
  );
  const removed = await app.inject({
    method: "DELETE",
    url: `/api/attachments/${id}`,
    headers: { ...headers, cookie },
  });
  assert.equal(removed.statusCode, 200);
  assert.equal(removed.json().attachments.length, 0);
});

test("briefing acompanha a demanda e portfólio exige contato liberado", async (t) => {
  const clean = await prepararBanco();
  await clean.close();
  const { app, db } = await buildApp(configDeTeste());
  t.after(() => app.close());
  const requester = await app.inject({
    method: "POST",
    url: "/api/auth/requesters",
    headers,
    payload: {
      organization: "Organização de Teste",
      contactName: "Responsável",
      email: "briefing@example.com",
      password: "teste12345",
      city: "Maceió",
      kind: "empresa",
      site: "",
    },
  });
  const requesterCookie = String(requester.headers["set-cookie"]).split(";")[0];
  const student = await app.inject({
    method: "POST",
    url: "/api/auth/students",
    headers,
    payload: {
      name: "Aluno de Teste",
      email: "portfolio@ic.ufal.br",
      password: "teste12345",
      unit: "IC",
      course: "Ciência da Computação",
      consent: true,
    },
  });
  const studentCookie = String(student.headers["set-cookie"]).split(";")[0];
  const studentId = student.json().accounts[0].profileId;
  const created = await app.inject({
    method: "POST",
    url: "/api/demands",
    headers: { ...headers, cookie: requesterCookie },
    payload: {
      title: "Demanda com briefing",
      description: "Descrição",
      area: "Software",
      scope: "Pequeno",
      deadline: "2027-12-01",
      skills: ["React"],
    },
  });
  assert.equal(created.statusCode, 201, created.body);
  const demandId = created.json().demand.id;
  const boundary = "briefing-boundary";
  const pdf = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="briefing.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\nconteudo\r\n--${boundary}--\r\n`,
  );
  const upload = (url: string, cookie: string) =>
    app.inject({
      method: "POST",
      url,
      headers: { ...headers, cookie, "content-type": `multipart/form-data; boundary=${boundary}` },
      payload: pdf,
    });
  assert.equal((await upload(`/api/demands/${demandId}/briefing`, studentCookie)).statusCode, 403);
  const briefing = await upload(`/api/demands/${demandId}/briefing`, requesterCookie);
  assert.equal(briefing.statusCode, 201, briefing.body);
  assert.equal(
    briefing.json().demands.find((entry: { id: string }) => entry.id === demandId).briefing.name,
    "briefing.pdf",
  );
  assert.equal(
    (await app.inject({ url: `/api/demands/${demandId}/briefing`, headers: { cookie: studentCookie } })).statusCode,
    403,
  );
  assert.equal(
    (await app.inject({ url: `/api/demands/${demandId}/briefing`, headers: { cookie: requesterCookie } })).statusCode,
    200,
  );
  await db.sql.run("UPDATE demanda SET status = 'aprovada' WHERE id = $1", [demandId]);
  assert.equal(
    (await app.inject({ url: `/api/demands/${demandId}/briefing`, headers: { cookie: studentCookie } })).statusCode,
    200,
  );

  const portfolio = await upload("/api/attachments/portfolio", studentCookie);
  assert.equal(portfolio.statusCode, 201, portfolio.body);
  const fileId = portfolio.json().attachments[0].id;
  assert.equal(
    (await app.inject({ url: `/api/students/${studentId}/portfolio`, headers: { cookie: requesterCookie } }))
      .statusCode,
    403,
  );
  assert.equal(
    (await app.inject({ url: `/api/attachments/${fileId}`, headers: { cookie: requesterCookie } })).statusCode,
    403,
  );
  await db.sql.run(
    "INSERT INTO interesse (id, demanda_id, estudante_id, origem, status) VALUES ('INT-PORTFOLIO', $1, $2, 'convite', 'contato_liberado')",
    [demandId, studentId],
  );
  const listed = await app.inject({
    url: `/api/students/${studentId}/portfolio`,
    headers: { cookie: requesterCookie },
  });
  assert.equal(listed.statusCode, 200, listed.body);
  assert.equal(listed.json().length, 1);
  assert.equal(
    (await app.inject({ url: `/api/attachments/${fileId}`, headers: { cookie: requesterCookie } })).statusCode,
    200,
  );
  const privateFile = await upload("/api/attachments/tech", studentCookie);
  const privateId = privateFile.json().attachments.find((entry: { category: string }) => entry.category === "tech").id;
  assert.equal(
    (await app.inject({ url: `/api/attachments/${privateId}`, headers: { cookie: requesterCookie } })).statusCode,
    403,
  );
});

test("cookies Secure em produção, expiração e rotação de sessão", async (t) => {
  const limpo = await prepararBanco();
  await criarConta(limpo, {
    id: "curator",
    name: "Curadoria",
    role: "curator",
    email: "curator@example.com",
    senha: "curator12345",
    createdAt: "2026-01-01",
  });
  await limpo.close();
  const { app, db } = await buildApp(configDeTeste({ production: true, origin: "https://vitrine.example" }));
  t.after(() => app.close());
  const login = (cookie?: string) =>
    app.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { ...headers, origin: "https://vitrine.example", ...(cookie ? { cookie } : {}) },
      payload: { email: "curator@example.com", password: "curator12345" },
    });
  const first = await login();
  assert.match(String(first.headers["set-cookie"]), /; Secure/);
  const firstCookie = String(first.headers["set-cookie"]).split(";")[0];
  const second = await login(firstCookie);
  const secondCookie = String(second.headers["set-cookie"]).split(";")[0];
  assert.notEqual(firstCookie, secondCookie);
  assert.equal((await app.inject({ url: "/api/auth/me", headers: { cookie: firstCookie } })).statusCode, 401);
  const rawToken = secondCookie.split("=")[1];
  const sessao = await db.sql.row<{ token_hash: string }>("SELECT token_hash FROM sessao");
  assert.equal(sessao!.token_hash, tokenHash(rawToken));
  await db.sql.run("UPDATE sessao SET expira_em = now() - interval '1 hour'");
  assert.equal((await app.inject({ url: "/api/auth/me", headers: { cookie: secondCookie } })).statusCode, 401);
});
