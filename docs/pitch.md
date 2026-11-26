# VitrineIC — Apresentação final

Roteiro da apresentação final de **Programação 3 (Web)** e **ACE 1 (Atividade
Curricular de Extensão 1)** — Instituto de Computação, UFAL.

Cada seção é um slide. O texto em citação é a fala sugerida, não o que vai
projetado. Os números foram conferidos no código em 26/11/2026; as fontes estão
no Anexo B.

---

## Slide 1 — Abertura

# VitrineIC

### Conectando o que o IC constrói a quem precisa disso

**Davi Domingos de Oliveira** · **Arthur Melo** · **Rian Américo**
Instituto de Computação — UFAL · 2026.2

---

## Slide 2 — A equipe

| Integrante                    | Função                               |
| ----------------------------- | ------------------------------------ |
| **Davi Domingos de Oliveira** | Liderança e gestão de banco de dados |
| **Arthur Melo**               | Desenvolvimento front-end            |
| **Rian Américo**              | Desenvolvimento back-end             |

> Três pessoas, oito semanas, cerca de 10h por semana cada. A divisão não foi
> só de tarefas: cada um respondeu por uma camada inteira do sistema.

---

## Slide 3 — O problema

**Os dois lados existem. O canal entre eles, não.**

Estudantes do IC acumulam habilidade técnica ao longo do curso e esbarram na
falta de visibilidade. Do outro lado, professores, coordenações e setores da
universidade precisam de software e não sabem a quem recorrer.

Hoje esse encontro depende de **indicação informal**. Quem não está no grupo
certo de WhatsApp não é indicado.

O custo é de mão dupla:

- Projetos acadêmicos terminam o semestre sem aplicação prática — o estudante
  não constrói portfólio nem experiência.
- Demandas reais ficam sem atendimento, ou travam antes de começar porque
  ninguém ajudou a definir o escopo técnico.

> O talento existe e a demanda existe. O que falta é infraestrutura de
> encontro.

---

## Slide 4 — A solução em uma frase

**Uma vitrine de quem constrói, um mural de quem precisa, e curadoria humana
no meio.**

1. **Vitrine** — o estudante monta um perfil público: competências com nível
   de proficiência, idiomas, áreas de interesse e portfólio.
2. **Mural** — o solicitante publica a demanda: problema, tipo de sistema,
   prazo e competências desejadas.
3. **Curadoria** — a triagem avalia viabilidade técnica e adequação ao momento
   de formação do estudante antes de qualquer contato acontecer.

---

## Slide 5 — A decisão que nos diferencia

### Não é candidatura aberta. É aceite duplo.

A plataforma **não** publica uma vaga e abre concorrência. Ela aponta o perfil
mais compatível e exige que **as duas partes digam sim** antes de liberar
qualquer contato.

Isso é regra de servidor, não combinado social: enquanto o aceite duplo não
acontece, o e-mail do estudante e o contato da organização **não saem da API**.
Há teste automatizado que falha se vazarem.

> Concorrência aberta devolveria ao estudante exatamente a experiência que ele
> já tem: mandar currículo e não receber resposta.

---

## Slide 6 — Quem usa

| Papel           | O que faz                                                       |
| --------------- | --------------------------------------------------------------- |
| **Estudante**   | Monta o perfil, vê oportunidades, se candidata, aceita convites |
| **Solicitante** | Publica demandas, vê interessados, aceita ou recusa             |
| **Curadoria**   | Tria demandas, roda o matchmaking, sugere pares, dá parecer     |
| **Visitante**   | Navega o catálogo público, o diretório e o painel de impacto    |

A curadoria tem três níveis internos — **curador**, **coordenação** e
**comitê** — com permissões distintas. O comitê de alunos lê e opina; não
decide sozinho.

---

## Slide 7 — O fluxo ponta a ponta

```
Solicitante publica demanda
        ↓
   [ nova ] → curadoria tria → [ em análise ] → [ aprovada ] ou [ rejeitada ]
        ↓
Matchmaking: ranking de estudantes compatíveis
        ↓
Interesse nasce de três origens:
  · candidatura  (estudante se oferece)
  · convite      (solicitante chama)
  · sugestão     (curadoria aponta)
        ↓
   Aceite duplo
        ↓
[ contato liberado ] → e-mails revelados, mensagens abertas
        ↓
   [ encerrada ]
```

