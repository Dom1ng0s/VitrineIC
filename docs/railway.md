# Publicação no Railway

Frontend e backend sobem num processo Node só: a API serve o `dist/` e responde
`/api`. O contrato da API, a configuração e a segurança estão em
[backend.md](backend.md).

O serviço é construído pelo [`Dockerfile`](../Dockerfile) da raiz, e não pelo
Nixpacks: ele fixa o Node 24, instala só as dependências de produção, roda como
usuário sem privilégio e copia as migrações para `build/migrations`, que é onde
o servidor empacotado as procura. O [`railway.json`](../railway.json) declara
esse builder, o healthcheck e a política de reinício.

## O que provisionar

1. **PostgreSQL** — o plugin gerenciado do Railway. Ele publica
   `DATABASE_URL` no projeto; referencie essa variável no serviço da aplicação
   em vez de copiar a string.
2. **Serviço web** — a partir deste repositório, com deploy automático na
   branch `main`.

## Variáveis

Obrigatórias:

| Variável         | Valor                                                            |
| ---------------- | ---------------------------------------------------------------- |
| `NODE_ENV`       | `production`                                                     |
| `DATABASE_URL`   | referência ao PostgreSQL do projeto                              |
| `MAIL_MODE`      | `resend` (o Railway não bloqueia SMTP, mas HTTPS é mais simples) |
| `RESEND_API_KEY` | a chave do Resend                                                |
| `MAIL_FROM`      | remetente em domínio verificado no Resend                        |

Com valor já embutido no `Dockerfile`, redefina só para mudar: `HOST=0.0.0.0`,
`PORT` (o Railway injeta a sua), `TRUST_PROXY=1`, `PG_POOL_MAX=10`.

Opcionais:

- `APP_ORIGIN` — **não precisa no primeiro deploy.** Sem ela, a aplicação deriva
  a origem de `RAILWAY_PUBLIC_DOMAIN`, que a plataforma anuncia. Defina ao
  apontar domínio próprio; ela tem precedência.
- `REQUIRE_VERIFIED_EMAIL` — já é `true` em produção por padrão.
- `DEMO_MODE` — **deixe fora.** Em produção o boot falha se for `true`, de
  propósito: as contas de exemplo nunca devem existir no ar.
- `BOOTSTRAP_CURATOR`, `CURATOR_EMAIL`, `CURATOR_NAME`, `CURATOR_PASSWORD` —
  criam a primeira conta de curadoria no início do processo, já que não há rota
  HTTP de administração. Remova `CURATOR_PASSWORD` depois do primeiro boot.

## Boot e verificação

As migrações rodam no início do processo, sob `pg_advisory_lock`, então duas
instâncias subindo juntas não colidem. O healthcheck é `/api/ready`
(readiness: responde depois que o banco atende), não `/api/health`, que é
liveness e responde mesmo sem banco.

Depois do deploy:

```
curl https://SEU-DOMINIO/api/health   # liveness
curl https://SEU-DOMINIO/api/ready    # readiness, exige o banco
```

`/api/metrics` existe, restrito à coordenação. Toda resposta carrega
`X-Request-Id`, e o erro estruturado repete esse id — é por ele que se acha a
requisição no log.

## Backup

`scripts/pg-backup.mjs` vai na imagem. Com a `DATABASE_URL` do Railway no
ambiente, `pnpm db:backup` grava o dump e `pnpm db:restore` recupera. O Railway
também tira snapshots do plugin PostgreSQL; os dois não se substituem.

## Render

[render.md](render.md) é histórico e descreve a época do SQLite. O
[`render.yaml`](../render.yaml) da raiz, esse sim, está atualizado para
PostgreSQL — publicar no Render continua possível.
