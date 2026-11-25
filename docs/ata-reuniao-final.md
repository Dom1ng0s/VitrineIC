# Ata da reunião final — VitrineIC

| | |
|---|---|
| **Data** | ____/____/2026 — início ____:____ · término ____:____ |
| **Participantes** | Davi Domingos de Oliveira (banco de dados, liderança) · Arthur Melo (front-end) · Rian Américo (back-end) |
| **Objetivo** | Fechar as duas decisões pendentes (deploy e match) e combinar a apresentação |
| **Duração prevista** | 60 min |

Este documento serve como **pauta antes** e **ata depois**: cada bloco tem um
campo *Decisão registrada* para preencher na hora. O que não for decidido aqui
vira pendência sem dono, e a essa altura do calendário não há semana seguinte
para absorvê-la.

**Estado do projeto na abertura da reunião:** local verde (typecheck, build e
20/20 testes passando), branch `feat/postgres-3fn` com 6 commits à frente de
`main`, sem merge e sem PR. Prazo de entrega do cronograma: 23/11.

---

## Bloco 1 · Deploy (25 min)

### O problema, em uma frase

O `render.yaml` ainda configura SQLite; o código agora exige PostgreSQL. Um
deploy do branch atual **não sobe**.

### Evidência

| Onde | O que diz |
|---|---|
| `render.yaml` | `DATABASE_PATH: /tmp/vitrineic/vitrineic.sqlite`, nenhum banco gerenciado declarado |
| `server/config.ts:34` | `if (production) throw new Error("Configure DATABASE_URL…")` |

O serviço lança no boot, antes do primeiro request. O health check (`/api/health`)
falha e o deploy fica vermelho. `DATABASE_PATH` passou a ser variável que
ninguém lê; `DATABASE_URL` é a que o código exige e não existe no Blueprint.

### Opções

| # | Opção | Custo | Risco |
|---|---|---|---|
| A | Postgres gerenciado do Render (plano free) | baixo | instância free expira em 30 dias — serve para a entrega, não para depois |
| B | Postgres externo (Neon, Supabase) com `DATABASE_URL` no painel | baixo | mais um serviço para a equipe manter conta |
| C | Não publicar; demonstrar em localhost | zero | contraria M7 e M8 do cronograma, que exigem ambiente publicado |

### O que muda no repositório, escolhida A ou B

1. `render.yaml`: remover `DATABASE_PATH`, declarar `DATABASE_URL` (de banco
   gerenciado em A, ou do painel em B).
2. Rodar as migrações contra o banco de produção uma vez.
3. Criar a conta de curadoria em produção (`server/create-curator.ts`) — o seed
   de demonstração não roda fora de desenvolvimento.
4. Confirmar `APP_ORIGIN` em HTTPS: `server/config.ts` também lança sem ele.
5. Corrigir a documentação que ensina o caminho antigo: `docs/render.md`,
   `docs/backend.md:387`, `docs/relatorio-backend-equipe.md` (sete menções a
   `DATABASE_PATH`).

### Decisão registrada

> Opção escolhida: ______ · Responsável: ______ · Prazo: ____/____
>
> Observações: ______________________________________________

---

## Bloco 2 · Match: níveis de proficiência (10 min)

### Situação

A normalização de nomes **já funciona** — `server/schemas.ts:15` passa toda
lista de skills por `canonicalSkill`, então "ReactJS" e "react.js" chegam ao
banco como "React", tanto no perfil quanto na demanda. Isso não é pendência.

O que falta é o peso dos níveis. `src/lib/match.ts` é cobertura pura: quem
declarou React nível 1 pontua igual a quem declarou nível 4. O obstáculo não é
o algoritmo — é que **a demanda não declara nível exigido**: `Demand.skills` é
`string[]` e `demanda_competencia` não tem coluna de nível. Sem um lado
pedindo, não há o que comparar.

### Opções

| # | Opção | Custo | Efeito |
|---|---|---|---|
| A | Nível do estudante como peso (cada skill coberta vale `nivel/4`) | ~30 min, só `match.ts` | o número deixa de ser "% de cobertura"; o rótulo na tela precisa mudar junto |
| B | `nivel_minimo` em `demanda_competencia`, com migração `002_` | ~1 dia; atravessa banco, Zod, repositório, tipo `Demand` e o wizard | responde "preciso de alguém sênior em React"; é escopo novo depois do congelamento de 19/11 |
| C | Manter como está e declarar a limitação | zero | já é o que o pitch faz: o slide 7 diz que os níveis são coletados e ainda não pesam |

Observação: a opção C não é omissão. `docs/pitch-apresentacao.md`, slide 7, já
lista a limitação em voz alta, junto com a frase "preferimos um algoritmo que o
curador consegue explicar". Declarada, ela vira escolha de design; escondida,
vira furo que a banca encontra.

### Pendência comum a qualquer opção

**Não existe nenhum teste do `scoreStudent`** — é a função mais citada do
produto (quatro componentes do front e `server/domain-routes.ts:157`, que é o
ranking que a curadoria vê) e nenhum dos 20 testes a exercita. É função pura,
sem banco: meia hora para seis casos. Se a opção A for escolhida, o teste deixa
de ser desejável e passa a ser obrigatório.

### Decisão registrada

> Opção escolhida: ______ · Responsável: ______ · Prazo: ____/____
>
> Teste do `scoreStudent`: quem ______ · até ____/____

---

## Bloco 3 · Apresentação (20 min)

### Formato a confirmar na reunião

Existem dois artefatos de pitch no repositório: `VitrineIC-Pitch.pptx` e
`VitrineIC-Pitch-7min.pptx`. O roteiro de slides está em
`docs/pitch-apresentacao.md` (12 slides) e o roteiro de demonstração em anexo
no mesmo arquivo (5 minutos).