São **sete status** de demanda, com histórico de transições gravado: quem
mudou, quando e por quê.

---

## Slide 8 — Como o match funciona

Score de 0 a 100, com **uma única implementação** no projeto — a mesma que
ordena as oportunidades do estudante e alimenta o ranking da curadoria.

| Peso       | Critério                                                   |
| ---------- | ---------------------------------------------------------- |
| **75 pts** | Competências — peso 2 para obrigatórias, 1 para desejáveis |
| **15 pts** | Área — afinidade com interesses e projetos do estudante    |
| **10 pts** | Disponibilidade — zerada se o estudante já está em projeto |

As competências são ponderadas pelo **nível declarado** (1 a 4): um básico vale
0,65 do peso; um avançado, 1,0.

> O score **ordena**, não decide. A curadoria vê o ranking e escolhe. Um
> algoritmo que ninguém consegue auditar não tem lugar numa decisão sobre a
> formação de alguém.

---

## Slide 9 — O que está construído

**Não é protótipo. É sistema em produção.**

| Camada     | Entrega                                                     |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 19 + TypeScript strict + Vite + Tailwind v4           |
| Backend    | Fastify 5 + PostgreSQL, SQL escrito à mão, sem ORM          |
| Banco      | **32 tabelas em 3ª forma normal**, 8 migrações com checksum |
| API        | **40 rotas**, autorização verificada no servidor            |
| Testes     | **107 testes** automatizados, em 16 arquivos                |
| Código     | cerca de 14.700 linhas de TypeScript                        |
| Publicação | Docker, deploy automático, healthcheck, backup com retenção |

Todos os fluxos são **funcionais e persistentes**: autenticação com hash
scrypt e cookie HttpOnly, triagem, matchmaking, interesses nas três origens,
demandas, projetos, mensagens, notificações, catálogo público e indicadores.

---

## Slide 10 — As decisões técnicas que valeram a pena

**Base única.** Demandas e interesses vivem no banco, com um só vocabulário de
status. Em protótipo, curadoria e solicitante liam listas paralelas que podiam
divergir — cada tela nova encarecia o conserto.

**Autorização em SQL, não em JavaScript.** O filtro de contato não está na
tela: está na consulta. O frontend não tem como vazar o que a API nunca
enviou.

**3ª forma normal de verdade.** Competências, idiomas e tópicos saíram de
colunas repetidas para tabelas de relacionamento. Acabaram os grupos
repetitivos e os mapas paralelos que podiam discordar entre si.

**Migrações com checksum e trava.** Uma migração já aplicada não muda sem o
sistema perceber, e duas instâncias subindo juntas não colidem.

---

## Slide 11 — Acessibilidade como requisito

Alvo: **WCAG 2.1 AA**, verificado por ferramenta e mantido no CI.

- Contraste de texto em 4,5:1 — trocamos opacidade por tokens de cor
  dedicados, porque a opacidade derrubava o contraste para 2–3:1.
- Foco visível em todo controle, invertido sobre superfícies escuras.
- Todo campo com rótulo associado; erro ligado por `aria-describedby` e foco
  no primeiro campo inválido.
- Cada tela com `<h1>`, `<main>` e link "pular para o conteúdo".

A regra de lint `jsx-a11y` está em **erro**, não aviso: código inacessível não
passa no CI.

> Uma vitrine que exclui leitores de tela não é uma vitrine pública.

---

## Slide 12 — Impacto e a ACE 1

A plataforma **mede a si mesma**: os indicadores do painel de impacto são
derivados das bases em tempo de consulta, nunca digitados à mão. O período vem
das datas reais do banco; as metas, de uma tabela própria.

| Indicador             | Meta do período |
| --------------------- | --------------- |
| Estudantes na vitrine | 8               |
| Projetos expostos     | 10              |
| Demandas publicadas   | 6               |
| Matches efetivados    | 3               |

