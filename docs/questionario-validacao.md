# VitrineIC — Base para o questionário de validação

Documento-base para montar o formulário (Google Forms) que valida a ideia do
VitrineIC com **estudantes universitários** — de qualquer curso e qualquer
instituição, não só do Instituto de Computação.

**Não há demonstração.** A pessoa responde sozinha, lendo o formulário. Isso
impõe duas consequências que atravessam o documento inteiro:

1. **Nada pode depender de ver o produto.** As perguntas validam o _problema_ e o
   _conceito_, nunca a interface.
2. **O conceito precisa ser explicado dentro do próprio formulário**, em um texto
   curto, colocado só depois do bloco sobre o problema (seção 6) — antes disso,
   descrever a solução contamina as respostas.

**Não é o formulário final.** É o banco de perguntas com a justificativa de cada
uma, para a equipe cortar o que não couber sem perder o que importa.

---

## 1. O que precisamos validar

Quatro hipóteses. Toda pergunta existe para testar uma delas.

| #      | Hipótese                                                                                                                               | Se cair, o que muda                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **H1** | O problema é real e generalizável: estudantes universitários não têm onde expor o que produzem nem onde encontrar parceiros de projeto | o produto perde razão de existir, ou vale só para o IC |
| **H2** | O match **direcionado a uma pessoa** é preferível à candidatura aberta                                                                 | muda a peça central do produto                         |
| **H3** | A **curadoria humana** aumenta a confiança e justifica seu custo                                                                       | muda o modelo de operação e de custos                  |
| **H4** | Existe intenção de uso — a pessoa criaria perfil e publicaria seu trabalho                                                             | a vitrine nasce vazia                                  |

> Ficou de fora, deliberadamente: usabilidade da interface. Sem demonstração, não
> há como medir — e responder "a tela é clara" sem ver a tela não é dado, é ruído.

---

## 2. Quem responde

Estudantes de graduação ou pós, de qualquer curso e instituição.

| Segmento                                     | Alvo mínimo | Por que importa                                |
| -------------------------------------------- | ----------- | ---------------------------------------------- |
| Computação (qualquer instituição)            | 30          | é o público de partida do produto              |
| Outras áreas — exatas, humanas, saúde, artes | 30          | testa se o problema é do IC ou da universidade |
| Total                                        | 60          |                                                |

**A comparação entre os dois segmentos é o achado mais valioso do
questionário.** Se o problema aparecer forte só em computação, o produto é do IC;
se aparecer em todo lugar, o escopo pode ser maior do que a equipe assumiu. Por
isso a pergunta de curso (bloco 0) não é enfeite demográfico — é variável de
corte.

**Divulgação:** grupos de turma, centros acadêmicos, laboratórios, empresas
juniores, redes sociais e listas institucionais. Registre por onde cada resposta
chegou, se conseguir — amostra por conveniência é aceitável em trabalho de
disciplina, **desde que declarada**.

---

## 3. Abertura do formulário

Texto de abertura, antes da primeira pergunta:

> **VitrineIC — pesquisa sobre projetos acadêmicos**
>
> Somos estudantes do Instituto de Computação da UFAL. Estamos avaliando uma
> ideia de plataforma para projetos universitários e queremos saber se o problema
> que imaginamos existe também para você.
>
> Leva de **5 a 8 minutos**. Não é preciso conhecer a plataforma — nenhuma
> pergunta exige isso.
>
> As respostas são anônimas e usadas apenas na avaliação das disciplinas de
> Programação 3 e ACE 1. Você pode deixar qualquer pergunta em branco ou
> desistir a qualquer momento.

Escalas: **1 a 5**, onde 1 = discordo totalmente e 5 = concordo totalmente. Use a
mesma escala no formulário inteiro — misturar escalas inviabiliza a comparação.

---

## 4. Bloco 0 — Perfil

1. Você é estudante de graduação ou pós-graduação?
   ( ) Graduação ( ) Pós ( ) Não sou estudante _(→ encerra o formulário)_
2. Qual sua **área**?
   ( ) Computação / TI ( ) Outras engenharias ( ) Exatas ( ) Saúde
   ( ) Humanas / sociais ( ) Artes / design ( ) Outra: ____
3. Curso: ____
4. Instituição: ____ Pública ( ) Privada ( )
5. Em que período/ano você está? ____
6. Já participou de iniciação científica, extensão, empresa júnior, laboratório,
   coletivo ou startup? _(múltipla)_
   Sim, atualmente · Sim, no passado · Não, mas tenho interesse · Não tenho
   interesse
7. Onde você mostra hoje o que produz? _(múltipla)_
   GitHub · LinkedIn · Behance/Dribbble · Portfólio próprio · Redes sociais ·
   Currículo Lattes · **Não mostro em lugar nenhum** · Outro: ____

> As perguntas 2 e 7 são as variáveis de corte da análise. A opção "não mostro em
> lugar nenhum" é a mais informativa da lista — separe-a no relatório.

---

## 5. Bloco A — O problema _(ainda sem falar da solução)_ — H1

**Escala 1–5:**

8. "Já produzi trabalhos ou projetos no curso que ninguém além do professor
   chegou a ver."
