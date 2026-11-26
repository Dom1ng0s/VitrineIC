# VitrineIC — Pitch

> Apresentação em 12 slides. Projeto final de **Programação 3 (Web)** e
> **ACE 1 (Atividade Curricular de Extensão)** — Instituto de Computação, UFAL.
>
> Todos os dados exibidos no protótipo são **fictícios**. Ao apresentar, diga
> isso uma vez, no slide 8, e siga.

---

## Slide 1 — Abertura

# VitrineIC

### Conectando inovação acadêmica a quem precisa dela

Instituto de Computação · UFAL · Maceió
Programação 3 (Web) + ACE 1

**Fala de apoio (15s):**
"Todo semestre, dezenas de projetos bons morrem em repositórios do GitHub que
ninguém abre. E, ao mesmo tempo, quem precisa de um desenvolvedor não sabe onde
procurar dentro do próprio Instituto. O VitrineIC resolve os dois lados do mesmo
problema."

---

## Slide 2 — O problema

**Fora do GitHub, não existe lugar onde o que o IC produz fique visível.**

Três consequências concretas:

- **Trabalho invisível.** O estudante constrói, entrega, arquiva. Ninguém vê.
- **Demanda sem porta.** Professor, laboratório ou empresa que precisa de alguém
  não tem onde publicar isso.
- **Network perdido.** Pessoas com interesses idênticos passam quatro anos no
  mesmo prédio sem se encontrar.

> O custo não é só do estudante. É do Instituto, que perde PIBIC, PIBITI e
> startups que nunca chegaram a começar.

---

## Slide 3 — A solução em uma frase

**Uma vitrine pública dos projetos do IC, um mural de demandas, e um match
direcionado com curadoria humana entre os dois.**

Três peças, nenhuma opcional:

| Peça                       | O que faz                                                                   |
| -------------------------- | --------------------------------------------------------------------------- |
| **Vitrine de projetos**    | o estudante expõe o que constrói, no espírito de startup em estágio inicial |
| **Mural de demandas**      | quem precisa publica o que precisa, com skills e escopo                     |
| **Match com crivo humano** | o sistema aponta **uma** pessoa; um curador decide e justifica              |

---

## Slide 4 — A decisão que nos diferencia

### Não é candidatura aberta.

Num mural comum, trinta pessoas se candidatam e alguém filtra trinta currículos.

No VitrineIC, **o algoritmo ordena e o humano decide**:

1. O sistema calcula compatibilidade e apresenta um ranking com justificativa
   visível.
2. O curador escolhe **uma** pessoa e **escreve o porquê**.
3. Só essa pessoa é contatada.

**A máquina nunca confirma sozinha.** O crivo humano não é espaço reservado no
design — é passo obrigatório do fluxo, com campo de justificativa registrado.

> Consequência assumida: isso tem custo humano recorrente. Está no modelo de
> negócio como custo, não escondido como detalhe de implementação.

---

## Slide 5 — Quem usa

| Perfil          | O que faz na plataforma                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| **Estudante**   | preenche perfil e competências, expõe projetos, recebe convites direcionados |
| **Solicitante** | publica a demanda em 4 passos, acompanha status, recebe o match              |
| **Curador**     | tria a fila, compara candidatos, confirma a conexão com justificativa        |
| **Visitante**   | navega o catálogo público, perfis e indicadores — **sem login**              |

A vitrine pública é o que sustenta a exigência de alcance externo da ACE1: o
trabalho do IC fica visível para quem nunca entrou na plataforma.

---

## Slide 6 — O fluxo ponta a ponta

```
SOLICITANTE            CURADORIA                     ESTUDANTE

publica demanda  ──►   triagem (kanban)
                       nova → em análise → aprovada
                                │
                       matchmaking: ranking
                       por compatibilidade
                                │
                       confirma 1 candidato   ──►    recebe convite
                       + justificativa               aceita / recusa
                                                            │
                       ◄──────── conexão estabelecida ──────┘
```

**Demonstração ao vivo:** este eixo — curadoria → convite → conexão — funciona
ponta a ponta no protótipo. É o que vamos mostrar.

---

## Slide 7 — Como o match funciona

Uma função, transparente e explicável:

```
score = (skills da demanda cobertas pelo estudante) ÷ (skills da demanda) × 100
```

**Escolhas de design, ditas em voz alta:**

- A **demanda é o denominador** — mede cobertura da necessidade, não o repertório
  do estudante.
- Nomes de tecnologia passam por normalização (`reactjs` e `react.js` viram
  `React`), então grafia diferente não quebra o match.
- **Limitações conhecidas:** os níveis de proficiência já são coletados e ainda
  não pesam na conta; disponibilidade e área de interesse ficam de fora; todas as
  skills valem igual.

> Preferimos um algoritmo que o curador consegue explicar ao estudante a um
> algoritmo que ninguém consegue auditar. A evolução natural é usar os níveis de
> proficiência que já estão na base.

---

## Slide 8 — O que está construído

React 19 + TypeScript strict + Vite + Tailwind v4 · ~6.600 linhas · 20 telas

