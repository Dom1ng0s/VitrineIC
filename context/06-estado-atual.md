# Estado atual

Levantado em 25/11/2026, por auditoria de cada escopo (área pública, estudante,
solicitante, curadoria, backend, transversais). O que falta e em que ordem está
em [docs/plano-de-completude.md](../docs/plano-de-completude.md); a referência
de execução, persistência, segurança e endpoints é
[docs/backend.md](../docs/backend.md).

## Números

|                       |                                                                                 |
| --------------------- | ------------------------------------------------------------------------------- |
| Arquivos em `src/`    | 120 (~9.300 linhas)                                                             |
| Arquivos em `server/` | 35 (~2.800 linhas)                                                              |
| Maior arquivo         | `data/skills.ts` (316), `student/ui.tsx` (274), `curator/Matchmaking.tsx` (274) |
| Bundle                | ~677 kB (176 kB gzip)                                                           |
| Testes                | 55 no frontend (`pnpm test:web`), 27 de integração da API (`pnpm test:api`)     |

## Maturidade por fluxo

O que separa "tela pintada" de "funcionalidade":

| Fluxo                                                        | Estado                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Autenticação, sessão, recuperação e confirmação de e-mail    | **Funcional** — scrypt, cookie HttpOnly, CSRF, limite de tentativas por IP                           |
| Persistência                                                 | **Funcional** — PostgreSQL em 3FN, migração na subida                                                |
| Triagem e sugestão (curadoria)                               | **Funcional** — muda estado, com justificativa obrigatória                                           |
| Interesses (candidatar, convidar, sugerir, aceitar, recusar) | **Funcional** — aceite duplo validado no servidor, contato liberado só depois                        |
| Onboarding do estudante                                      | **Funcional** — grava na API a cada "Continuar"; dá para pular                                       |
| Nova demanda (wizard)                                        | **Funcional** — grava e notifica; **não há editar nem encerrar**                                     |
| Projetos do estudante                                        | **Parcial** — cria e lista; **não há editar nem excluir na tela** (o backend tem as rotas)           |
| Catálogo público, perfis e impacto                           | **Funcional** — derivados do banco                                                                   |
| Notificações e mensagens                                     | **Parcial** — avisos são reais; mensagem só existe como resposta a notificação                       |
| Vitrine de estudantes para o solicitante                     | **Fachada em parte** — idioma, links e projetos exibidos ali são inventados na tela                  |
| Ranking da curadoria                                         | **Fachada em parte** — conta skills cruas; ignora nível, disponibilidade e área, que o perfil coleta |
| Prioridade da demanda                                        | **Fachada** — toda demanda nasce `normal` e não há como mudar                                        |
| Publicação                                                   | **Não pronta** — `render.yaml` e `Dockerfile` são da época do SQLite                                 |

Ao receber uma tarefa, confira nessa tabela o que já existe.

## Aderência ao escopo

| Requisito                      | Estado                                                             |
| ------------------------------ | ------------------------------------------------------------------ |
| Vitrine de projetos            | ✅ `student/Projects.tsx` + catálogo público                       |
| Mural de demandas              | ✅ `requester/MyDemands.tsx`                                       |
| Sugestão da curadoria          | ✅ `curator/Matchmaking.tsx`, justificativa obrigatória            |
| Crivo humano                   | ✅ triagem + sugestão justificada + acompanhamento                 |
| Contato após o match           | ✅ liberado pela API só com o aceite dos dois lados                |
| Vitrine pública (sem login)    | ✅ catálogo, projeto e perfil público                              |
| Indicadores para a ACE1        | ⚠️ derivados do banco; faltam as metas do período                  |
| Avisos de demandas compatíveis | ⚠️ notificações são reais, mas o sino rotula todas como "Processo" |
| Persistência                   | ✅ PostgreSQL                                                      |
| Autenticação                   | ✅ no servidor                                                     |

**As três peças inegociáveis existem e funcionam ponta a ponta.**

## Decisões tomadas (25/11/2026)

As perguntas que antes travavam implementação foram respondidas:

- **Solicitante:** empresa, professor/laboratório e órgão público são tipos
  distintos e visíveis. Falta chegar às telas.
- **Curadoria:** três papéis — curador tria e sugere, coordenação aprova,
  rejeita e exclui, comitê lê e dá parecer. Falta implementar; hoje há um papel
  único que faz tudo.
- **Indicadores:** o painel passa a mostrar a meta do período ao lado de cada
  número, pela tabela `meta_indicador`. Depoimentos reais ficam fora do escopo.
- **Cursos fora do IC:** cadastro restrito às unidades com curso conferido
  (`SIGNUP_UNITS`, em `src/data/institution.ts`). Hoje, só o IC.

## Riscos ao mexer no código

- **Cobertura desigual.** O domínio e a API têm teste; as telas quase não têm.
  Verifique com `pnpm typecheck`, `pnpm lint`, `pnpm test` e o fluxo no navegador.
- **Dados fictícios.** Nada em `src/data/` é real.
- **Primitivas duplicadas.** Quatro `ui.tsx` e três `StatusBadge` parecidos;
  alterar um não propaga. A `NavBar` já foi unificada em `app/AreaNav.tsx`.
- **Navegação sem URL.** Trocar de tela é estado React: não há deep link nem
  botão voltar, e `document.title` é o mesmo em toda parte.
- **Acessibilidade em dívida declarada.** O ESLint aponta ~50 avisos de
  `jsx-a11y` de propósito: a fase 6 do plano os corrige e eleva a regra a erro.
- **Um pull pode reintroduzir o Figma Make.** Se `.figma/` reaparecer, é
  regressão.