9. "Se eu quisesse encontrar alguém da minha universidade para desenvolver um
   projeto comigo, eu saberia onde procurar."
10. "Sinto que perco oportunidades por não saber que elas existem dentro da minha
    própria instituição."
11. "É fácil, hoje, alguém de fora descobrir o que eu sei fazer."
12. "Conheço pessoas da minha instituição com interesses parecidos com os meus
    fora das minhas turmas."

**Abertas:**

13. Descreva a última vez em que você **quis** encontrar alguém da sua
    universidade para um projeto. O que você fez, e no que deu?
14. Na sua opinião, por que bons trabalhos universitários ficam invisíveis?
15. _(opcional)_ Conte, em uma frase, um projeto seu que você gostaria que mais
    gente tivesse visto.

> **Leitura:** H1 se sustenta se 8 e 10 vierem altas (mediana ≥ 4) **e** 9 e 11
> vierem baixas (≤ 2). Se a 9 vier alta, as pessoas já têm um caminho — descubra
> qual na 13 antes de concluir qualquer coisa. Rode essa leitura **separadamente
> para computação e para as outras áreas**.

---

## 6. Apresentação do conceito _(texto no formulário, não é pergunta)_

Só aqui a solução aparece. Insira como bloco de texto entre as seções:

> **A ideia que estamos avaliando**
>
> Uma plataforma com três partes:
>
> 1. **Vitrine** — você publica os projetos que desenvolve, e qualquer pessoa
>    pode vê-los sem precisar de login.
> 2. **Mural de demandas** — professores, laboratórios ou empresas publicam o que
>    precisam construir, com as competências necessárias.
> 3. **Match com curadoria** — quando aparece uma demanda compatível com o seu
>    perfil, o sistema calcula os perfis mais próximos, mas **quem decide é uma
>    pessoa**: alguém da equipe analisa, escolhe **um** estudante, escreve por que
>    escolheu, e só essa pessoa é convidada.
>
> Ou seja: **não é um mural onde todos se candidatam**. É um convite direcionado,
> com justificativa, a uma pessoa por vez.

Mantenha esse texto curto e neutro. Evite adjetivos ("inovadora", "poderosa") —
eles inflam artificialmente as respostas de intenção de uso do bloco D.

---

## 7. Bloco B — Match direcionado × candidatura aberta — H2

16. **Escolha única.** Imagine que existe uma demanda compatível com o que você
    sabe fazer. Qual cenário você prefere?
    - ( ) **A** — a demanda fica aberta e qualquer pessoa se candidata; quem
      publicou escolhe entre todos
    - ( ) **B** — alguém analisa os perfis e convida **uma** pessoa; só ela é
      contatada
    - ( ) Tanto faz
17. **Por quê?** _(aberta — a pergunta mais importante do bloco; deixe
    obrigatória)_
18. **Escala.** "Receber um convite direcionado me faria levar a oportunidade
    mais a sério do que ver um anúncio aberto."
19. **Escala.** "Saber que só uma pessoa é contatada me preocupa: sinto que
    perderia a chance de me candidatar."
20. **Escala.** "Já deixei de me candidatar a algo por achar que havia
    concorrência demais."
21. **Escala.** "Prefiro ser escolhido por um perfil que preenchi uma vez do que
    precisar me candidatar a cada oportunidade."

> **Leitura:** 18 e 19 medem lados opostos de propósito. Se as duas vierem altas,
> o público quer o convite **e** quer poder se candidatar — sinal de que falta um
> caminho de manifestação de interesse ao lado do match. Isso é um achado, não uma
> contradição; registre como tal.

---

## 8. Bloco C — Curadoria humana — H3

22. **Escala.** "Confio mais em uma indicação feita por uma pessoa da instituição
    do que em uma feita só por algoritmo."
23. **Escala.** "Ver a justificativa escrita de por que fui escolhido faz
    diferença para mim."
24. **Escolha única.** Quem deveria fazer essa análise?
    ( ) Equipe da plataforma ( ) Professor(a) ( ) Comitê de estudantes
    ( ) Projeto de extensão dedicado ( ) Coordenação do curso ( ) Ninguém — só o
    sistema ( ) Outro: ____
25. **Escala.** "Esperar a análise de uma pessoa é um preço aceitável por uma
    indicação melhor."
26. **Escolha única.** Qual o maior tempo de espera aceitável entre a demanda ser
    publicada e você ser contatado?
    ( ) até 2 dias ( ) até 1 semana ( ) até 15 dias ( ) até 1 mês
    ( ) não me importo com o tempo

> **Leitura:** 25 e 26 são as perguntas de custo. A curadoria humana introduz
> latência; se o público não aceitar a espera, o modelo precisa de prazo declarado
> ou de um caminho rápido para demandas simples. A opção "ninguém — só o sistema"
> na 24 é o contraponto honesto a H3: se ela vencer, a curadoria não se sustenta
> como valor percebido, só como controle interno.

---

## 9. Bloco D — Intenção de uso — H4

