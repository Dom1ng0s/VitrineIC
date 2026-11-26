# Cronograma — 8 semanas (29/09 a 23/11/2026)

Base: estado real do código em `context/06-estado-atual.md`, requisitos em
`context/Documento de Requisitos.md`, equipe em `context/…00. Definição da Equipe…`.

## Premissas

1. **Existe backend.** A equipe tem papéis de back-end (Rian) e banco (Davi), e
   RF01, RF08, RF11, RF12, RF19 e o papel Administrador não sobrevivem só em
   memória. O plano prevê API + persistência real; se a decisão for entregar
   apenas front-end, as semanas 3–6 encolhem e a folga vai para polimento e ACE1.
2. **A divergência de escopo se resolve na semana 1.** Empresa (código) ou
   universidade (README e documento de definição). Não dá para escrever copy,
   dados de exemplo nem pitch antes disso.
3. **ACE1 corre em paralelo**, não no fim. Validação com público externo precisa
   de tempo de campo.
4. Capacidade estimada: ~10h/semana por pessoa, 3 pessoas.

## O que falta — mapa de lacunas

### Requisitos sem implementação

| Lacuna                                                             | Requisito   | Tamanho |
| ------------------------------------------------------------------ | ----------- | ------- |
| Cadastro real de estudante (hoje o onboarding não alimenta perfil) | RF01, RF02  | M       |
| Editar/remover projeto                                             | RF08        | P       |
| Wizard de demanda não grava na lista                               | RF09, RF10  | M       |
| Acompanhamento real do pedido pelo solicitante                     | RF11        | M       |
| Curadoria pedir ajustes + solicitante corrigir                     | RF12, RF14  | M       |
| Histórico de decisões da curadoria                                 | RF19        | P       |
| Papel Administrador (usuários, permissões)                         | —           | M       |
| Autenticação de verdade (hoje "Acessar" entra sem validar)         | RN01, RN08  | G       |
| Persistência (reload zera tudo)                                    | transversal | G       |

### Dívida estrutural que bloqueia o resto

| Item                                                        | Por quê agora                                            |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Unificar `data/demands.ts` e `data/requester-demands.ts`    | duas bases paralelas; cada tela nova encarece o conserto |
| Unificar os dois vocabulários de status em `types/index.ts` | tradução entre áreas hoje é encenada                     |
| Extrair `NavBar`, `ui.tsx`, `StatusBadge` compartilhados    | 4 cópias parecidas e divergentes                         |
| Roteamento por URL                                          | sem link compartilhável e sem botão voltar               |
| Zero testes                                                 | única verificação é `pnpm build` + clicar                |

### Entregas não-código (ACE1)

Questionário de validação aplicado, evidência de alcance externo, pitch
atualizado, indicadores de impacto derivados de dados reais de uso.

## Marcos

Sete marcos, cada um com data de corte, o que precisa existir, quem puxa e o
critério que decide se passou. Um marco só fecha quando o critério de aceite é
verificado rodando o sistema — não quando o código foi escrito.

### M1 · 05/10 — Escopo decidido e dados modelados

|                 |                                                                                                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Entregáveis** | Decisão empresa × universidade registrada em `context/01-produto.md`; as 4 perguntas abertas de `06-estado-atual.md` respondidas (público, quem cura, o que vem depois do match, métricas ACE1); esquema de banco cobrindo RF01–RF19; `src/data` com fonte única de demanda e um único vocabulário de status |
| **Quem puxa**   | Decisão: todos · esquema: Davi · unificação das bases: Arthur · stack de back-end: Rian                                                                                                                                                                                                                      |
| **Aceite**      | `pnpm build` passa com `data/requester-demands.ts` removido e as três áreas lendo a mesma base; esquema revisado pelos três                                                                                                                                                                                  |
| **Destrava**    | tudo. Copy, dados de exemplo, pitch e API dependem da decisão de escopo                                                                                                                                                                                                                                      |
| **Risco**       | arrastar a decisão. Prazo duro: na dúvida, seguir o código (empresa)                                                                                                                                                                                                                                         |

### M2 · 12/10 — Fundação técnica de pé

|                 |                                                                                                                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entregáveis** | `src/components/shared/` com `NavBar`, `ui` e `StatusBadge` únicos, as 4 cópias apagadas; roteamento por URL com link compartilhável e botão voltar funcionando; API rodando com migrations e CRUD de estudante e projeto (RF01–RF05, RF08); questionário de validação finalizado e amostra definida |
| **Quem puxa**   | Front: Arthur · API e migrations: Rian · migrations e seed: Davi · questionário: todos                                                                                                                                                                                                               |
| **Aceite**      | colar a URL de um perfil noutra aba abre a mesma tela; `POST` e `GET` de estudante e projeto respondem no ambiente de dev                                                                                                                                                                            |
| **Destrava**    | M3 (auth precisa da API) e M4 (persistir perfil precisa do CRUD)                                                                                                                                                                                                                                     |
| **Risco**       | back-end atrasar. Mitigação: camada de API isolada no front, com mock trocável por chamada real                                                                                                                                                                                                      |

### M3 · 19/10 — Autenticação com papéis

