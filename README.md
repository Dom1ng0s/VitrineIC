# VitrineIC

Plataforma de projetos e demandas da universidade, criada no Instituto de
Computação para as disciplinas de Programação 3 e ACE 1.

O frontend React está conectado a uma API TypeScript com Fastify e PostgreSQL,
em esquema 3FN ([modelo de dados](docs/modelo-dados-3fn.md)). Contas, sessões,
perfis, projetos, demandas, interesses, notificações e anexos são persistidos
no servidor.

O que falta para o projeto estar completo está em
[docs/plano-de-completude.md](docs/plano-de-completude.md).

## Executar

Requer Node 22.13+ ou 24 LTS e pnpm 10.34.3.

```powershell
pnpm install
Copy-Item .env.example .env
pnpm db:init
pnpm dev
```

Abra **http://localhost:5173**. A API usa a porta 3001.

`pnpm db:init` cria um cluster PostgreSQL local só deste projeto, na porta
5433, com os bancos `vitrineic` e `vitrineic_test`; `pnpm db:up` e
`pnpm db:down` ligam e desligam. As migrações são aplicadas na subida da API.
O banco começa vazio.

Para carregar os exemplos, configure `DEMO_MODE=true` no `.env` e execute
`pnpm db:seed` antes de iniciar. Essa operação exige banco vazio.

| Perfil      | E-mail de exemplo     | Senha de exemplo |
| ----------- | --------------------- | ---------------- |
| Estudante   | estudante@ic.ufal.br  | demo1234         |
| Solicitante | contato@techbr.com.br | demo1234         |
| Curadoria   | curadoria@ic.ufal.br  | demo1234         |

As contas de exemplo são exclusivas do desenvolvimento. Senhas cadastradas
são armazenadas com scrypt; a sessão usa cookie HttpOnly. Não há cadastro
público de curadoria. Consulte [criação de curadores e configuração](docs/backend.md).

## Fluxos

- **Público:** catálogo de projetos, estudantes com competências e indicadores
  agregados. E-mails de contato não são públicos.
- **Estudante:** cadastro institucional, onboarding, perfil, projetos,
  candidatura, resposta a convites, notificações e anexos privados.
- **Solicitante:** cadastro da organização, demandas, convites, resposta a
  candidaturas, equipe com contatos liberados e mensagens.
- **Curadoria:** triagem de demandas, ranking, sugestão com justificativa e
  acompanhamento de interesses.

Candidatura pressupõe o aceite do estudante; convite pressupõe o aceite do
solicitante. Sugestão da curadoria exige primeiro o estudante e depois o
solicitante. Os contatos só são enviados pela API após aceite duplo.
O algoritmo ordena os perfis; a decisão da curadoria continua humana.

Os projetos do portfólio e da vitrine compartilham a mesma base. Os indicadores
são derivados do banco. Notificações correspondem a operações reais e
mensagens entre as partes ficam disponíveis após a liberação do contato.

Recuperação de senha está disponível no login. **Conta e segurança** permite
confirmar o e-mail, trocar senha e sair de todas as sessões. Em desenvolvimento,
`MAIL_MODE=file` grava as mensagens em `var/mail`, sem envio externo.

## Comandos

| Comando                              | Finalidade                                           |
| ------------------------------------ | ---------------------------------------------------- |
| `pnpm dev`                           | API e Vite com atualização automática                |
| `pnpm dev:api` / `pnpm dev:web`      | Executar uma camada separadamente                    |
| `pnpm typecheck`                     | Tipos do frontend e backend                          |
| `pnpm lint`                          | ESLint no frontend e no backend (`lint:fix` corrige) |
| `pnpm format`                        | Prettier (`format:check` só verifica)                |
| `pnpm test`                          | Toda a suíte: frontend e API                         |
| `pnpm test:web`                      | Testes do frontend, sem banco (`test:watch` observa) |
| `pnpm test:api`                      | Testes de integração da API; exige `vitrineic_test`  |
| `pnpm build`                         | Tipos e builds de produção                           |
| `pnpm start`                         | API e frontend compilados na mesma porta             |
| `pnpm db:init` / `db:up` / `db:down` | Cluster PostgreSQL local do projeto                  |
| `pnpm db:migrate`                    | Aplicar migrações sem subir a API                    |
| `pnpm db:seed`                       | Carga explícita de exemplos em desenvolvimento       |
| `pnpm curator:create`                | Criar curador usando variáveis de ambiente           |

O backup é manual, com `pg_dump`; não há script no projeto. Automatizá-lo é
item da fase 7 do plano de completude.

## Estrutura

| Diretório             | Conteúdo                                                              |
| --------------------- | --------------------------------------------------------------------- |
| `src/components`      | Telas React                                                           |
| `src/lib`             | Cliente da API, cache, autenticação e regras compartilhadas           |
| `src/types`           | Tipos do domínio e respostas da API                                   |
| `src/data`            | Catálogos, identidade institucional e sementes fictícias              |
| `server`              | API, validações, autorização, banco e comandos administrativos        |
| `server/tests`        | Testes de integração da API                                           |
| `src/**/*.test.ts(x)` | Testes do frontend, ao lado do que testam                             |
| `docs/backend.md`     | Configuração, endpoints, regras e operação                            |
| `context`             | Contexto do produto; alguns documentos registram o protótipo anterior |

## Publicação

Frontend e backend são servidos juntos por um único processo Node: a API
entrega `dist/` e responde `/api`. Veja [o guia de operação](docs/backend.md)
para o contrato da API, a configuração e a segurança.

A publicação está preparada para PostgreSQL gerenciado. O `Dockerfile` da raiz
constrói a imagem; `railway.json` e `render.yaml` declaram builder, healthcheck
(`/api/ready`) e variáveis em cada plataforma. O deploy exige `DATABASE_URL`,
`MAIL_MODE` configurado e origem pública em HTTPS — no Railway e no Render ela é
derivada do domínio que a própria plataforma anuncia, e `APP_ORIGIN` só é
necessária com domínio próprio.

Guias: [docs/railway.md](docs/railway.md) e, para o Render, o `render.yaml` com
[docs/backend.md](docs/backend.md). [docs/render.md](docs/render.md) é histórico.

O CI (`.github/workflows/ci.yml`) roda typecheck, lint, testes e build em cada
pull request, com um PostgreSQL de serviço para os testes de integração.

A navegação continua por estado React; links de acesso por e-mail usam fragmentos.
Identidade institucional externa e antivírus não fazem parte desta implementação.
Os dados antigos do localStorage não são importados; o armazenamento antigo,
que continha senhas em texto puro, é removido na inicialização.