27. **Escala.** "Eu criaria um perfil nesta plataforma se ela existisse hoje."
28. **Escala.** "Eu publicaria projetos meus nela."
29. **Escala.** "Eu recomendaria a plataforma a um colega."
30. **Múltipla.** O que mais te faria hesitar em publicar seu trabalho?
    - ( ) Medo de exposição ou julgamento
    - ( ) Meus projetos não estão prontos o bastante
    - ( ) Não quero que copiem minha ideia
    - ( ) Dá trabalho manter o perfil atualizado
    - ( ) Privacidade dos meus dados
    - ( ) Não acho que alguém veria
    - ( ) Nada me faria hesitar
    - ( ) Outro: ____
31. **Escolha única.** Você esperaria que a plataforma conectasse estudantes a:
    - ( ) demandas da universidade (iniciação científica, professores,
      laboratórios)
    - ( ) demandas de empresas externas
    - ( ) os dois
32. **Escala.** "Eu usaria a plataforma também para **encontrar** pessoas, não só
    para ser encontrado."
33. **Múltipla.** O que faria você abrir a plataforma no dia a dia?
    Ver projetos de outras pessoas · Procurar parceiros · Acompanhar demandas ·
    Manter meu portfólio · Nada, só entraria se me chamassem

> **Leitura:** a 31 decide a divergência de escopo ainda aberta no projeto (o
> README diz universidade, o código diz empresa). É a pergunta de maior
> consequência arquitetural do questionário. A 30 é a pergunta que dói: ela mede o
> atrito real de adoção, e a resposta "meus projetos não estão prontos o bastante"
> tende a ser a mais frequente — se for, é um problema de produto (curadoria de
> apresentação, rascunhos, projetos em andamento), não de marketing.

---

## 10. Bloco E — Fechamento

34. Se essa plataforma existisse, o que ela **precisaria ter** para você usar de
    verdade? _(aberta)_
35. O que te pareceu frágil ou pouco convincente na ideia? _(aberta — peça
    sinceridade explicitamente; respostas negativas valem mais que elogios)_
36. Algo que você gostaria de dizer e não foi perguntado? _(aberta, opcional)_
37. Aceita ser contatado para uma próxima rodada, com o protótipo pronto?
    ( ) Sim ( ) Não — e-mail (opcional): ____

---

## 11. Como consolidar os resultados

Preencha para cada hipótese, **e repita o quadro separando computação das demais
áreas**:

| Hipótese               | Perguntas      | Resultado (mediana / %) | Veredito                            | O que muda no produto |
| ---------------------- | -------------- | ----------------------- | ----------------------------------- | --------------------- |
| H1 — problema real     | 8–13           |                         | ( ) confirma ( ) parcial ( ) refuta |                       |
| H2 — match direcionado | 16, 18, 19, 21 |                         |                                     |                       |
| H3 — curadoria humana  | 22, 23, 24, 25 |                         |                                     |                       |
| H4 — intenção de uso   | 27, 28, 29, 30 |                         |                                     |                       |

**Regras de leitura, combinadas antes de ver os dados:**

- **Confirma:** mediana ≥ 4 nas escalas, ou ≥ 70% na opção esperada.
- **Parcial:** mediana 3, ou resultado entre 40% e 70%.
- **Refuta:** mediana ≤ 2, ou < 40%.

Cortes obrigatórios na análise:

- **Computação × outras áreas** — testa se o problema é do IC ou da universidade.
- **Quem já expõe trabalho × quem não expõe** (pergunta 7) — quem respondeu "não
  mostro em lugar nenhum" é o público-alvo mais puro.
- **Quem já participou de IC/extensão × quem não** (pergunta 6) — mede se a
  plataforma atrai quem já está dentro ou quem está de fora.

Anote sempre o **n** de cada corte. Uma leitura sobre 6 respostas não carrega o
peso de uma sobre 40, e o relatório da ACE1 precisa deixar isso visível em vez de
apresentar porcentagens soltas.

**Não descarte as abertas.** As perguntas 13, 14, 17, 34 e 35 explicam _por que_
um número veio como veio. Agrupe por tema, conte quantas respostas caem em cada
tema e cite as literais mais representativas.

---

## 12. O que este questionário resolve — e o que não

Fecha duas questões que estavam em aberto no projeto:

| Questão em aberto                          | Pergunta que resolve |
| ------------------------------------------ | -------------------- |
| Solicitante é a universidade ou a empresa? | 31                   |
| Quem faz o crivo humano?                   | 24                   |

E abre uma nova, que antes nem estava posta: **o problema é do IC ou de toda a
universidade?** — respondida pelo corte da pergunta 2 sobre o bloco A.

Continuam fora do alcance deste instrumento:

- **Usabilidade da interface** — exige teste com o protótipo aberto; fica para a
  rodada seguinte, com quem marcou "sim" na 37.
- **O público é só do IC ou de outros institutos?** — o questionário informa a
  decisão, mas ela depende do modelo de autenticação e da coordenação.
- **O que acontece depois do match aprovado** — decisão de produto da equipe.
- **Validação do lado do solicitante** — professores, laboratórios e empresas
  são outro público, com outro roteiro. Este formulário é dos estudantes.
