# Mapa de queries do VitrineIC

Onde cada consulta acontece, o que ela lê e quanto custa. Levantado sobre o
`server/` de 25/11/2026, já no esquema 3FN em PostgreSQL. Complementa
[modelo-dados-3fn.md](modelo-dados-3fn.md).

> Versões anteriores deste documento descreviam o acesso em SQLite, com
> `server/database.ts` e `server/views.ts` — arquivos que não existem mais.
> Toda varredura total que elas apontavam foi resolvida pela migração; o que
> permanece está na seção **O que ainda incomoda**.

## O padrão que define tudo

Nenhuma rota monta SQL. Leitura passa por `server/db/repositories.ts`, escrita
por `server/db/mutations.ts`, e o estado que a API devolve sai de
`server/db/snapshot.ts`.

Cada entidade sai em **uma** consulta: as coleções (competências, idiomas,
tópicos, projetos, stack de projeto) vêm agregadas em JSON por `LEFT JOIN
LATERAL`, em vez de uma consulta por linha. É o que `SQL_ESTUDANTE`
(`repositories.ts:15`), `SQL_DEMANDA` (`:76`) e `SQL_INTERESSE` (`:99`) fazem.

O preço disso: `SQL_ESTUDANTE` tem quatro laterais, uma delas aninhada (stack
dentro de projeto). É barato por estudante e cresce linearmente com o número de
estudantes devolvidos — por isso o recorte do snapshot importa mais que o
índice.

## `snapshot()` — a consulta que importa

`server/db/snapshot.ts:109`. Uma chamada faz, no pior caso (curadoria logada):

| Leitura             | Onde   | Recorte                                                                                                          |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| interesses visíveis | `:22`  | papel: curadoria vê tudo; estudante por `i.estudante_id`; solicitante por subconsulta de demandas da organização |
| estudantes          | `:117` | visíveis (têm competência) **ou** o próprio **ou** citados nos interesses                                        |
| demandas            | `:127` | curadoria vê tudo; dono vê as suas; público vê `aprovada`/`contato_liberado`; mais as citadas nos interesses     |
| solicitantes        | `:141` | `solicitantes.todos` — tabela inteira, sem filtro                                                                |
| anexos              | `:148` | `WHERE estudante_id` (índice `anexo_estudante_estudante`)                                                        |
| notificações        | `:83`  | `WHERE destinatario_conta_id ORDER BY criada_em DESC LIMIT 200` (índice `notificacao_caixa`)                     |
| indicadores         | `:41`  | quatro agregações no banco, mais duas por grupo                                                                  |

Autorização é SQL, não JavaScript: contato de estudante e de organização só sai
depois do aceite dos dois lados (`:138`–`:174`), motivo de recusa não vai para o
estudante, matrícula e certificados só para o próprio.

**Toda rota de escrita devolve um `snapshot()` completo** — não existe resposta
parcial. E o cliente faz polling: `src/components/app/ApiBoundary.tsx:11` chama
`/api/state` a cada 30 s com a aba visível, mais a cada `focus`.

## Inventário por arquivo

### `security.ts` — toda requisição autenticada

Sessão por `token_hash` (PK de `sessao`), conta por `c.id` (PK). Duas leituras
por chave em todo request. Limpeza de sessão expirada usa `sessao_expira`.

### `auth-routes.ts` e `account-routes.ts`

`contas.porEmail` usa o único de `conta.email`. Tokens de recuperação e
confirmação são PK (`token_conta.token_hash`) ou únicos por conta e propósito.
`DELETE FROM sessao WHERE conta_id` usa `sessao_conta`.

### `domain-routes.ts`

| Rota                          | Leituras                                              | Índice                                               |
| ----------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `PATCH /students/:id`         | `estudantes.porId`                                    | PK                                                   |
| `PATCH /company`              | `solicitantes.porNome`                                | único de `solicitante.nome`                          |
| `POST /projects`              | `count(*)` por estudante                              | `projeto_estudante_estudante`                        |
| `PATCH /demands/:id/status`   | demanda por id, `existeAtivoNaDemanda`, conta do dono | PK, `interesse_demanda`, único de `solicitante.nome` |
| `DELETE /demands/:id`         | demanda por id, `existeNaDemanda`                     | PK, `interesse_demanda`                              |
| `GET /demands/:id/ranking`    | demanda por id + `estudantes.visiveis`                | PK; `EXISTS` em `estudante_competencia`              |
| `POST /interests`             | demanda, estudante, `ativoDoPar`, conta do estudante  | PK e o único parcial `interesse_par_ativo`           |
| `POST /interests/:id/respond` | interesse por id, demanda por id                      | PK                                                   |

O ranking não monta mais o estado inteiro: lê só a demanda e os perfis
visíveis (`:150`–`:159`).

### `inbox-routes.ts`

`read` e `reply` localizam a notificação por `id` + `destinatario_conta_id`
(PK + índice da caixa). `read-all` é **um** `UPDATE` por conta. O destinatário
da resposta sai de `contas.doEstudante` / `contas.doSolicitante`, por único.

### `file-routes.ts`

Cota por conta em uma linha: `count(*)` e `sum(tamanho_bytes)` com
`WHERE estudante_id` — usa `anexo_estudante_estudante` e **não** soma o tamanho
dos BLOBs. Download e exclusão são por PK, com dono conferido.

### `notifications.ts`

`notificarInteresse` acha as duas contas do par por único (`e.id`, `s.nome`),
sem varredura.

## Índices: o que existe

Em `server/db/migrations/001_schema.sql`: `sessao_conta`, `sessao_expira`,
`token_conta_expira`, `competencia_alias_competencia`, `estudante_curso`,
`estudante_competencia_competencia`, `projeto_estudante_estudante`,
`anexo_estudante_estudante`, `demanda_solicitante`, `demanda_status`,
`demanda_competencia_competencia`, `demanda_historico_demanda`,
`interesse_estudante`, `interesse_demanda`, `interesse_status`,
`mensagem_interesse`, `notificacao_caixa`, `notificacao_nao_lidas`, mais o
único parcial `interesse_par_ativo`, que impede dois interesses ativos para o
mesmo par.

Diferente do esquema anterior, estes são usados: cada um corresponde a uma
consulta real do inventário acima.

## O que ainda incomoda

Levantado na auditoria de 25/11/2026; as correções são as fases 3 e 7 de
[plano-de-completude.md](plano-de-completude.md).

1. **`GET /api/state` pagina o transporte, mas ainda repete leituras.**
   Estudantes e demandas usam `LIMIT`/`OFFSET`; interesses visíveis e
   solicitantes ainda são consultados por inteiro em cada página para manter
   os filtros de contato. Fotos usam uma rota separada. Cursors por coleção
   podem reduzir o custo quando a base crescer.
2. **Toda mutação devolve o estado inteiro.** Enquanto for assim, o custo do
   snapshot multiplica por ação do usuário.
3. **`solicitantes.todos` no snapshot** é a única leitura sem recorte que
   sobrou. Hoje é pequena; cresce com o número de organizações.
4. **Pool de 10 conexões** (`server/db/pool.ts:35`) com 6+ consultas por
   snapshot: dimensionar junto com o provedor de produção.
5. **Código de leitura sem consumidor:** `estudantes.todos`, `demandas.todas`,
   `interesses.todos` e parte de `solicitantes` existem e não são chamados.
