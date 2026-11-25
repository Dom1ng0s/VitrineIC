# VitrineIC — Template visual do Pitch Deck

> Esqueleto pronto para montar em Figma, Canva ou Google Slides. O **conteúdo
> falado** está em [`pitch-apresentacao.md`](pitch-apresentacao.md); este arquivo
> define **como cada slide é composto**: cores, tipografia, grid e placeholders.
>
> Uma ressalva honesta antes de começar: o VitrineIC é projeto de Programação 3
> + ACE 1, não uma startup levantando rodada. Os slides de **Mercado** e
> **Modelo de Negócios** existem aqui porque a estrutura de mercado pede, mas
> estão reescritos como *alcance* e *sustentação* — falar em TAM/SAM/SOM com
> dados fictícios queimaria a credibilidade da apresentação.

---

## 1. Design System extraído do app

Fonte: `src/index.css` (bloco `@theme`) e `src/styles/tokens.ts`.

### Paleta

| Papel no slide | Token | Hex | Uso |
|---|---|---|---|
| Fundo claro (padrão) | `offwhite` | `#F5F4F0` | fundo de 8 dos 12 slides |
| Fundo escuro (ênfase) | `navy` | `#1C2B4A` | capa, viradas de seção, fechamento |
| Texto sobre claro | — | `#0A0A0A` | corpo e títulos em fundo off-white |
| Texto sobre escuro | `offwhite` | `#F5F4F0` | corpo e títulos em fundo navy |
| Destaque / acento | `red` | `#c1121f` | uma única ênfase por slide, nunca duas |
| Texto secundário sobre claro | — | `#4A4A4A` | legendas, descrições |
| Texto secundário sobre escuro | — | `#C9CEDA` | legendas em fundo navy |
| Régua e borda sobre claro | navy 20% | `#1C2B4A33` | filetes de 1px, divisores |
| Régua e borda sobre escuro | off-white 25% | `#F5F4F040` | filetes de 1px em navy |

**Regras de cor, herdadas do produto:**

- O vermelho é **acento, não superfície**. Nunca um slide de fundo vermelho,
  nunca um bloco grande chapado — só número, palavra-chave, filete ou badge.
- **Não use opacidade para hierarquizar texto.** É a mesma decisão de
  acessibilidade do app: opacidade derruba contraste para 2–3:1. Use os dois
  tons secundários dedicados da tabela acima.
- Contraste alvo **4,5:1** em todo texto. Navy sobre off-white dá ~11:1;
  vermelho sobre off-white, ~6:1; vermelho sobre navy **reprova** — nunca
  combine os dois em texto.

### Tipografia

| Papel | Fonte | Peso | Tamanho (canvas 1920×1080) | Tracking |
|---|---|---|---|---|
| Título de slide | DM Serif Display | Regular | 72–96 pt | −1% |
| Subtítulo / frase de apoio | DM Serif Display *italic* | Regular | 40–48 pt | 0 |
| Corpo e listas | Inter | 400 | 28–32 pt | 0 |
| Destaque no corpo | Inter | 600 | 28–32 pt | 0 |
| Rótulo de seção (CAIXA ALTA) | Space Mono | 700 | 16–18 pt | +8% |
| Número grande / métrica | DM Serif Display | Regular | 120–160 pt | −2% |
| Código, score, protocolo | Space Mono | 400 | 22–26 pt | 0 |

As três estão no Google Fonts, mesmo import do app: DM Serif Display, Inter
(300–700), Space Mono (400/700).

### Grid e componentes-mestre

- Canvas **1920×1080**, margem de **96 px** em todos os lados.
- **12 colunas**, gutter de 32 px. Título ocupa 8 colunas; nunca as 12.
- **Rodapé fixo** nos slides internos (2 a 11): `VITRINEIC · IC/UFAL` em Space
  Mono 14 pt à esquerda, número do slide à direita.
- **Rótulo de seção** no topo de cada slide interno: Space Mono caixa alta em
  `#c1121f`, com filete de 1px navy 20% abaixo. É a assinatura visual do deck.