**Visão de longo prazo:** a curadoria operada por um projeto de extensão
dedicado do IC. A exigência acadêmica da ACE 1 fica amarrada dentro da
arquitetura do produto, não colada por fora.

---

## Slide 13 — Modelo de negócio

Os nove blocos do Canvas estão em [modelo-de-negocio.md](modelo-de-negocio.md).
Os três que sustentam o resto:

- **Segmentos** — estudantes do IC; professores, coordenações e setores da
  UFAL; organizações externas.
- **Proposta de valor** — para o estudante, portfólio e experiência real; para
  o solicitante, apoio técnico acessível com escopo definido por quem entende.
- **Recursos-chave** — a equipe de curadoria. É ela que transforma uma lista de
  perfis em encontro, e é o que a plataforma não terceiriza para algoritmo.

---

## Slide 14 — O que ficou para depois

**Confirmação de e-mail.** Está desligada hoje. Enviar e-mail para qualquer
destinatário exige domínio com SPF e DKIM, e o `ic.ufal.br` depende da TI da
UFAL. A consequência assumida: a recuperação de senha passa pela coordenação.
SMTP com conta institucional resolve sem domínio próprio; é o próximo passo.

**Duas decisões de produto**, na pauta da próxima reunião:

1. **Certificados do estudante** — a coluna existe no banco e na API; nenhuma
   tela a preenche. Entra no perfil ou sai numa migração?
2. **Peso do contexto no match** — idioma e número de projetos aparecem para a
   curadoria, mas não contam no score. Devem passar a pesar?

**Operação.** Backup agendado (o script existe; falta o agendamento) e domínio
próprio, que destrava o e-mail acima.

---

## Slide 15 — Fechamento

# O que o IC constrói deve ser visível.

### E quem precisa disso deve saber onde procurar.

**VitrineIC** · Davi Domingos de Oliveira · Arthur Melo · Rian Américo
Instituto de Computação — UFAL

---

## Anexo A — roteiro de demonstração (5 minutos)

Ordem pensada para que cada tela explique a seguinte. Faça o caminho completo
de uma demanda, sem pular para telas soltas.

| Tempo | Tela                    | O que mostrar                                         |
| ----- | ----------------------- | ----------------------------------------------------- |
| 0:30  | Landing e catálogo      | A vitrine pública, sem login — é o que o visitante vê |
| 1:00  | Solicitante → wizard    | Publicar uma demanda, quatro passos, com competências |
| 1:00  | Curadoria → triagem     | O kanban, a transição de status, o parecer            |
| 1:30  | Curadoria → matchmaking | O ranking com o score e o contexto do candidato       |
| 0:45  | Estudante → interesses  | O aceite, e o contato aparecendo só depois dele       |
| 0:15  | Painel de impacto       | Os indicadores subindo com o que acabou de ser feito  |

**O momento da demonstração** é o aceite duplo: mostre o perfil do estudante
antes, sem e-mail à vista, e depois do aceite, com o contato liberado. É a
regra central do produto acontecendo ao vivo.

Se a rede falhar, o ambiente local com `pnpm dev` serve a mesma coisa.

---

## Anexo B — de onde vêm os números

Conferidos no repositório em 26/11/2026, para que ninguém precise acreditar na
palavra de quem apresenta.

| Número         | Fonte                                       |
| -------------- | ------------------------------------------- |
| 32 tabelas     | `server/db/migrations/001_schema.sql`       |
| 8 migrações    | `server/db/migrations/`                     |
| 40 rotas       | `server/*-routes.ts`                        |
| 107 testes     | `pnpm test:web` (59) + `pnpm test:api` (48) |
| ~14.700 linhas | `src/` e `server/`, fora arquivos de teste  |
| Pesos do match | `src/lib/match.ts`                          |
| Sete status    | `DemandStatus` em `src/types/index.ts`      |
| Metas da ACE 1 | tabela `meta_indicador`                     |

Estado detalhado por fluxo em
[../context/06-estado-atual.md](../context/06-estado-atual.md). Todos os dados
de exemplo do sistema são **fictícios**.
