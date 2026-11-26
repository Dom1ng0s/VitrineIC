import { test } from "node:test";
import assert from "node:assert/strict";
import { contas } from "../db/repositories";
import { prepararBanco } from "./apoio";
import { bootstrapCurator } from "../curator";
import { verifyPassword } from "../security";
import { readConfig, hostDeEscuta } from "../config";

test("Render usa origem pública automática, permite domínio próprio e preserva validação de produção", () => {
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: "production",
    RENDER: "true",
    RENDER_EXTERNAL_URL: "https://vitrineic-teste.onrender.com",
    MAIL_MODE: "disabled",
    REQUIRE_VERIFIED_EMAIL: "false",
    DATABASE_URL: "postgresql://usuario:senha@db.example.com:5432/vitrineic",
  };
  assert.equal(readConfig(env).origin, "https://vitrineic-teste.onrender.com");
  env.APP_ORIGIN = "https://vitrine.example.com";
  assert.equal(readConfig(env).origin, "https://vitrine.example.com");
  env.APP_ORIGIN = "http://inseguro.example.com";
  assert.throws(() => readConfig(env), /HTTPS/);
  env.APP_ORIGIN = "";
  env.RENDER = "false";
  assert.throws(() => readConfig(env), /HTTPS/);
  env.APP_ORIGIN = "https://vitrine.example.com";
  env.REQUIRE_VERIFIED_EMAIL = "true";
  assert.throws(() => readConfig(env), /envio de e-mail/);
  env.MAIL_MODE = "resend";
  assert.throws(() => readConfig(env), /RESEND_API_KEY/);
  env.RESEND_API_KEY = "chave-de-teste";
  env.MAIL_FROM = "vitrine@example.com";
  assert.equal(readConfig(env).mail.mode, "resend");

  // PostgreSQL: produção nunca cai no padrão local, e a URL precisa ser postgres.
  const semBanco = { ...env };
  delete semBanco.DATABASE_URL;
  assert.throws(() => readConfig(semBanco), /DATABASE_URL/);
  assert.throws(() => readConfig({ ...env, DATABASE_URL: "mysql://u:s@host/db" }), /postgres/);
  assert.equal(
    readConfig({ ...env, DATABASE_URL: "postgres://u:s@host:5432/db" }).databaseUrl,
    "postgres://u:s@host:5432/db",
  );
  assert.match(readConfig({ NODE_ENV: "development" }).databaseUrl, /^postgresql:\/\//);
});

test("endereço de escuta acompanha a plataforma e tolera colchetes", () => {
  // O Railway roteia por IPv6: 0.0.0.0 faria a sonda receber connection refused.
  assert.equal(hostDeEscuta({ RAILWAY_ENVIRONMENT: "production" }), "::");
  assert.equal(hostDeEscuta({ RAILWAY_PUBLIC_DOMAIN: "x.up.railway.app" }), "::");
  assert.equal(hostDeEscuta({ RENDER: "true" }), "0.0.0.0");
  // Sem plataforma, nada de expor o processo por engano.
  assert.equal(hostDeEscuta({}), "127.0.0.1");
  // HOST explícito vence, e o formato com colchetes dos painéis não vira nome de host.
  assert.equal(hostDeEscuta({ HOST: "0.0.0.0", RAILWAY_ENVIRONMENT: "production" }), "0.0.0.0");
  assert.equal(hostDeEscuta({ HOST: "[::]" }), "::");
  assert.equal(hostDeEscuta({ HOST: " [::1] " }), "::1");
});

test("Railway deriva a origem pública do domínio que a plataforma anuncia", () => {
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: "production",
    RAILWAY_PUBLIC_DOMAIN: "vitrineic-production.up.railway.app",
    MAIL_MODE: "disabled",
    REQUIRE_VERIFIED_EMAIL: "false",
    DATABASE_URL: "postgresql://usuario:senha@db.example.com:5432/vitrineic",
  };
  // O Railway anuncia só o domínio; o esquema entra aqui.
  assert.equal(readConfig(env).origin, "https://vitrineic-production.up.railway.app");
  // Domínio próprio tem precedência sobre o que a plataforma anuncia.
  assert.equal(readConfig({ ...env, APP_ORIGIN: "https://vitrine.example.com" }).origin, "https://vitrine.example.com");
  // Sem domínio nenhum, produção continua barrada.
  const semDominio = { ...env };
  delete semDominio.RAILWAY_PUBLIC_DOMAIN;
  assert.throws(() => readConfig(semDominio), /HTTPS/);
});

test("bootstrap cria somente curadoria, exige opt-in e nunca redefine credenciais existentes", async (t) => {
  const db = await prepararBanco();
  t.after(() => db.close());
  const env = {
    CURATOR_EMAIL: "curadoria@example.com",
    CURATOR_NAME: "Curadoria",
    CURATOR_PASSWORD: "senha-teste-forte",
  };
  const conta = () => contas.porEmail(db.sql, env.CURATOR_EMAIL);

  assert.equal(await bootstrapCurator(db, env), false);
  assert.equal(await conta(), undefined, "sem opt-in nada é criado");

  assert.equal(await bootstrapCurator(db, { ...env, BOOTSTRAP_CURATOR: "true" }), true);
  const criada = (await conta())!;
  assert.equal(criada.role, "curator");
  assert.ok(await verifyPassword(env.CURATOR_PASSWORD, criada.passwordHash));
  assert.equal(criada.emailVerifiedAt, undefined);

  assert.equal(
    await bootstrapCurator(db, { ...env, BOOTSTRAP_CURATOR: "true", CURATOR_PASSWORD: "outra-senha-forte" }),
    false,
    "rodar de novo não redefine a senha",
  );
  assert.equal((await conta())!.passwordHash, criada.passwordHash);

  // Conta existente que não é da curadoria nunca é promovida.
  await db.sql.run("UPDATE conta SET papel = 'student' WHERE id = $1", [criada.id]);
  await assert.rejects(() => bootstrapCurator(db, { ...env, BOOTSTRAP_CURATOR: "true" }), /já está cadastrado/);
  assert.equal((await conta())!.role, "student");

  await assert.rejects(() => bootstrapCurator(db, { BOOTSTRAP_CURATOR: "true" }));
});