- Cantos **retos** — o app usa raio mínimo; canto arredondado destoa.
- Sem sombra, sem gradiente, sem ícone genérico de banco de imagem.

---

## 2. Mapa: estrutura de mercado → slides deste deck

| Estrutura pedida | Slide aqui |
|---|---|
| 1. Capa / one-liner | **1** |
| 2. O problema | **2** |
| 3. A solução | **3** |
| 4. Produto / demonstração | **4** e **5** |
| 5. Mercado | **6** — *alcance e escala no IC* |
| 6. Modelo de negócios | **7** — *quem opera e a que custo* |
| 7. Concorrência / diferencial | **8** |
| 8. Tração / roadmap | **9** e **10** |
| 9. Equipe | **11** |
| 10. CTA / contato | **12** |

---

## 3. Slide a slide

### Slide 1 — Capa

- **Cores:** fundo `#1C2B4A`. Título e subtítulo `#F5F4F0`. Filete em `#c1121f`.
- **Tipografia:** título DM Serif Display 140 pt; subtítulo DM Serif italic
  48 pt; assinatura institucional Space Mono 18 pt caixa alta.
- **Layout:** texto à esquerda, ancorado a 40% da altura. Metade direita
  reservada ao mockup, sangrando pela borda.

```
┌──────────────────────────────────────────────┐
│ ▎(filete vermelho 4px × 80px)                │
│                                              │
│  VitrineIC                    [Placeholder:  │
│  Conectando inovação           mockup da     │
│  acadêmica a quem              landing em    │
│  precisa dela                  notebook,     │
│                                sangrando]    │
│  INSTITUTO DE COMPUTAÇÃO · UFAL              │
│  PROGRAMAÇÃO 3 (WEB) + ACE 1                 │
└──────────────────────────────────────────────┘
```

- `[Placeholder: screenshot da landing em moldura de notebook, 55% da largura, sangrando à direita]`
- **Conteúdo:** nome, one-liner, vínculo institucional, disciplinas.

---

### Slide 2 — O problema

- **Cores:** fundo `#F5F4F0`, texto `#0A0A0A`, rótulo e os numerais
  `01 02 03` em `#c1121f`.
- **Tipografia:** título DM Serif 80 pt; rótulo de cada item Inter 600 32 pt;
  explicação Inter 400 26 pt em `#4A4A4A`.
- **Layout:** título em 8 colunas; abaixo, **três colunas iguais** separadas por
  filete vertical de 1px navy 20%.

```
RÓTULO: O PROBLEMA
───────────────────────────────────────────────
Fora do GitHub, não existe lugar
onde o que o IC produz fique visível.

 01              │ 02              │ 03
 Trabalho        │ Demanda         │ Network
 invisível       │ sem porta       │ perdido
 [2 linhas]      │ [2 linhas]      │ [2 linhas]
───────────────────────────────────────────────
 [faixa navy com a citação do custo institucional]
```

- `[Placeholder: faixa inferior de largura total, fundo navy, altura 140px, citação em DM Serif italic off-white]`
- **Conteúdo:** os três custos concretos + a frase de que o custo é
  institucional (PIBIC, PIBITI, startups que não começaram).

---

### Slide 3 — A solução

- **Cores:** fundo `#F5F4F0`. **Cartão central em `#1C2B4A`** com texto
  off-white — é a peça diferenciada. Cartões laterais em `#FFFFFF` com borda
  1px navy 20%.
- **Tipografia:** título DM Serif 80 pt; nome de cada peça Inter 600 30 pt;
  descrição Inter 400 24 pt.
- **Layout:** três cartões lado a lado, o do meio **40 px mais alto** e em navy.

```
RÓTULO: A SOLUÇÃO
Uma vitrine pública, um mural de demandas,
e um match com curadoria humana entre os dois.

┌──────────┐  ┏━━━━━━━━━━┓  ┌──────────┐
│ Vitrine  │  ┃ Match    ┃  │ Mural de │
│ de       │  ┃ com      ┃  │ demandas │
│ projetos │  ┃ crivo    ┃  │          │
│          │  ┃ humano   ┃  │          │
└──────────┘  ┗━━━━━━━━━━┛  └──────────┘
  [ícone]       [ícone]        [ícone]
```

