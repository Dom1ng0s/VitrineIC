# Contexto do VitrineIC

> Atualização de 25/11/2026: o backend está implementado e integrado
> (PostgreSQL em 3FN). A referência de execução, persistência, segurança e
> endpoints é [docs/backend.md](../docs/backend.md); o que falta no projeto e
> em que ordem está em
> [docs/plano-de-completude.md](../docs/plano-de-completude.md). Se algum
> arquivo de contexto falar em ausência de backend, simulação ou
> `localStorage`, está descrevendo o protótipo anterior — avise ou corrija.

Contexto curado para agentes de IA e para quem entra no projeto. Cada arquivo
cobre um assunto e é curto de propósito: **leia só o que a tarefa exige**.

| Arquivo                                    | Leia quando                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| [01-produto.md](01-produto.md)             | precisar saber o que o VitrineIC é, para quem, e o que não pode ser cortado |
| [02-arquitetura.md](02-arquitetura.md)     | for mexer em estrutura, roteamento, build ou criar arquivo novo             |
| [03-dominio.md](03-dominio.md)             | for mexer em demanda, estudante, status ou no algoritmo de match            |
| [04-design-system.md](04-design-system.md) | for escrever ou ajustar UI                                                  |
| [05-convencoes.md](05-convencoes.md)       | for escrever código                                                         |
| [06-estado-atual.md](06-estado-atual.md)   | precisar saber o que já funciona de verdade e o que é fachada               |
| [07-glossario.md](07-glossario.md)         | encontrar um termo que não reconhece                                        |

## Ordem sugerida

Tarefa de UI: 04 → 05 → o arquivo do componente.
Tarefa de domínio ou dados: 03 → 06.
Tarefa estrutural: 02 → 06 → `docs/analise-frontend.md`.

## Onde está o resto

- **`AGENTS.md`** (raiz) — mapa tarefa → arquivo. É o ponto de partida para
  achar código sem varrer `src/`.
- **`docs/analise-frontend.md`** — análise longa: 14 telas, fluxograma completo,
  modelo de dados, maturidade por fluxo. Consulte para profundidade; estes
  arquivos de contexto são o resumo operacional.
- **`docs/modelo-de-negocio.md`** e **`docs/perguntas-brainstorming.md`** —
  material original da equipe.
- **`README.md`** (raiz) — visão do projeto escrita pela equipe. Atenção: está
  desatualizado em relação ao código (ver 01-produto.md).

## As cinco coisas que mais causam erro aqui

1. **Todo dado em `src/data/` é fictício** — e é só semente do seed. As telas
   leem estudantes, solicitantes, demandas e interesses do store, que vem da
   API; quem lê o arquivo direto não vê conta recém-criada.
2. **O estado é do servidor.** `useVitrine` é cache de `/api/state`, e toda
   escrita devolve o estado inteiro. Autorização e filtro de contato são
   decididos no SQL — não confie em filtro de frontend, nem o repita.
3. **Cada área tem seu próprio `ui.tsx`**, parecidos mas não idênticos; mudança
   em um não propaga. A `NavBar` já foi unificada em `app/AreaNav.tsx`.
4. **Navegar é estado React, não URL.** Não existe rota, deep link nem 404; só
   os links de confirmação e recuperação usam fragmento.
5. **Parte do que a tela mostra é fachada declarada** — ranking sem níveis de
   proficiência, perfil inventado na vitrine do solicitante, prioridade de
   demanda que não existe. A lista completa está no plano de completude; não
   trate o que a tela exibe como prova de que o dado existe.