|                 |                                                                                                                                                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Entregáveis** | Login por e-mail institucional validando os domínios de `data/institution.ts`; sessão persistida; quatro papéis (estudante, solicitante, curador, admin) com autorização no back-end; `AuthModal` ligado ao fluxo real, fachada removida; botão `Admin` da nav pública protegido; seed alinhado ao escopo decidido; primeira rodada do questionário aplicada |
| **Quem puxa**   | Auth e papéis: Rian · front do login: Arthur · seed: Davi · campo ACE1: todos                                                                                                                                                                                                                                                                                |
| **Aceite**      | usuário sem papel de curador recebe 403 no endpoint de triagem, não só tela escondida; reload mantém a sessão                                                                                                                                                                                                                                                |
| **Destrava**    | RN01 e RN08 — sem papéis não há regra de quem publica nem de quando o contato é liberado                                                                                                                                                                                                                                                                     |
| **Risco**       | tentar OAuth institucional e travar. Começar por e-mail e senha com validação de domínio                                                                                                                                                                                                                                                                     |

### M4 · 26/10 — Vitrine e perfil persistidos

|                 |                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entregáveis** | Onboarding gravando perfil, skills, níveis de proficiência e idiomas (RF02); publicar, editar e remover projeto (RF03, RF04, RF08); upload de imagem e links (RF05); catálogo público, diretório e perfis lendo da API com busca por tecnologia e área (RF06, RF07) |
| **Quem puxa**   | Front: Arthur · upload e storage: Rian                                                                                                                                                                                                                              |
| **Aceite**      | criar conta nova, completar o onboarding, publicar um projeto, recarregar a página e encontrar tudo lá — e o projeto aparecer na busca por uma de suas tecnologias                                                                                                  |
| **Destrava**    | M6 — a curadoria só consegue buscar estudante por skill se o perfil existir no banco                                                                                                                                                                                |
| **Risco**       | upload de imagem consumir mais tempo que o previsto. Aceitável cair para link externo nesta rodada                                                                                                                                                                  |

### M5 · 02/11 — Lado do solicitante ativo

|                 |                                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entregáveis** | Wizard de nova demanda gravando de verdade (RF09, RF10); acompanhamento de status real, não lista fixa (RF11); tela de correção quando a curadoria pede ajuste (RF12); endpoints de demanda com as transições de status; resultados do questionário consolidados |
| **Quem puxa**   | Front: Arthur · endpoints e transições: Rian · consolidação ACE1: Davi                                                                                                                                                                                           |
| **Aceite**      | demanda criada pelo solicitante aparece na fila da curadoria na mesma sessão, sem dado semeado no meio do caminho                                                                                                                                                |
| **Destrava**    | M6 — a triagem precisa de demanda real entrando na fila                                                                                                                                                                                                          |
| **Risco**       | é aqui que a dívida das bases paralelas cobra a fatura se M1 não fechou de verdade                                                                                                                                                                               |

### M6 · 09/11 — Fluxo principal completo (semana crítica)

|                 |                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entregáveis** | Triagem com aprovar, recusar e pedir ajuste (RF13, RF14); busca de estudante por habilidade, projeto e disponibilidade (RF15); convite a um ou mais estudantes (RF16); aceite e recusa (RF17); conexão com liberação de contato só após aceite (RF18, RN08); histórico de decisões da curadoria (RF19); `scoreStudent` usando os níveis de proficiência já coletados e normalizando nomes de tecnologia |
| **Quem puxa**   | Rian e Arthur em par · algoritmo: Davi                                                                                                                                                                                                                                                                                                                                                                  |
| **Aceite**      | os 11 passos do fluxo principal do documento de requisitos percorridos ponta a ponta, com dados persistindo entre reloads e o contato invisível antes do aceite                                                                                                                                                                                                                                         |
| **Destrava**    | é a entrega. As três peças inegociáveis do produto passam por aqui                                                                                                                                                                                                                                                                                                                                      |
| **Risco**       | maior concentração de trabalho do cronograma. **Nada de escopo novo entra depois de 02/11**                                                                                                                                                                                                                                                                                                             |

### M7 · 16/11 — Feature freeze funcional

|                 |                                                                                                                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entregáveis** | Área de administrador (usuários, projetos, pedidos, permissões); painel de impacto derivando de uso real, não de `data/impact.ts`; testes nos pontos críticos (match, transições de status, autorização por papel); sistema publicado em ambiente estável |
| **Quem puxa**   | Admin: Rian · impacto: Arthur · testes: todos, um bloco cada                                                                                                                                                                                              |
| **Aceite**      | suíte de testes verde no CI e o ambiente publicado percorrendo o fluxo inteiro sem erro de console                                                                                                                                                        |
| **Destrava**    | M8 — o pitch precisa dos números reais que o painel passa a derivar                                                                                                                                                                                       |
| **Risco**       | deixar deploy para a última semana. O ambiente publicado tem que existir aqui, não em 23/11                                                                                                                                                               |

### M8 · 23/11 — Entrega

|                 |                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entregáveis** | Deploy estável; README alinhado ao código; revisão de acessibilidade e responsivo; pitch atualizado com os números reais de validação; evidência de alcance externo para a ACE1 |
| **Quem puxa**   | Todos                                                                                                                                                                           |
| **Aceite**      | entrega aceita nas duas disciplinas                                                                                                                                             |
| **Corte**       | funcionalidade congela na quarta, 19/11. Quinta e sexta só correção de bug                                                                                                      |
| **Risco**       | querer incluir uma última feature na semana da entrega                                                                                                                          |

## Riscos

| Risco                             | Mitigação                                               |
| --------------------------------- | ------------------------------------------------------- |
| Decisão de escopo arrastar        | prazo duro: 05/10. Na dúvida, seguir o código (empresa) |
| Back-end atrasar e travar o front | manter camada de API isolada com mock trocável          |
| ACE1 virar corrida no fim         | questionário aplicado até 19/10, não em novembro        |
| Semana 6 concentrar muito         | é a semana crítica: nada de escopo novo depois de 02/11 |