- `[Placeholder: 3 ícones de linha, traço 1,5pt navy (off-white no cartão central) — evite ícone colorido de biblioteca]`
- **Conteúdo:** a frase-solução e as três peças, "nenhuma opcional".

---

### Slide 4 — O produto: o fluxo ponta a ponta

- **Cores:** fundo `#F5F4F0`. Caixas com borda navy 1px e fundo branco. **Uma
  única caixa em vermelho:** "confirma 1 candidato + justificativa". Setas navy
  1,5pt.
- **Tipografia:** título DM Serif 72 pt; rótulos das raias Space Mono 700 caixa
  alta 18 pt; texto das caixas Inter 400 22 pt.
- **Layout:** **três raias horizontais** (Solicitante / Curadoria / Estudante),
  fluxo da esquerda para a direita, rótulo na margem esquerda.

```
RÓTULO: O PRODUTO — FLUXO
SOLICITANTE │ publica demanda
────────────┼──────────────────────────────────────────
CURADORIA   │ triagem → ranking → [CONFIRMA 1 + JUSTIFIC.]
            │            ▲
────────────┼────────────│─────────────────────────────
ESTUDANTE   │ cria perfil e publica portfólio   convite ▸ aceita
────────────┴──────────────────────────────────────────
     [faixa navy] conexão estabelecida
```

A raia do estudante **começa antes da demanda existir**: o perfil e o portfólio
publicados são o que alimenta a base que o ranking lê — uma seta sobe dessa
caixa para o ranking. Sem perfil publicado, o estudante não aparece em ranking
nenhum. A conexão fecha em faixa navy de largura total, porque é desfecho das
três raias, não de uma.

- `[Placeholder: opcional — 3 miniaturas de tela ancoradas na raia correspondente, 220px de largura, borda 1px]`
- **Conteúdo:** as etapas e a frase "este eixo funciona ponta a ponta no
  protótipo — é o que vamos mostrar".

---

### Slide 5 — Demonstração e a UI

- **Cores:** fundo `#1C2B4A` — vira o ritmo do deck e faz as telas claras
  saltarem. Legendas `#F5F4F0`, numeração dos passos `#c1121f`.
- **Tipografia:** título DM Serif 72 pt off-white; legendas Inter 400 22 pt;
  tempos do roteiro em Space Mono 20 pt.
- **Layout:** **uma tela grande à esquerda** (60%) e **três miniaturas
  empilhadas à direita** (40%), cada uma com tempo e legenda de uma linha.

```
RÓTULO: DEMONSTRAÇÃO                  (fundo navy)
┌───────────────────────┐  0:40 ┌─────────┐ catálogo
│                       │       └─────────┘
│  [Placeholder: tela   │  3:10 ┌─────────┐ matchmaking
│   de matchmaking]     │       └─────────┘
│                       │  4:00 ┌─────────┐ convite aceito
└───────────────────────┘       └─────────┘
```

- `[Placeholder: screenshot grande do matchmaking — ranking com justificativa visível]`
- `[Placeholder: 3 screenshots menores — catálogo público, triagem (kanban), conexão estabelecida]`
- **Conteúdo:** o roteiro de 5 minutos do anexo do pitch. Nota de operação: não
  recarregar a página durante a demo.

---

### Slide 6 — Alcance e escala *(o slide de "Mercado")*

- **Cores:** fundo `#F5F4F0`. Números grandes em `#1C2B4A`, rótulos em
  `#4A4A4A`, a progressão dos anéis marcada em `#c1121f`.
- **Tipografia:** números DM Serif 140 pt; rótulos Space Mono 16 pt caixa alta;
  notas Inter 400 22 pt.
- **Layout:** **três anéis concêntricos** à esquerda (IC → UFAL → Maceió) e a
  lista de metas do período à direita.

