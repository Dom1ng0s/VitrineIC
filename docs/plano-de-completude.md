# Plano de completude

Auditoria de 25/11/2026, um escopo por vez (área pública, estudante,
solicitante, curadoria, backend, transversais). Este arquivo é o plano de
trabalho e vai sendo atualizado conforme as fases fecham.

Princípio da ordem: **rede de segurança → fundações estruturais → backend →
fluxos → fachadas → polimento → deploy**. Refatoração ampla sem teste é o maior
risco do projeto, e corrigir acessibilidade em quatro `ui.tsx` duplicados antes
de unificá-los é trabalho feito quatro vezes. O deploy fica no fim por decisão
da equipe.

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` feito.

## Estado por fase

| Fase | Assunto                           | Estado |
| ---- | --------------------------------- | ------ |
| 0    | Decisões de produto               | [x]    |
| 1    | Rede de segurança                 | [x]    |
| 2    | Fundações estruturais             | [x]    |
| 3    | Backend abre o que a UI consome   | [x]    |
| 4    | Buracos de fluxo                  | [~]    |
| 5    | Fachadas                          | [ ]    |
| 6    | Acessibilidade e qualidade de uso | [ ]    |
| 7    | Deploy e operação                 | [ ]    |

---

## Fase 0 — Decisões de produto · fechada em 25/11/2026

Decidido com a equipe. Estas respostas são a fonte para as fases 3, 4 e 5.

- [x] **Solicitante: externa e interna, distintas.** Empresa, professor ou
      laboratório e órgão público são tipos visíveis, com cadastro, selo e
      filtro próprios. `RequesterKind` já tem os códigos; falta a distinção
      chegar às telas. Desdobramentos nas fases 4 e 5.
- [x] **Curadoria: três papéis.** Curador tria e sugere; coordenação aprova,
      rejeita e exclui; comitê de alunos lê e dá parecer, sem decidir. Exige
      papel no banco, checagem por rota e tela de equipe — fase 3.
- [x] **Indicadores: metas do período.** Cada indicador do painel passa a
      mostrar a meta ao lado, pela tabela `meta_indicador` (a constante
      `TARGETS` sai). Depoimentos reais e métricas de tempo ficam fora do
      escopo por ora; os indicadores derivados de hoje continuam.
- [x] **Cursos: restringir ao IC.** Feito: `SIGNUP_UNITS` e `findSignupUnit`
      em `src/data/institution.ts` limitam cadastro, onboarding e perfil às
      unidades com `coursesVerified`, e `server/schemas.ts` valida pela mesma
      lista. O cartão do hero segue girando todas as unidades (nomes e siglas
      são conferidos). Para liberar outra unidade, confira os cursos em
      ufal.br e marque `coursesVerified: true`.

## Fase 1 — Rede de segurança · fechada em 25/11/2026

- [x] ESLint 9 (`react-hooks`, `jsx-a11y`, `react-refresh`), Prettier e
      pre-commit com `lint-staged`. Zero erro de lint; os ~50 avisos de
      `jsx-a11y` são a dívida da fase 6 — ao fechá-la, troque `a11ySeverity`
      para `"error"` em `eslint.config.js`. O repositório foi formatado uma vez
      só, em commit próprio, para que os diffs das fases seguintes não viessem
      misturados com reformatação; por isso o CI roda `format:check`.
- [x] Corrigidos no caminho, porque o lint os apontou: dependências de
      `useMemo` no `SkillPicker`, `setState` em efeito no `AccountSecurity`
      (agora remonta por `key`), `prefer-const` e o regex de controle do
      upload.
- [x] Vitest + Testing Library: 55 testes em `profile`, `match`, `interest`,
      `api`, `store` e `InputField`. Fábricas em `src/tests/fixtures.ts`.
      Novos acessores para teste: `getConnection` (`store.ts`) e o tipo
      `Session` (`auth.ts`).
- [x] Testes de backend que faltavam, em `server/tests/rotas.test.ts`: saúde,
      indicadores, ranking (papel, ordem, e-mail oculto, perfil sem
      competência), `read-all` e isolamento da caixa, autorização de
      `PATCH /api/company`, exclusão de demanda pelo dono só em `nova` e as
      transições de status recusadas. Total da API: 27.
- [x] Workflow de CI (`.github/workflows/ci.yml`) com PostgreSQL de serviço:
      `typecheck`, `lint`, `test:web`, `test:api` e `build`.
- [x] Deriva da documentação corrigida: `README.md` (PostgreSQL, scripts reais,
      publicação não pronta), `docs/render.md` (marcado como histórico),
      `context/06-estado-atual.md` (reescrito sobre o código de hoje),
      `docs/mapa-de-queries.md` (reescrito sobre `repositories`/`snapshot`),
      `AGENTS.md` (telas e caminhos reais, `SIGNUP_UNITS`, scripts novos),
      `docs/backend.md` (o teste de backup não existe), `context/03-dominio.md`
      (match devolve 0, persistência, papéis de `src/data`),
      `context/README.md`.
- [x] `pnpm test` passou a ser a suíte inteira; `test:web` e `test:api`
      rodam as metades.

## Fase 2 — Fundações estruturais · fechada em 25/11/2026

- [x] Rotas por URL em `src/lib/rotas.ts`: `/projetos`, `/projetos/:id`,
      `/estudantes`, `/estudantes/:id`, `/impacto` e `/curadoria`, com título
      por página, 404 (`public/NotFound.tsx`) e âncoras de verdade
      (`app/RouteLink.tsx`), que preservam Ctrl/Cmd/Shift e botão do meio.
      Sem roteador de biblioteca. Enquanto há sessão, o endereço volta à raiz:
      as áreas logadas não têm rota própria — dar URL às abas delas continua
      em aberto, e só vale a pena se alguém precisar linkar uma aba.
- [x] Menu no celular na nav pública; "Admin" virou "Curadoria", como no
      rodapé (item que era da fase 6, feito aqui porque a nav foi reescrita).
- [x] `Label`, `Input`, `Select`, `SelectField` e `Rule` extraídos para
      `components/app/Field.tsx`; os `ui.tsx` das três áreas reexportam.
      `StatusPill` passou a ser usado pelos dois `StatusBadge` que o
      remontavam à mão. O `ui.tsx` da landing ficou de fora: o `InputField`
      dele exige `id` e tem variante escura, e é o único já correto.
- [x] Código morto apagado: `data/{notifications,projects,showcase}.ts`,
      arrays `*_UPDATES`, `student/StatusBadge.tsx`, `LevelMeter`,
      `Rule`/`Tag` do estudante, `TARGETS`, o parâmetro de lado em
      `respondInterest`, `Arrow()` duplicado e `MONO`/`SANS` da nav.

Observação para a fase 6: o `fieldset disabled` global do `ApiBoundary`
engole cliques durante a sincronização. Apareceu na verificação — vários
cliques não surtiam efeito até a sincronização terminar.

## Fase 3 — Backend abre o que a UI consome · fechada em 25/11/2026

- [x] `PATCH /api/demands/:id` (editar demanda em `nova`, pelo dono)
- [x] Observação do histórico de status no snapshot (motivo da rejeição)
- [x] Histórico de interesse (quem respondeu o quê, quando)
- [x] Prioridade da demanda (`PATCH /api/demands/:id/priority`, só coordenação)
- [x] Três papéis da curadoria (decisão da fase 0): `curador`, `coordenacao` e
      `comite` no banco, com checagem por rota — curador tria e sugere;
      coordenação aprova, rejeita e exclui; comitê só lê e registra parecer
- [x] Rotas de gestão da equipe de curadoria: listar, convidar, trocar papel,
      desativar (hoje só existe o script `curator:create`)
- [x] Parecer do comitê: tabela e rota de escrita, sem poder de decisão
- [x] Validação uuid nos `params` de notificações e anexos (agora 404)
- [x] Cota por conta em demandas, interesses e mensagens
- [x] Bloqueio de força bruta por conta no login
- [x] Índices nas FKs sem índice (`notificacao.*`,
      `mensagem.remetente_conta_id`, `projeto_competencia`, `estudante_idioma`,
      `estudante_topico`)
- [x] Congelar `001` com checksum em `schema_migration` e evoluir por
      `002_*.sql` — feito em 25/11/2026: `migrate` guarda o hash de cada
      arquivo aplicado e interrompe a subida se um deles mudar; linha antiga
      sem hash é completada na primeira execução. Teste em
      `server/tests/migracao.test.ts`. **Daqui em diante, mudança de esquema é
      arquivo novo.**
- [x] `/api/state` sem foto embutida e paginado: `offset`/`limit` (até 100),
      com recomposição das páginas no cliente; fotos em rota própria.

As migrações `002` a `004` acrescentaram funções da curadoria, pareceres,
índices e bloqueio de login. As rotas novas verificam função e incluem casos
negativos de autorização. Cotas por conta são serializadas por transação.
Verificação ao fechar: `typecheck`, 56 testes web, 39 testes API e os dois
builds passaram; lint sem erros, com os 50 avisos de acessibilidade previstos
para a fase 6. O snapshot completo continua nas respostas de mutação; a rota
`GET /api/state` entrega páginas e o cliente as reúne.

## Fase 4 — Buracos de fluxo

- [x] Editar e encerrar/cancelar demanda (solicitante)
- [ ] Editar e excluir projeto, mudar etapa (estudante)
- [ ] Convidar depois do contato liberado (incluir `contato_liberado` no filtro)
- [x] Motivo da rejeição visível ao solicitante
- [ ] Histórico de decisões visível à curadoria
- [ ] Mensagem iniciável (hoje só responde a notificação)
- [ ] Transições do kanban derivadas da mesma tabela do servidor, com alvo
      inválido desabilitado e motivo no card
- [ ] Tela de equipe da curadoria: quem é o quê, convidar, trocar papel,
      desativar; ações escondidas conforme o papel
- [ ] Parecer do comitê na tela da demanda, visível à coordenação
- [ ] Tipo do solicitante visível (decisão da fase 0): selo de empresa,
      professor/laboratório ou órgão público no mural, na triagem e no
      cadastro, com filtro por tipo
- [ ] Anexo de briefing pela demanda; portfólio liberado após o aceite duplo
- [ ] Decidir e, se valer, implementar "retirar candidatura"

## Fase 5 — Eliminar fachadas

- [ ] `scoreStudent` usando níveis de proficiência, disponibilidade, área e
      requisito obrigatório/desejável — uma só implementação, consumindo
      `/api/demands/:id/ranking` em vez de recalcular no cliente
- [ ] Perfil do estudante na vitrine do solicitante lendo dados reais (hoje
      idioma fixo "Inglês (Avançado)", `github.com/<primeiro nome>` e dois
      projetos hardcoded)
- [ ] Exibir os cinco campos da demanda que são gravados e nunca mostrados:
      público-alvo, nível acadêmico, entregáveis, equipe, orçamento
- [ ] Aviso "perfil visível na vitrine" considerando a confirmação de e-mail
- [ ] Sugestão duplicada: responder 409 em vez de "Sugestão enviada"
- [ ] Metas do período pela API (decisão da fase 0): alimentar
      `meta_indicador`, mostrar a meta ao lado de cada indicador do painel e
      remover a constante `TARGETS`
- [ ] Depoimentos: fora do escopo por ora — remover os fictícios da página
      pública e deixar a tabela `depoimento` sem uso declarado
- [ ] Capa de projeto e foto de perfil, ou assumir o placeholder e remover
      `photo` do tipo
- [ ] Caixinhas "Critérios" do matchmaking: alimentar o score ou rotular como
      contexto
- [ ] Período do painel de impacto derivado dos dados, não digitado
- [ ] Coluna `certificados`: aceitar no schema ou remover
- [ ] Sino de notificações: derivar `kind`/`target` do tipo real

## Fase 6 — Acessibilidade e qualidade de uso

- [ ] `label htmlFor` em todos os campos (solicitante inteiro, nota da
      candidatura, resposta da caixa de entrada, mensagem do convite)
- [ ] `AuthModal`: foco inicial, focus trap, retorno do foco
- [ ] `SkillPicker` com semântica de combobox; `MultiSelect` com botões
      acessíveis
- [ ] `:focus-visible` global, skip link, `<main>` na landing
- [ ] Estados vazios: "Minhas demandas", destaques da landing, projetos do
      perfil, distribuições do painel, matchmaking
- [ ] Busca e paginação: catálogo de projetos, vitrine de estudantes (corte
      fixo em 10), triagem
- [ ] `ApiBoundary`: carregamento por ação em vez de `fieldset disabled` global
      a cada 30 s
- [ ] `store.runAction`: fila por recurso, erro identificado por ação, abort no
      unmount; retry com backoff em GET
- [ ] Wizard como `<form>`, foco e anúncio na troca de passo
- [ ] Convite escolhendo a demanda por id, não por título
- [ ] Unificar o vocabulário de áreas (`AREA_OPTIONS` x semente)
- [ ] Padronizar a nota do match numa só unidade
- [ ] Trocar `window.confirm` da exclusão de demanda pelo modal do projeto
- [ ] Migrar os `style={{}}` herdados para utilities

## Fase 7 — Deploy e operação

- [ ] `Dockerfile`: remover o `COPY` de `scripts/backup-database.mjs`
      (inexistente, quebra o build) e o `DATABASE_PATH` de SQLite
- [ ] `render.yaml`: `DATABASE_URL`, `APP_ORIGIN`, `MAIL_MODE` real; remover
      `DATABASE_PATH`
- [ ] `trustProxy` e rate limit com store externo (hoje, atrás do proxy, a cota
      é compartilhada por todos)
- [ ] Trava de concorrência na migração do boot (`pg_advisory_lock`)
- [ ] CSP e `Permissions-Policy`
- [ ] Backup automatizado, retenção e restauração ensaiada
- [ ] Observabilidade: request-id, métricas, relatório de erro, `health` x `ready`
- [ ] Dimensionar `pool.max` com o provedor