| Fluxo                             | Estado                                             |
| --------------------------------- | -------------------------------------------------- |
| Triagem e match (curadoria)       | **funcional** — o estado muda e persiste na sessão |
| Convites do estudante             | **funcional** — aceite muda badge e contadores     |
| Vitrine de projetos (laboratório) | **funcional** — a lista cresce                     |
| Catálogo público, perfis, impacto | **funcional** — derivados da base única            |
| Onboarding e wizard de demanda    | **navegáveis** — os passos avançam, não gravam     |
| Autenticação e persistência       | **ainda não**                                      |

**Todos os dados são fictícios** — pessoas, empresas e métricas foram inventadas
para o protótipo.

---

## Slide 9 — Acessibilidade como requisito, não enfeite

Alvo: **WCAG 2.1 AA**, verificado e mantido.

- Contraste de texto em 4,5:1 — trocamos opacidade por tokens de cor dedicados,
  porque a opacidade derrubava o contraste para 2–3:1.
- Foco visível em todo controle, invertido sobre superfícies escuras.
- Todo campo com rótulo associado; interação só em elemento focável.
- Cada tela com `<h1>`, `<main>` e link "pular para o conteúdo".

> Uma vitrine que exclui leitores de tela não é uma vitrine pública.

---

## Slide 10 — Impacto e a ACE1

A plataforma **mede a si mesma**: os indicadores do painel de impacto são
derivados das bases em tempo de render, nunca digitados à mão.

| Indicador             | Meta do período |
| --------------------- | --------------- |
| Estudantes na vitrine | 8               |
| Projetos expostos     | 10              |
| Demandas publicadas   | 6               |
| Matches efetivados    | 3               |

Mais depoimentos de estudante e de solicitante — o qualitativo que número não
alcança.

**Visão de longo prazo:** a curadoria operada por um projeto de extensão dedicado
do IC. A exigência acadêmica fica amarrada dentro da arquitetura do produto, não
colada por fora.

---

## Slide 11 — Próximos passos

Os seis itens desta lista na versão anterior do pitch — base única,
persistência, autenticação, roteamento por URL, escopo do solicitante e
evolução do match — **estão entregues**. O que segue é o que ficou de fora,
em ordem de urgência.

### Confirmação de e-mail — a dívida de operação

Hoje a verificação de endereço está **desligada** (`MAIL_MODE=disabled`): quem
se cadastra entra na hora, sem link de confirmação. A razão é externa ao
código — enviar e-mail para qualquer destinatário exige um domínio com SPF e
DKIM configurados, e o `ic.ufal.br` depende da TI da UFAL.

A consequência a assumir em público: **a recuperação de senha não funciona**.
Quem esquece a senha precisa da coordenação. A API responde 503 com uma
mensagem clara, não falha calada, mas é uma muleta.

O caminho tem dois degraus: SMTP com uma conta institucional comum resolve
hoje, sem domínio próprio; o domínio verificado é o destino, e aí a
confirmação volta a ser obrigatória trocando uma variável.

### Decisões de produto em aberto

Duas, registradas na pauta da próxima reunião:

1. **Certificados do estudante** — a coluna existe no banco e na API, nenhuma
   tela a preenche. Entra no perfil, ou sai numa migração?
2. **Peso do contexto no match** — idioma e número de projetos aparecem para a
   curadoria, mas não contam no score. Skills e disponibilidade já contam.
   Devem passar a pesar, e quanto?

### Operação

3. **Backup agendado** — o script existe, com retenção de 14 dias; falta
   alguém chamá-lo todo dia.
4. **Domínio próprio** — sair do subdomínio da plataforma, o que também
   destrava a confirmação de e-mail acima.

---

## Slide 12 — Fechamento

# O que o IC constrói deve ser visível.

### E quem precisa disso deve saber onde procurar.

**VitrineIC** — vitrine pública, demanda com endereço, match com nome e
justificativa.

Instituto de Computação · UFAL
Programação 3 (Web) + ACE 1

_Perguntas?_

---

## Anexo — roteiro de demonstração (5 minutos)

| Tempo | Tela                    | O que mostrar                                         |
| ----- | ----------------------- | ----------------------------------------------------- |
| 0:00  | Landing                 | hero, destaques, indicadores                          |
| 0:40  | Catálogo público        | navegação **sem login**; abrir um projeto e um perfil |
| 1:30  | Solicitante             | wizard de nova demanda, 4 passos, protocolo gerado    |
| 2:30  | Curadoria — triagem     | mover uma demanda no kanban                           |
| 3:10  | Curadoria — matchmaking | ranking, justificativa, confirmar **um** candidato    |
| 4:00  | Estudante               | convite recebido, aceitar, conexão estabelecida       |
| 4:40  | Impacto                 | indicadores derivados da base                         |

**Recarregue a página de propósito** — o estado vive em PostgreSQL, e recarregar
na frente de quem assiste demonstra a persistência em vez de escondê-la. O bom
momento é logo depois do aceite do estudante: recarregar e a conexão continuar
lá prova o ponto sem precisar de slide.