```
RÓTULO: ALCANCE
        ╭────────────╮        Metas do período
      ╭─┤  UFAL      ├─╮       8  estudantes
    ╭─┤ │  ╭──────╮  │ ├─╮    10  projetos
    │ │ │  │  IC  │  │ │ │     6  demandas
    ╰─┤ │  ╰──────╯  │ ├─╯     3  matches
      ╰─┤  Maceió    ├─╯
        ╰────────────╯        derivados da base, em render
```

- `[Placeholder: números reais de matrícula do IC/UFAL — buscar no relatório institucional antes de apresentar]`
- **Conteúdo:** o alcance cresce por anéis, não por TAM inventado. Os números do
  protótipo são metas de período, e os indicadores do painel são **derivados das
  bases**, não digitados. **Aviso de dados fictícios: aqui.**

---

### Slide 7 — Quem opera e a que custo *(o slide de "Modelo de Negócios")*

- **Cores:** fundo `#F5F4F0`. Cabeçalho da tabela em `#1C2B4A` com texto
  off-white; linhas alternadas `#FFFFFF` / `#F5F4F0`. A linha de custo humano
  recebe filete lateral de 4px em `#c1121f`.
- **Tipografia:** título DM Serif 72 pt; tabela Inter 400 24 pt, cabeçalho
  Inter 600.
- **Layout:** tabela de duas colunas em 8 colunas de grid; bloco vertical de 4
  colunas à direita com a decisão assumida.

```
RÓTULO: SUSTENTAÇÃO
┌───────────────┬──────────────────┐  ┌──────────┐
│ Bloco         │ No VitrineIC     │  │ O custo  │
├───────────────┼──────────────────┤  │ humano   │
│ Quem opera    │ projeto de ext.  │  │ está no  │
│ Quem custeia  │ o Instituto      │  │ modelo,  │
│▎Custo humano  │ curadoria recor. │  │ não      │
│ Receita       │ não monetária    │  │ escondido│
└───────────────┴──────────────────┘  └──────────┘
```

- `[Placeholder: Business Model Canvas simplificado — redesenhar o canvas do documento de definição da equipe na paleta navy/off-white]`
- **Conteúdo:** operação por projeto de extensão do IC; a curadoria tem custo
  recorrente e isso está declarado; não há monetização — o retorno é
  institucional (PIBIC/PIBITI, portfólio, extensão cumprida).

---

### Slide 8 — O diferencial

- **Cores:** fundo `#1C2B4A`. Lado "mural comum" com traço off-white 25% e texto
  `#C9CEDA`; lado "VitrineIC" com traço `#c1121f` e texto `#F5F4F0`.
- **Tipografia:** título DM Serif 80 pt; cabeçalhos das colunas Space Mono 700
  caixa alta 20 pt; itens Inter 400 26 pt; frase final DM Serif italic 44 pt.
- **Layout:** duas colunas simétricas, divisor vertical de 1px ao centro; frase
  final de largura total no pé.

```
RÓTULO: DIFERENCIAL                    (fundo navy)
MURAL COMUM              │ VITRINEIC
30 candidaturas          │ ranking com justificativa
alguém filtra 30 CVs     │ curador escolhe UMA pessoa
ninguém sabe o porquê    │ o porquê fica registrado
─────────────────────────┴───────────────────────────
"A máquina nunca confirma sozinha."
```

- `[Placeholder: recorte do campo de justificativa no modal de confirmação — prova de que o crivo humano é passo do fluxo, não promessa]`
- **Conteúdo:** não é candidatura aberta; o algoritmo ordena, o humano decide; o
  campo de justificativa é obrigatório.

---

### Slide 9 — O que está construído *(tração)*

- **Cores:** fundo `#F5F4F0`. Badges: **funcional** = navy sólido, texto
  off-white; **navegável** = branco com borda navy; **ainda não** = borda 1px
  `#c1121f` e texto `#c1121f`.
- **Tipografia:** título DM Serif 72 pt; faixa de stack Space Mono 22 pt; tabela
  Inter 400 24 pt; badges Space Mono 700 14 pt caixa alta.
- **Layout:** faixa de stack no topo em uma linha; lista de fluxo + badge
  abaixo; nota de dados fictícios no pé.