> Duração confirmada: ______ min · Com demo ao vivo? ______ · Ordem dos
> apresentadores confirmada por todos? ______

### Divisão proposta — 15 minutos com demo

| Tempo | Slides / tela | Quem fala | Conteúdo |
|---|---|---|---|
| 0:00–1:30 | 1–3 | **Davi** | Abertura, o problema, a solução em uma frase |
| 1:30–2:30 | 4–5 | **Davi** | A decisão que diferencia (curadoria, não candidatura aberta) e quem usa |
| 2:30–3:30 | 6 | **Arthur** | O fluxo ponta a ponta, antes de mostrar na tela |
| 3:30–8:30 | demo | **Arthur** | Roteiro de 5 min: landing → catálogo público → wizard → triagem → matchmaking → aceite do estudante → impacto |
| 8:30–9:30 | 7 | **Davi** | Como o match funciona, e as limitações ditas em voz alta |
| 9:30–11:00 | 8 | **Rian** | O que está construído: arquitetura, API, autenticação, PostgreSQL |
| 11:00–11:45 | 9 | **Arthur** | Acessibilidade como requisito |
| 11:45–13:00 | 10 | **Davi** | Impacto e ACE1: indicadores derivados da base, questionário aplicado |
| 13:00–14:00 | 11–12 | **Rian** | Próximos passos e fechamento |
| 14:00–15:00 | — | todos | Perguntas |

### Se o slot for de 7 minutos

Usar `VitrineIC-Pitch-7min.pptx`, cortar a demo ao vivo para 2 minutos (landing
→ matchmaking → aceite) e suprimir os slides 9 e 11. Divisão: Davi abre e fecha
o bloco de problema/match, Arthur conduz a demo curta, Rian cobre construção.

### Quem responde o quê no Q&A

Combinar isto antes evita três pessoas respondendo ao mesmo tempo, que é o que
mais desarruma uma banca.

| Pergunta provável | Responde |
|---|---|
| Por que vocabulário em tabela e não `enum`? | Davi |
| Como o match trata grafias diferentes ("ReactJS" × "React")? | Davi |
| E se a demanda precisar de alguém sênior? | Davi — limitação declarada, ver Bloco 2 |
| Por que a tabela `competencia_alias` existe se nenhuma query a usa? | Davi — a normalização mora na aplicação; a tabela alimenta a busca do catálogo |
| Os dados mostrados são reais? | Davi — tudo em `src/data/` é fictício, e os indicadores são derivados das bases, não digitados |
| Como vocês garantem que o contato não vaza antes do aceite? | Rian — filtro no back-end, mais o teste que prova |
| O sistema está publicado? Posso acessar? | Rian — conforme a decisão do Bloco 1 |
| Perdi os dados ao recarregar? | Rian — persiste em PostgreSQL; há teste que fecha e reabre o app |
| Acessibilidade, responsivo, teclado | Arthur |
| E-mail institucional, LGPD, quem vê o quê | Rian |
| Qual foi a sua parte no trabalho? | cada um pela sua |

### Material a conferir antes

- [ ] Diagrama ER da apresentação — versão enxuta, 14 tabelas (as que carregam
      regra; os 11 catálogos de vocabulário ficam num slide de reserva para o Q&A)
- [ ] `docs/pitch-apresentacao.md`, anexo do roteiro de demo: a última linha
      ainda diz "não recarregue a página durante a demo — o estado vive em
      memória". **Isso não é mais verdade** e hoje é um ponto a favor: recarregar
      na frente da banca demonstra a persistência. Corrigir a frase.
- [ ] Contas de demonstração funcionando no ambiente que será usado
      (`estudante@ic.ufal.br`, `contato@techbr.com.br`, `curadoria@ic.ufal.br`)
- [ ] Um ensaio cronometrado, com o ambiente que será usado na banca

---

## Bloco 4 · Fechamento do repositório (5 min)

Não são decisões — são tarefas sem dono registrado. Precisam de nome e prazo.

| Pendência | Detalhe | Quem | Prazo |
|---|---|---|---|
| Commit e merge do branch | `feat/postgres-3fn`, 6 commits à frente de `main`, sem PR. A migração para PostgreSQL existe só na máquina do Davi | ______ | ____ |
| Arquivos nunca versionados | 14 itens fora do Git: `docs/cronograma.md`, questionário de validação, os dois `.pptx`, PDFs do cronograma, `docs/shots/` | ______ | ____ |
| `docs/modelo-dados-3fn.md` | A abertura ainda descreve o banco anterior ("cada entidade como um JSON em `data TEXT`") e cita `server/database.ts`, que não existe mais. Reescrita pela metade, sem commit | ______ | ____ |
| `docs/verificacao-projeto.md` | De 22/10; atesta "reabertura do mesmo arquivo SQLite" e 19 testes. Hoje são 20 e não há SQLite | ______ | ____ |
| README alinhado ao código | Exigência do M8 | ______ | ____ |

---

## Decisões da reunião — quadro final

Preencher ao fim, em voz alta, antes de encerrar. Uma linha por decisão.

| # | Decisão | Responsável | Prazo |
|---|---|---|---|
| 1 | Deploy: opção ______ | | |
| 2 | Match: opção ______ | | |
| 3 | Formato da apresentação: ______ min, demo ______ | | |
| 4 | Commit e merge do branch | | |
| 5 | | | |
| 6 | | | |

**Próxima verificação:** ____/____ às ____:____ — confirmar que o deploy está
no ar, a suíte está verde e o ensaio foi feito.