```
RÓTULO: TRAÇÃO
REACT 19 · TYPESCRIPT STRICT · VITE · TAILWIND V4 · ~6.600 LINHAS · 20 TELAS
────────────────────────────────────────────────────
Triagem e match ....................... [FUNCIONAL]
Convites do estudante ................. [FUNCIONAL]
Vitrine de projetos ................... [FUNCIONAL]
Catálogo público e impacto ............ [FUNCIONAL]
Onboarding e wizard de demanda ........ [NAVEGÁVEL]
Autenticação e persistência ........... [AINDA NÃO]
────────────────────────────────────────────────────
Todos os dados exibidos são fictícios.
```

- `[Placeholder: opcional — barras finas por área do código; se não agregar, deixe o slide respirar]`
- **Conteúdo:** a tabela de estado, sem adjetivo inflado. A honestidade sobre o
  que não existe é o que dá peso ao que existe.

---

### Slide 10 — Roadmap e acessibilidade

- **Cores:** fundo `#F5F4F0`. Lista em navy; o item 1 (unificar bases) marcado
  em `#c1121f` como maior risco. Cartão de acessibilidade em navy.
- **Tipografia:** título DM Serif 72 pt; itens Inter 400 26 pt, o primeiro em
  Inter 600; cartão Inter 400 22 pt off-white.
- **Layout:** lista numerada em 7 colunas à esquerda; cartão navy de 5 colunas à
  direita, altura total.

```
RÓTULO: PRÓXIMOS PASSOS
1 ▎Unificar as bases ← maior risco    ┏━━━━━━━━━━━━━━┓
2   Fechar o escopo do solicitante    ┃ WCAG 2.1 AA  ┃
3   Persistência                      ┃ contraste    ┃
4   Autenticação institucional        ┃ 4,5:1        ┃
5   Match com níveis de proficiência  ┃ foco visível ┃
6   Roteamento por URL                ┃ rótulos      ┃
                                      ┗━━━━━━━━━━━━━━┛
```

- `[Placeholder: print de verificação de contraste ou do foco visível — evidência de que o AA foi medido, não afirmado]`
- **Conteúdo:** os seis passos em ordem de dependência. A frase "uma vitrine que
  exclui leitores de tela não é uma vitrine pública" cabe como legenda do cartão.

---

### Slide 11 — A equipe

- **Cores:** fundo `#F5F4F0`; nome em `#1C2B4A`, função em `#4A4A4A`, filete sob
  cada nome em `#c1121f`.
- **Tipografia:** título DM Serif 72 pt; nomes DM Serif 36 pt; funções Space
  Mono 16 pt caixa alta.
- **Layout:** três blocos iguais lado a lado. Foto **quadrada**, preto e branco,
  320×320 — não use círculo nem fundo colorido variando entre as fotos.

```
RÓTULO: EQUIPE
┌────────┐   ┌────────┐   ┌────────┐
│ [foto] │   │ [foto] │   │ [foto] │
└────────┘   └────────┘   └────────┘
Davi         Arthur       Rian
Domingos     Melo         Américo
▎LIDERANÇA   ▎FRONT-END   ▎BACK-END
 E BANCO
```

- `[Placeholder: 3 retratos 320×320, preto e branco, mesmo enquadramento e mesma luz]`
- **Conteúdo:** os três integrantes e suas responsabilidades; uma linha de
  crédito à orientação da disciplina, se houver professor a creditar.

---

### Slide 12 — Fechamento e contato

- **Cores:** fundo `#1C2B4A`, texto `#F5F4F0`. Um único elemento em `#c1121f`:
  o filete acima do título.
- **Tipografia:** frase-título DM Serif 96 pt; segunda linha DM Serif italic
  48 pt; contato Space Mono 20 pt.
- **Layout:** espelha a capa — texto à esquerda, ancorado a 40% da altura. No
  lugar do mockup, **QR code** no canto inferior direito.

```
┌──────────────────────────────────────────────┐
│ ▎                                            │
│  O que o IC constrói                         │
│  deve ser visível.                           │
│  E quem precisa disso deve                   │
│  saber onde procurar.                        │
│                                              │
│  VITRINEIC · IC/UFAL          ┌────┐         │
│  github.com/…                 │ QR │         │
│  Perguntas?                   └────┘         │
└──────────────────────────────────────────────┘
```

- `[Placeholder: QR code do repositório ou do deploy — off-white sobre navy, 240×240]`
- `[Placeholder: e-mails de contato dos três integrantes, uma linha]`
- **Conteúdo:** frase de fechamento, assinatura institucional, contato e convite
  a perguntas.

---

## 6. Adendo — o deck montado tem 17 slides

O `.pptx` cresceu além do esqueleto de 12: dois slides vieram da sondagem e três
foram abertos para explicar a ideia com profundidade. A ordem final:

| # | Slide | Fundo |
|---|---|---|
| 1 | Capa | navy |
| 2 | O problema (com os dados da sondagem) | claro |
| 3 | A solução — três peças | claro |
| 4 | **Quem usa — quatro papéis** | claro |
| 5 | **Anatomia de uma demanda** | navy |
| 6 | O fluxo ponta a ponta | claro |
| 7 | **Como o match funciona** | claro |
| 8 | Demonstração | navy |
| 9 | Alcance e escala | claro |
| 10 | Quem opera e a que custo | claro |
| 11 | O diferencial | navy |
| 12 | **A sondagem sustenta** | claro |
| 13 | **A sondagem derruba** | navy |
| 14 | O que está construído | claro |
| 15 | Roadmap e acessibilidade | claro |
| 16 | A equipe | claro |
| 17 | Fechamento | navy |

### Slide 4 — Quem usa

Quatro cartões; o do **visitante** em navy, porque o papel que nunca faz login é
o que sustenta a exigência de alcance externo da ACE1. Cada cartão fecha com um
rótulo mono em vermelho dizendo por onde a pessoa entra.

### Slide 5 — Anatomia de uma demanda

Um cartão off-white sobre fundo navy reproduzindo a demanda `VIC-2026-0041` como
ela existe no protótipo: protocolo, status, título, descrição, área, escopo,
prazo e as cinco competências em tags. À direita, por que esses campos bastam —
as competências são o único campo que o algoritmo lê.

### Slide 7 — Como o match funciona

A fórmula em faixa mono, o ranking real dessa demanda com barras de score, e o
achado que fecha o argumento: **Rafael e Bruno empatam em 80%**. A conta não
resolve; o curador resolve. Ao lado, em caixa de borda vermelha, o que a conta
não faz — proficiência, disponibilidade, peso por skill.

### Slides 12 e 13 — A sondagem

12 traz seis cartões de estatística (11/17 trabalho invisível, 5/17 não mostram
em lugar nenhum, 11/17 perdem oportunidades, 14/17 criariam perfil, 15/17 querem
análise humana, 13/17 esperam os dois lados) e, no pé, a ressalva de amostra:
17 respostas, 16 de computação, instituições mistas, **não é amostra do IC**.

13 é o contraponto, em navy: 11/17 preferem a demanda aberta, 2/17 preferem o
convite direcionado, 6/17 temem ser a única pessoa contatada — com a resposta do
produto ao lado.

> Uma banca perdoa um dado contrário assumido; não perdoa um dado contrário que
> ela mesma encontra no CSV.


---

## 4. Ritmo de fundos

Alterne para o deck não virar uma parede só:

No deck de 17 slides os fundos navy caem em **1, 5, 8, 11, 13 e 17** — capa,
anatomia da demanda, demonstração, diferencial, contraponto e fechamento. Nunca
mais de três slides claros seguidos.

## 5. Checklist antes de apresentar

- [ ] Nenhum texto vermelho sobre navy, nem navy sobre vermelho.
- [ ] Nenhuma hierarquia feita por opacidade — só cor dedicada e peso.
- [ ] Um único acento vermelho por slide.
- [ ] Rodapé e rótulo de seção presentes em todos os internos (2 a 11).
- [ ] Screenshots em 2× e sem dado real de pessoa.
- [ ] "Dados fictícios" dito uma vez, no slide 6 ou 9, e não repetido.
- [ ] Deck exportado em PDF — não dependa de fonte instalada na máquina da sala.
