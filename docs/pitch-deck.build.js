const pptxgen = require("pptxgenjs");

const NAVY = "1C2B4A";
const RED = "c1121f";
const OFFWHITE = "F5F4F0";
const INK = "0A0A0A";
const MUTED = "4A4A4A";
const MUTED_DARK = "C9CEDA";
const WHITE = "FFFFFF";
const RULE = "C7CBD4";

const SERIF = "Cambria";
const SANS = "Calibri";
const MONO = "Courier New";

const M = 0.6;
const W = 13.333;
const H = 7.5;
const CW = W - 2 * M;

const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Davi Domingos de Oliveira, Arthur Melo, Rian Américo";
p.company = "Instituto de Computação · UFAL";
p.title = "VitrineIC — Pitch Deck";

let SLIDE_N = 0;

function slide(dark) {
  SLIDE_N += 1;
  const s = p.addSlide();
  s.background = { color: dark ? NAVY : OFFWHITE };
  return s;
}

function label(s, text, dark) {
  s.addText(text, {
    isTextBox: true,
    x: M,
    y: 0.42,
    w: CW,
    h: 0.28,
    margin: 0,
    fontFace: MONO,
    fontSize: 11,
    bold: true,
    charSpacing: 1.6,
    color: dark ? MUTED_DARK : RED,
  });
}

function title(s, text, dark, opts = {}) {
  s.addText(text, {
    isTextBox: true,
    x: M,
    y: opts.y || 0.85,
    w: opts.w || CW * 0.72,
    h: opts.h || 1.1,
    margin: 0,
    fontFace: SERIF,
    fontSize: opts.size || 34,
    bold: true,
    color: dark ? OFFWHITE : NAVY,
    lineSpacing: (opts.size || 34) * 1.14,
    valign: "top",
  });
}

function footer(s, dark) {
  const n = SLIDE_N;
  const c = dark ? MUTED_DARK : MUTED;
  s.addText("VITRINEIC · IC/UFAL", {
    isTextBox: true,
    x: M,
    y: H - 0.52,
    w: 4,
    h: 0.25,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: c,
    charSpacing: 1.2,
  });
  s.addText(String(n), {
    isTextBox: true,
    x: W - M - 1,
    y: H - 0.52,
    w: 1,
    h: 0.25,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: c,
    align: "right",
  });
}

function ph(s, x, y, w, h, text, dark) {
  s.addShape(p.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: dark ? NAVY : OFFWHITE },
    line: { color: dark ? MUTED_DARK : RULE, width: 1, dashType: "dash" },
  });
  s.addText(text, {
    isTextBox: true,
    x: x + 0.15,
    y: y + h / 2 - 0.35,
    w: w - 0.3,
    h: 0.7,
    margin: 0,
    fontFace: MONO,
    fontSize: 9.5,
    color: dark ? MUTED_DARK : MUTED,
    align: "center",
    valign: "middle",
  });
}

function rule(s, x, y, w, dark) {
  s.addShape(p.ShapeType.line, {
    x,
    y,
    w,
    h: 0,
    line: { color: dark ? "45536E" : RULE, width: 0.75 },
  });
}

/* ───────────────────────── 1 — Capa ───────────────────────── */
{
  const s = slide(true);
  s.addText("VitrineIC", {
    isTextBox: true,
    x: M + 0.2,
    y: 2.3,
    w: 6.4,
    h: 1.2,
    margin: 0,
    fontFace: SERIF,
    fontSize: 60,
    bold: true,
    color: OFFWHITE,
  });
  s.addText("Conectando inovação acadêmica\na quem precisa dela", {
    isTextBox: true,
    x: M + 0.2,
    y: 3.55,
    w: 6.4,
    h: 1.1,
    margin: 0,
    fontFace: SERIF,
    fontSize: 22,
    italic: true,
    color: MUTED_DARK,
    lineSpacing: 30,
  });
  s.addText("INSTITUTO DE COMPUTAÇÃO · UFAL · MACEIÓ\nPROGRAMAÇÃO 3 (WEB) + ACE 1", {
    isTextBox: true,
    x: M + 0.2,
    y: 5.5,
    w: 6.4,
    h: 0.7,
    margin: 0,
    fontFace: MONO,
    fontSize: 10.5,
    color: OFFWHITE,
    charSpacing: 1.2,
    lineSpacing: 17,
  });
  ph(s, 7.6, 1.5, 5.1, 4.5, "[ mockup da landing page\nem moldura de notebook ]", true);
  s.addNotes(
    "Todo semestre, dezenas de projetos bons morrem em repositórios do GitHub que ninguém abre. E, ao mesmo tempo, quem precisa de um desenvolvedor não sabe onde procurar dentro do próprio Instituto. O VitrineIC resolve os dois lados do mesmo problema.",
  );
}

/* ───────────────────────── 2 — O problema ───────────────────────── */
{
  const s = slide(false);
  label(s, "O PROBLEMA", false);
  title(s, "Fora do GitHub, não existe lugar onde\no que o IC produz fique visível.", false, {
    size: 30,
    w: CW * 0.82,
  });

  const cols = [
    [
      "01",
      "Trabalho invisível",
      "O estudante constrói, entrega, arquiva. Ninguém vê.",
      "11 de 17 produziram trabalho que ninguém além do professor viu",
    ],
    [
      "02",
      "Demanda sem porta",
      "Professor, laboratório ou empresa que precisa de alguém não tem onde publicar isso.",
      '"Falta de divulgação" foi a explicação mais repetida na sondagem',
    ],
    [
      "03",
      "Network perdido",
      "Pessoas com interesses idênticos passam quatro anos no mesmo prédio sem se encontrar.",
      "10 de 17 não conhecem gente com interesses parecidos fora das próprias turmas",
    ],
  ];
  const cw = (CW - 1.0) / 3;
  cols.forEach(([num, head, body, datum], i) => {
    const x = M + i * (cw + 0.5);
    s.addText(num, {
      isTextBox: true,
      x,
      y: 2.6,
      w: cw,
      h: 0.55,
      margin: 0,
      fontFace: MONO,
      fontSize: 22,
      bold: true,
      color: RED,
    });
    s.addText(head, {
      isTextBox: true,
      x,
      y: 3.2,
      w: cw,
      h: 0.4,
      margin: 0,
      fontFace: SANS,
      fontSize: 17,
      bold: true,
      color: NAVY,
    });
    s.addText(body, {
      isTextBox: true,
      x,
      y: 3.68,
      w: cw,
      h: 1.1,
      margin: 0,
      fontFace: SANS,
      fontSize: 13,
      color: MUTED,
      lineSpacing: 19,
    });
    s.addText(datum, {
      isTextBox: true,
      x,
      y: 4.62,
      w: cw,
      h: 0.6,
      margin: 0,
      fontFace: MONO,
      fontSize: 9.5,
      color: RED,
      lineSpacing: 14,
    });
  });
  [0, 1].forEach((i) => {
    const x = M + (i + 1) * (cw + 0.5) - 0.25;
    s.addShape(p.ShapeType.line, { x, y: 2.65, w: 0, h: 2.45, line: { color: RULE, width: 0.75 } });
  });

  s.addShape(p.ShapeType.rect, { x: 0, y: 5.35, w: W, h: 1.35, fill: { color: NAVY } });
  s.addText(
    "O custo não é só do estudante. É do Instituto, que perde PIBIC, PIBITI\ne startups que nunca chegaram a começar.",
    {
      isTextBox: true,
      x: M,
      y: 5.6,
      w: CW,
      h: 0.9,
      margin: 0,
      fontFace: SERIF,
      fontSize: 18,
      italic: true,
      color: OFFWHITE,
      lineSpacing: 26,
    },
  );
  footer(s);
  s.addNotes("Três consequências concretas. O custo é institucional, não individual.");
}

/* ───────────────────────── 3 — A solução ───────────────────────── */
{
  const s = slide(false);
  label(s, "A SOLUÇÃO", false);
  title(s, "Uma vitrine pública, um mural de demandas,\ne um match com curadoria humana entre os dois.", false, {
    size: 26,
    w: CW * 0.9,
    h: 1.0,
  });

  const cards = [
    ["Vitrine de projetos", "O estudante expõe o que constrói, no espírito de startup em estágio inicial.", false],
    ["Match com crivo humano", "O sistema aponta uma pessoa; um curador decide e escreve o porquê.", true],
    ["Mural de demandas", "Quem precisa publica o que precisa, com skills e escopo definidos.", false],
  ];
  const cw = 3.7;
  const gap = (CW - 3 * cw) / 2;
  cards.forEach(([head, body, hero], i) => {
    const x = M + i * (cw + gap);
    const y = hero ? 2.45 : 2.65;
    const h = hero ? 2.9 : 2.5;
    s.addShape(p.ShapeType.rect, {
      x,
      y,
      w: cw,
      h,
      fill: { color: hero ? NAVY : WHITE },
      line: { color: hero ? NAVY : RULE, width: 1 },
    });
    s.addText(String(i + 1).padStart(2, "0"), {
      isTextBox: true,
      x: x + 0.35,
      y: y + 0.32,
      w: 1,
      h: 0.35,
      margin: 0,
      fontFace: MONO,
      fontSize: 12,
      bold: true,
      color: hero ? OFFWHITE : RED,
    });
    s.addText(head, {
      isTextBox: true,
      x: x + 0.35,
      y: y + 0.85,
      w: cw - 0.7,
      h: 0.8,
      margin: 0,
      fontFace: SERIF,
      fontSize: 20,
      bold: true,
      color: hero ? OFFWHITE : NAVY,
      lineSpacing: 26,
    });
    s.addText(body, {
      isTextBox: true,
      x: x + 0.35,
      y: y + 1.7,
      w: cw - 0.7,
      h: 1.0,
      margin: 0,
      fontFace: SANS,
      fontSize: 13,
      color: hero ? MUTED_DARK : MUTED,
      lineSpacing: 19,
    });
  });
  s.addText("Três peças, nenhuma opcional.", {
    isTextBox: true,
    x: M,
    y: 5.75,
    w: CW,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 17,
    italic: true,
    color: NAVY,
  });
  footer(s);
  s.addNotes("A peça do meio é a que nos diferencia: curadoria humana obrigatória.");
}

/* ───────────────────────── Quem usa ───────────────────────── */
{
  const s = slide(false);
  label(s, "QUEM USA", false);
  title(s, "Quatro papéis, e um deles nunca faz login.", false, { size: 30 });

  const roles = [
    [
      "Estudante",
      "Preenche perfil, competências e nível de proficiência. Expõe os projetos que constrói. Recebe convites direcionados e aceita ou recusa.",
      "entra pelo onboarding",
    ],
    [
      "Solicitante",
      "Publica a demanda em quatro passos: contexto, escopo, competências, prazo. Recebe um protocolo e acompanha o status até o match.",
      "entra pelo wizard",
    ],
    [
      "Curador",
      "Tria a fila, compara candidatos por compatibilidade, confirma uma conexão e escreve a justificativa que fica registrada.",
      "entra pela triagem",
    ],
    [
      "Visitante",
      "Navega o catálogo de projetos, os perfis públicos e os indicadores de impacto — sem login, sem cadastro, sem pedir permissão.",
      "não entra: só olha",
    ],
  ];
  const cw = (CW - 1.2) / 4;
  roles.forEach(([name, body, how], i) => {
    const x = M + i * (cw + 0.4);
    const hero = i === 3;
    s.addShape(p.ShapeType.rect, {
      x,
      y: 2.45,
      w: cw,
      h: 3.5,
      fill: { color: hero ? NAVY : WHITE },
      line: { color: hero ? NAVY : RULE, width: 1 },
    });
    s.addText(name, {
      isTextBox: true,
      x: x + 0.28,
      y: 2.75,
      w: cw - 0.56,
      h: 0.45,
      margin: 0,
      fontFace: SERIF,
      fontSize: 19,
      bold: true,
      color: hero ? OFFWHITE : NAVY,
    });
    s.addText(body, {
      isTextBox: true,
      x: x + 0.28,
      y: 3.3,
      w: cw - 0.56,
      h: 2.0,
      margin: 0,
      fontFace: SANS,
      fontSize: 12,
      color: hero ? MUTED_DARK : MUTED,
      lineSpacing: 18,
    });
    s.addText(how, {
      isTextBox: true,
      x: x + 0.28,
      y: 5.42,
      w: cw - 0.56,
      h: 0.35,
      margin: 0,
      fontFace: MONO,
      fontSize: 9,
      color: hero ? OFFWHITE : RED,
      charSpacing: 0.6,
    });
  });
  s.addText(
    "A área pública é o que sustenta a exigência de alcance externo da ACE1: o trabalho do IC fica visível para quem nunca entrou na plataforma.",
    {
      isTextBox: true,
      x: M,
      y: 6.2,
      w: CW,
      h: 0.4,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      color: MUTED,
    },
  );
  footer(s);
  s.addNotes(
    "Quatro papéis, três áreas logadas e uma área pública. O visitante é o que prova a extensão: ele nunca se cadastra e mesmo assim vê o que o Instituto produz.",
  );
}

/* ───────────────────────── Anatomia de uma demanda ───────────────────────── */
{
  const s = slide(true);
  label(s, "ANATOMIA DE UMA DEMANDA", true);
  title(s, "O que o solicitante publica — e por que isso basta.", true, { size: 28 });

  s.addShape(p.ShapeType.rect, { x: M, y: 2.4, w: 6.6, h: 3.85, fill: { color: OFFWHITE } });
  s.addText("VIC-2026-0041", {
    isTextBox: true,
    x: M + 0.35,
    y: 2.7,
    w: 3,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 11,
    bold: true,
    color: RED,
  });
  s.addText("nova", {
    isTextBox: true,
    x: M + 4.9,
    y: 2.7,
    w: 1.4,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 9.5,
    bold: true,
    color: NAVY,
    align: "right",
  });
  s.addText("Sistema de Monitoramento IoT para Fábricas", {
    isTextBox: true,
    x: M + 0.35,
    y: 3.1,
    w: 5.9,
    h: 0.8,
    margin: 0,
    fontFace: SERIF,
    fontSize: 22,
    bold: true,
    color: NAVY,
    lineSpacing: 28,
  });
  s.addText(
    "Plataforma de coleta e visualização de dados de sensores industriais em tempo real, com pipeline de ingestão tolerante a falhas.",
    {
      isTextBox: true,
      x: M + 0.35,
      y: 3.95,
      w: 5.9,
      h: 0.7,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      color: MUTED,
      lineSpacing: 18,
    },
  );
  const fields = [
    ["ÁREA", "Eng. de Software"],
    ["ESCOPO", "Médio · 3 a 6 meses"],
    ["PRAZO", "30 nov 2026"],
  ];
  fields.forEach(([k, v], i) => {
    const x = M + 0.35 + i * 2.0;
    s.addText(k, {
      isTextBox: true,
      x,
      y: 4.75,
      w: 1.9,
      h: 0.25,
      margin: 0,
      fontFace: MONO,
      fontSize: 8.5,
      bold: true,
      color: MUTED,
      charSpacing: 0.8,
    });
    s.addText(v, {
      isTextBox: true,
      x,
      y: 5.0,
      w: 1.9,
      h: 0.3,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      bold: true,
      color: NAVY,
    });
  });
  s.addText("COMPETÊNCIAS EXIGIDAS", {
    isTextBox: true,
    x: M + 0.35,
    y: 5.45,
    w: 4,
    h: 0.25,
    margin: 0,
    fontFace: MONO,
    fontSize: 8.5,
    bold: true,
    color: MUTED,
    charSpacing: 0.8,
  });
  ["Python", "MQTT", "PostgreSQL", "Docker", "React"].forEach((sk, i) => {
    const x = M + 0.35 + i * 1.18;
    s.addShape(p.ShapeType.rect, { x, y: 5.75, w: 1.08, h: 0.32, fill: { color: NAVY } });
    s.addText(sk, {
      isTextBox: true,
      x,
      y: 5.75,
      w: 1.08,
      h: 0.32,
      margin: 0,
      fontFace: MONO,
      fontSize: 8.5,
      color: OFFWHITE,
      align: "center",
      valign: "middle",
    });
  });

  s.addText("Por que só isso", {
    isTextBox: true,
    x: 7.7,
    y: 2.7,
    w: 5.0,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 20,
    bold: true,
    color: OFFWHITE,
  });
  s.addText(
    [
      {
        text: "As competências são o único campo que o algoritmo lê — por isso o wizard obriga a preenchê-las, e não aceita um pedido genérico de programador.",
        options: { bullet: true, breakLine: true },
      },
      {
        text: "O protocolo existe desde a publicação: o solicitante acompanha o status sem precisar cobrar ninguém.",
        options: { bullet: true, breakLine: true },
      },
      {
        text: "Escopo e prazo não entram na conta do match, mas são o que o curador usa para julgar se cabe no semestre do estudante.",
        options: { bullet: true },
      },
    ],
    {
      isTextBox: true,
      x: 7.7,
      y: 3.3,
      w: 5.0,
      h: 2.9,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      color: MUTED_DARK,
      lineSpacing: 19,
      paraSpaceAfter: 10,
    },
  );
  footer(s, true);
  s.addNotes(
    "Demanda real do protótipo, com dados fictícios. Quatro passos no wizard: contexto, escopo, competências, prazo.",
  );
}

/* ───────────────────────── 4 — Fluxo ───────────────────────── */
{
  const s = slide(false);
  label(s, "O PRODUTO — FLUXO PONTA A PONTA", false);
  title(s, "Do pedido ao aperto de mão, em três raias.", false, { size: 30 });

  const lanes = ["SOLICITANTE", "CURADORIA", "ESTUDANTE"];
  const laneY = [2.35, 3.55, 4.75];
  lanes.forEach((name, i) => {
    s.addText(name, {
      isTextBox: true,
      x: M,
      y: laneY[i] + 0.18,
      w: 1.7,
      h: 0.3,
      margin: 0,
      fontFace: MONO,
      fontSize: 9.5,
      bold: true,
      color: MUTED,
      charSpacing: 1.1,
    });
    s.addShape(p.ShapeType.line, {
      x: M,
      y: laneY[i] + 1.0,
      w: CW,
      h: 0,
      line: { color: RULE, width: 0.75 },
    });
  });

  function box(x, y, w, text, accent) {
    s.addShape(p.ShapeType.rect, {
      x,
      y,
      w,
      h: 0.62,
      fill: { color: accent ? RED : WHITE },
      line: { color: accent ? RED : NAVY, width: 1 },
    });
    s.addText(text, {
      isTextBox: true,
      x: x + 0.08,
      y,
      w: w - 0.16,
      h: 0.62,
      margin: 0,
      fontFace: SANS,
      fontSize: 11.5,
      bold: accent,
      color: accent ? OFFWHITE : NAVY,
      align: "center",
      valign: "middle",
    });
  }

  box(2.5, laneY[0] + 0.12, 2.3, "publica demanda", false);
  box(2.5, laneY[1] + 0.12, 2.3, "triagem (kanban)", false);
  box(5.2, laneY[1] + 0.12, 2.3, "ranking por\ncompatibilidade", false);
  box(7.9, laneY[1] + 0.12, 3.1, "confirma 1 candidato\n+ justificativa", true);
  box(2.5, laneY[2] + 0.12, 2.3, "cria perfil e\npublica portfólio", false);
  box(7.9, laneY[2] + 0.12, 3.1, "recebe convite · aceita", false);

  // o portfólio é o que alimenta o ranking: seta subindo da raia do estudante
  s.addShape(p.ShapeType.line, {
    x: 3.65,
    y: laneY[1] + 0.85,
    w: 0,
    h: laneY[2] - laneY[1] - 0.73,
    line: { color: NAVY, width: 1.25, endArrowType: "triangle", beginArrowType: "none" },
  });
  s.addText("alimenta a base que o ranking lê", {
    isTextBox: true,
    x: 3.85,
    y: laneY[1] + 0.98,
    w: 3.2,
    h: 0.28,
    margin: 0,
    fontFace: MONO,
    fontSize: 8.5,
    color: MUTED,
  });

  // desfecho comum às três raias
  s.addShape(p.ShapeType.rect, {
    x: M,
    y: 5.88,
    w: CW,
    h: 0.5,
    fill: { color: NAVY },
  });
  s.addText(
    "conexão estabelecida — o solicitante tem um nome, o estudante tem um projeto, e a justificativa fica registrada",
    {
      isTextBox: true,
      x: M,
      y: 5.88,
      w: CW,
      h: 0.5,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      color: OFFWHITE,
      align: "center",
      valign: "middle",
    },
  );

  s.addText("O estudante entra antes da demanda existir: sem perfil publicado, ele não aparece em ranking nenhum.", {
    isTextBox: true,
    x: M,
    y: 6.5,
    w: CW,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 15,
    italic: true,
    color: NAVY,
  });
  footer(s);
  s.addNotes(
    "O estudante cria perfil e publica portfólio antes de qualquer demanda — é isso que o coloca na base que o ranking lê. Triagem: nova, em análise, aprovada. A máquina ordena; o curador confirma um nome. Este eixo funciona ponta a ponta no protótipo.",
  );
}

/* ───────────────────────── Como o match funciona ───────────────────────── */
{
  const s = slide(false);
  label(s, "COMO O MATCH FUNCIONA", false);
  title(s, "Uma conta que o curador consegue explicar\nao estudante que não foi escolhido.", false, { size: 27 });

  s.addShape(p.ShapeType.rect, {
    x: M,
    y: 2.35,
    w: CW,
    h: 0.62,
    fill: { color: WHITE },
    line: { color: RULE, width: 1 },
  });
  s.addText("score  =  skills da demanda cobertas pelo estudante  ÷  skills da demanda  ×  100", {
    isTextBox: true,
    x: M,
    y: 2.35,
    w: CW,
    h: 0.62,
    margin: 0,
    fontFace: MONO,
    fontSize: 13,
    bold: true,
    color: NAVY,
    align: "center",
    valign: "middle",
  });

  s.addText("O RANKING DA DEMANDA VIC-2026-0041", {
    isTextBox: true,
    x: M,
    y: 3.2,
    w: 7.4,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 9.5,
    bold: true,
    color: MUTED,
    charSpacing: 0.9,
  });
  const rank = [
    ["Rafael Moreira Santos", "Python · MQTT · PostgreSQL · Docker", 80, true],
    ["Bruno Takashi Yamamoto", "Python · PostgreSQL · Docker · React", 80, true],
    ["Isadora Lima Costa", "Python · PostgreSQL · React", 60, false],
    ["Lucas Henrique Pinto", "Python · React", 40, false],
  ];
  rank.forEach(([name, cov, score, top], i) => {
    const y = 3.6 + i * 0.62;
    s.addText(name, {
      isTextBox: true,
      x: M,
      y,
      w: 2.9,
      h: 0.35,
      margin: 0,
      fontFace: SANS,
      fontSize: 13,
      bold: top,
      color: NAVY,
      valign: "middle",
    });
    s.addText(cov, {
      isTextBox: true,
      x: M + 3.0,
      y,
      w: 3.4,
      h: 0.35,
      margin: 0,
      fontFace: MONO,
      fontSize: 8.5,
      color: MUTED,
      valign: "middle",
    });
    s.addShape(p.ShapeType.rect, {
      x: M + 6.5,
      y: y + 0.09,
      w: (score / 100) * 1.9,
      h: 0.18,
      fill: { color: top ? NAVY : RULE },
    });
    s.addText(score + "%", {
      isTextBox: true,
      x: M + 8.5,
      y,
      w: 0.7,
      h: 0.35,
      margin: 0,
      fontFace: MONO,
      fontSize: 11,
      bold: top,
      color: top ? NAVY : MUTED,
      valign: "middle",
    });
    rule(s, M, y + 0.5, 9.2, false);
  });
  s.addText("Dois candidatos empatam em 80%. A conta não resolve — quem resolve é o curador, e ele escreve por quê.", {
    isTextBox: true,
    x: M,
    y: 6.1,
    w: 9.2,
    h: 0.62,
    margin: 0,
    fontFace: SERIF,
    fontSize: 15,
    italic: true,
    color: NAVY,
    lineSpacing: 21,
  });

  s.addShape(p.ShapeType.rect, {
    x: 10.1,
    y: 3.2,
    w: 2.6,
    h: 3.0,
    fill: { color: WHITE },
    line: { color: RED, width: 1 },
  });
  s.addText("O que a conta não faz", {
    isTextBox: true,
    x: 10.35,
    y: 3.45,
    w: 2.1,
    h: 0.6,
    margin: 0,
    fontFace: SANS,
    fontSize: 13,
    bold: true,
    color: RED,
    lineSpacing: 18,
  });
  s.addText(
    [
      { text: "não pesa nível de proficiência, embora já seja coletado", options: { bullet: true, breakLine: true } },
      { text: "não olha disponibilidade nem área de interesse", options: { bullet: true, breakLine: true } },
      { text: "trata todas as skills como iguais", options: { bullet: true } },
    ],
    {
      isTextBox: true,
      x: 10.35,
      y: 4.15,
      w: 2.1,
      h: 1.9,
      margin: 0,
      fontFace: SANS,
      fontSize: 11,
      color: MUTED,
      lineSpacing: 15,
      paraSpaceAfter: 8,
    },
  );
  footer(s);
  s.addNotes(
    "A demanda é o denominador: mede cobertura da necessidade, não o repertório do estudante. Nomes de tecnologia passam por normalização, então reactjs e react.js viram React. A evolução natural é usar os níveis de proficiência que já estão na base.",
  );
}

/* ───────────────────────── 5 — Demonstração ───────────────────────── */
{
  const s = slide(true);
  label(s, "DEMONSTRAÇÃO — 5 MINUTOS", true);
  title(s, "A tela onde a decisão acontece.", true, { size: 30 });

  ph(s, M, 2.2, 7.1, 4.0, "[ matchmaking: ranking de candidatos\ncom a justificativa visível ]", true);

  const items = [
    ["0:40", "catálogo público, sem login"],
    ["3:10", "triagem no kanban"],
    ["4:00", "convite aceito, conexão feita"],
  ];
  items.forEach(([t, cap], i) => {
    const y = 2.2 + i * 1.4;
    s.addText(t, {
      isTextBox: true,
      x: 8.1,
      y,
      w: 0.8,
      h: 0.3,
      margin: 0,
      fontFace: MONO,
      fontSize: 11,
      bold: true,
      color: RED,
    });
    ph(s, 9.0, y, 3.7, 0.85, "[ screenshot ]", true);
    s.addText(cap, {
      isTextBox: true,
      x: 9.0,
      y: y + 0.9,
      w: 3.7,
      h: 0.3,
      margin: 0,
      fontFace: SANS,
      fontSize: 11.5,
      color: MUTED_DARK,
    });
  });
  s.addText("Não recarregue a página durante a demo — o estado vive em memória.", {
    isTextBox: true,
    x: M,
    y: 6.4,
    w: CW,
    h: 0.35,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    color: MUTED_DARK,
  });
  footer(s, true);
  s.addNotes(
    "Roteiro: landing 0:00, catálogo 0:40, wizard do solicitante 1:30, triagem 2:30, matchmaking 3:10, convite 4:00, impacto 4:40.",
  );
}

/* ───────────────────────── 6 — Alcance ───────────────────────── */
{
  const s = slide(false);
  label(s, "ALCANCE E ESCALA", false);
  title(s, "O alcance cresce por anéis, não por\nprojeção de mercado.", false, { size: 30 });

  const rings = [
    ["Maceió", 3.5, "F0EEE8"],
    ["UFAL", 2.5, "E2E0D8"],
    ["IC", 1.5, NAVY],
  ];
  const cx = 3.9,
    cy = 4.35;
  rings.forEach(([name, d, fill], i) => {
    s.addShape(p.ShapeType.ellipse, {
      x: cx - d / 2,
      y: cy - d / 2,
      w: d,
      h: d,
      fill: { color: fill },
      line: { color: i === 2 ? NAVY : RULE, width: 1 },
    });
  });
  s.addText("IC", {
    isTextBox: true,
    x: cx - 0.7,
    y: cy - 0.22,
    w: 1.4,
    h: 0.45,
    margin: 0,
    fontFace: SERIF,
    fontSize: 20,
    bold: true,
    color: OFFWHITE,
    align: "center",
  });
  s.addText("UFAL", {
    isTextBox: true,
    x: cx - 0.6,
    y: cy - 1.18,
    w: 1.2,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    bold: true,
    color: NAVY,
    align: "center",
  });
  s.addText("MACEIÓ", {
    isTextBox: true,
    x: cx - 0.8,
    y: cy - 1.68,
    w: 1.6,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    bold: true,
    color: MUTED,
    align: "center",
  });

  const metas = [
    ["8", "estudantes na vitrine"],
    ["10", "projetos expostos"],
    ["6", "demandas publicadas"],
    ["3", "matches efetivados"],
  ];
  s.addText("METAS DO PERÍODO", {
    isTextBox: true,
    x: 7.3,
    y: 2.35,
    w: 5.4,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    bold: true,
    color: MUTED,
    charSpacing: 1.2,
  });
  metas.forEach(([n, cap], i) => {
    const y = 2.8 + i * 0.85;
    s.addText(n, {
      isTextBox: true,
      x: 7.3,
      y,
      w: 1.1,
      h: 0.65,
      margin: 0,
      fontFace: SERIF,
      fontSize: 34,
      bold: true,
      color: NAVY,
      align: "right",
    });
    s.addText(cap, {
      isTextBox: true,
      x: 8.6,
      y: y + 0.18,
      w: 4.1,
      h: 0.35,
      margin: 0,
      fontFace: SANS,
      fontSize: 14,
      color: MUTED,
    });
    if (i < 3) rule(s, 7.3, y + 0.78, 5.4, false);
  });
  s.addText(
    "Os indicadores do painel de impacto são derivados das bases em tempo de render — nunca digitados. Todos os dados do protótipo são fictícios.",
    {
      isTextBox: true,
      x: M,
      y: 6.45,
      w: CW,
      h: 0.4,
      margin: 0,
      fontFace: SANS,
      fontSize: 12,
      color: MUTED,
    },
  );
  footer(s);
  s.addNotes(
    "Aviso de dados fictícios: aqui, uma vez. Buscar os números reais de matrícula do IC antes de apresentar.",
  );
}

/* ───────────────────────── 7 — Sustentação ───────────────────────── */
{
  const s = slide(false);
  label(s, "QUEM OPERA E A QUE CUSTO", false);
  title(s, "A curadoria tem custo recorrente.\nEstá declarado, não escondido.", false, { size: 30 });

  s.addTable(
    [
      [
        { text: "Bloco", options: { bold: true, color: OFFWHITE, fill: { color: NAVY } } },
        { text: "No VitrineIC", options: { bold: true, color: OFFWHITE, fill: { color: NAVY } } },
      ],
      ["Quem opera", "Projeto de extensão dedicado do IC"],
      ["Quem custeia", "O Instituto, como atividade de extensão"],
      [
        { text: "Custo humano", options: { bold: true, color: RED } },
        { text: "Triagem e curadoria recorrentes, por demanda", options: { bold: true, color: RED } },
      ],
      ["Receita", "Não monetária — retorno institucional"],
      ["O que retorna", "PIBIC, PIBITI, portfólio, extensão cumprida"],
    ],
    {
      x: M,
      y: 2.5,
      w: 7.6,
      colW: [2.3, 5.3],
      rowH: 0.48,
      fontFace: SANS,
      fontSize: 13,
      color: NAVY,
      border: { type: "solid", color: RULE, pt: 0.75 },
      fill: { color: WHITE },
      valign: "middle",
      margin: [0.06, 0.12, 0.06, 0.12],
    },
  );

  s.addShape(p.ShapeType.rect, { x: 8.6, y: 2.5, w: 4.1, h: 2.9, fill: { color: NAVY } });
  s.addText("A decisão assumida", {
    isTextBox: true,
    x: 8.9,
    y: 2.8,
    w: 3.5,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 18,
    bold: true,
    color: OFFWHITE,
  });
  s.addText(
    "O crivo humano não é espaço reservado no design. É passo obrigatório do fluxo, com campo de justificativa registrado — e isso cobra um custo de gente que está no modelo.",
    {
      isTextBox: true,
      x: 8.9,
      y: 3.35,
      w: 3.5,
      h: 1.8,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      color: MUTED_DARK,
      lineSpacing: 19,
    },
  );
  ph(s, 8.6, 5.6, 4.1, 1.15, "[ Business Model Canvas ]", false);
  footer(s);
  s.addNotes(
    "Não há monetização. O modelo é de extensão universitária: o Instituto custeia, o retorno é institucional.",
  );
}

/* ───────────────────────── 8 — Diferencial ───────────────────────── */
{
  const s = slide(true);
  label(s, "DIFERENCIAL", true);
  title(s, "Não é candidatura aberta.", true, { size: 34 });

  const colW = 5.4;
  const leftX = M,
    rightX = W - M - colW;
  s.addShape(p.ShapeType.line, { x: W / 2, y: 2.35, w: 0, h: 2.3, line: { color: "45536E", width: 0.75 } });

  s.addText("MURAL COMUM", {
    isTextBox: true,
    x: leftX,
    y: 2.35,
    w: colW,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 10.5,
    bold: true,
    color: MUTED_DARK,
    charSpacing: 1.2,
  });
  s.addText(
    [
      { text: "Trinta pessoas se candidatam", options: { breakLine: true } },
      { text: "Alguém filtra trinta currículos", options: { breakLine: true } },
      { text: "Ninguém sabe por que o escolhido foi escolhido" },
    ],
    {
      isTextBox: true,
      x: leftX,
      y: 2.85,
      w: colW,
      h: 1.8,
      margin: 0,
      fontFace: SANS,
      fontSize: 15,
      color: MUTED_DARK,
      lineSpacing: 26,
      paraSpaceAfter: 8,
    },
  );

  s.addText("VITRINEIC", {
    isTextBox: true,
    x: rightX,
    y: 2.35,
    w: colW,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 10.5,
    bold: true,
    color: OFFWHITE,
    charSpacing: 1.2,
  });
  s.addText(
    [
      { text: "O algoritmo ordena e mostra a justificativa", options: { breakLine: true } },
      { text: "O curador escolhe uma pessoa", options: { breakLine: true } },
      { text: "O porquê fica escrito e registrado" },
    ],
    {
      isTextBox: true,
      x: rightX,
      y: 2.85,
      w: colW,
      h: 1.8,
      margin: 0,
      fontFace: SANS,
      fontSize: 15,
      color: OFFWHITE,
      lineSpacing: 26,
      paraSpaceAfter: 8,
    },
  );

  s.addText("score = skills da demanda cobertas ÷ skills da demanda × 100", {
    isTextBox: true,
    x: M,
    y: 4.95,
    w: CW,
    h: 0.35,
    margin: 0,
    fontFace: MONO,
    fontSize: 12,
    color: MUTED_DARK,
  });
  s.addText("A máquina nunca confirma sozinha.", {
    isTextBox: true,
    x: M,
    y: 5.55,
    w: CW,
    h: 0.6,
    margin: 0,
    fontFace: SERIF,
    fontSize: 28,
    italic: true,
    bold: true,
    color: OFFWHITE,
  });
  footer(s, true);
  s.addNotes(
    "A demanda é o denominador: mede cobertura da necessidade, não repertório do estudante. Limitação conhecida: os níveis de proficiência ainda não pesam na conta.",
  );
}

/* ───────────────────────── 9 — A sondagem sustenta ───────────────────────── */
{
  const s = slide(false);
  label(s, "SONDAGEM · 17 RESPOSTAS", false);
  title(s, "Não perguntamos se a ideia é boa.\nPerguntamos se o problema existe.", false, { size: 28 });

  const stats = [
    ["11/17", "produziram trabalho que ninguém além do professor chegou a ver"],
    ["5/17", "não mostram o que produzem em lugar nenhum — nem GitHub"],
    ["11/17", "perdem oportunidades por não saber que existem na própria instituição"],
    ["14/17", "criariam um perfil na plataforma se ela existisse hoje"],
    ["15/17", "querem análise humana; só 2 querem a decisão só do sistema"],
    ["13/17", "esperam os dois lados: demandas da universidade e de empresas"],
  ];
  const tw = (CW - 0.8) / 3;
  stats.forEach(([n, cap], i) => {
    const x = M + (i % 3) * (tw + 0.4);
    const y = 2.5 + Math.floor(i / 3) * 1.75;
    s.addShape(p.ShapeType.rect, {
      x,
      y,
      w: tw,
      h: 1.5,
      fill: { color: WHITE },
      line: { color: RULE, width: 1 },
    });
    s.addText(n, {
      isTextBox: true,
      x: x + 0.25,
      y: y + 0.18,
      w: tw - 0.5,
      h: 0.6,
      margin: 0,
      fontFace: SERIF,
      fontSize: 30,
      bold: true,
      color: NAVY,
    });
    s.addText(cap, {
      isTextBox: true,
      x: x + 0.25,
      y: y + 0.82,
      w: tw - 0.5,
      h: 0.6,
      margin: 0,
      fontFace: SANS,
      fontSize: 11.5,
      color: MUTED,
      lineSpacing: 16,
    });
  });
  s.addText(
    "Sondagem exploratória: 17 respostas, 16 de computação, em UFAL, IFAL, CEFET-MG, UFPE e outras. Não é amostra do IC.",
    {
      isTextBox: true,
      x: M,
      y: 6.2,
      w: CW,
      h: 0.35,
      margin: 0,
      fontFace: SANS,
      fontSize: 11.5,
      color: MUTED,
    },
  );
  footer(s);
  s.addNotes(
    'Amostra pequena e mista — diga isso antes que perguntem. "Falta de divulgação" apareceu em cinco das nove respostas abertas; um respondente escreveu que falta "um indexador".',
  );
}

/* ───────────────────────── 10 — O que a sondagem derrubou ───────────────────────── */
{
  const s = slide(true);
  label(s, "SONDAGEM · O CONTRAPONTO", true);
  title(s, "O dado que contraria a nossa decisão.", true, { size: 32 });

  const left = [
    ["11/17", "preferem a demanda aberta, com qualquer um se candidatando"],
    ["2/17", "preferem o convite direcionado — o modelo que construímos"],
    ["6/17", 'deram nota máxima a "me preocupa que só uma pessoa seja contatada"'],
  ];
  left.forEach(([n, cap], i) => {
    const y = 2.5 + i * 1.25;
    s.addText(n, {
      isTextBox: true,
      x: M,
      y,
      w: 1.5,
      h: 0.6,
      margin: 0,
      fontFace: SERIF,
      fontSize: 30,
      bold: true,
      color: OFFWHITE,
      align: "right",
    });
    s.addText(cap, {
      isTextBox: true,
      x: M + 1.75,
      y: y + 0.08,
      w: 4.4,
      h: 0.9,
      margin: 0,
      fontFace: SANS,
      fontSize: 13,
      color: MUTED_DARK,
      lineSpacing: 19,
    });
  });

  s.addShape(p.ShapeType.rect, { x: 7.5, y: 2.4, w: 5.2, h: 3.9, fill: { color: OFFWHITE } });
  s.addText("A resposta do produto", {
    isTextBox: true,
    x: 7.85,
    y: 2.7,
    w: 4.5,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 20,
    bold: true,
    color: NAVY,
  });
  s.addText(
    [
      {
        text: "O medo não é do convite — é de perder a chance de se candidatar.",
        options: { bullet: true, breakLine: true },
      },
      {
        text: "Então o ranking e a justificativa ficam visíveis também para quem não foi escolhido.",
        options: { bullet: true, breakLine: true },
      },
      {
        text: "O estudante não selecionado permanece na fila da demanda seguinte, com o porquê registrado.",
        options: { bullet: true, breakLine: true },
      },
      {
        text: "Mantemos o crivo humano: 15 de 17 querem uma pessoa decidindo, não só o sistema.",
        options: { bullet: true },
      },
    ],
    {
      isTextBox: true,
      x: 7.85,
      y: 3.25,
      w: 4.5,
      h: 2.7,
      margin: 0,
      fontFace: SANS,
      fontSize: 12.5,
      color: MUTED,
      lineSpacing: 18,
      paraSpaceAfter: 9,
    },
  );
  s.addText("Preferimos apresentar o dado que nos contraria a descobri-lo numa pergunta da banca.", {
    isTextBox: true,
    x: M,
    y: 6.25,
    w: 6.5,
    h: 0.6,
    margin: 0,
    fontFace: SERIF,
    fontSize: 14,
    italic: true,
    color: OFFWHITE,
    lineSpacing: 20,
  });
  footer(s, true);
  s.addNotes(
    "Esta é a fragilidade conhecida do modelo. A sondagem também apontou a barreira de adoção mais citada: oito de dezessete disseram que dá trabalho manter o perfil atualizado.",
  );
}

/* ───────────────────────── 11 — Tração ───────────────────────── */
{
  const s = slide(false);
  label(s, "O QUE ESTÁ CONSTRUÍDO", false);
  title(s, "Vinte telas, seis mil e seiscentas linhas,\ne uma lista honesta do que falta.", false, { size: 28 });

  s.addText("REACT 19 · TYPESCRIPT STRICT · VITE · TAILWIND V4 · ~6.600 LINHAS · 20 TELAS", {
    isTextBox: true,
    x: M,
    y: 2.35,
    w: CW,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 10.5,
    bold: true,
    color: NAVY,
    charSpacing: 1.1,
  });

  const rows = [
    ["Triagem e match (curadoria)", "FUNCIONAL", 0],
    ["Convites do estudante", "FUNCIONAL", 0],
    ["Vitrine de projetos (laboratório)", "FUNCIONAL", 0],
    ["Catálogo público, perfis e impacto", "FUNCIONAL", 0],
    ["Onboarding e wizard de demanda", "NAVEGÁVEL", 1],
    ["Autenticação e persistência", "AINDA NÃO", 2],
  ];
  rows.forEach(([name, badge, kind], i) => {
    const y = 2.95 + i * 0.58;
    s.addText(name, {
      isTextBox: true,
      x: M,
      y,
      w: 6.6,
      h: 0.4,
      margin: 0,
      fontFace: SANS,
      fontSize: 14.5,
      color: NAVY,
      valign: "middle",
    });
    const bx = 7.6;
    s.addShape(p.ShapeType.rect, {
      x: bx,
      y: y + 0.03,
      w: 1.7,
      h: 0.34,
      fill: kind === 0 ? { color: NAVY } : { color: OFFWHITE },
      line: { color: kind === 2 ? RED : NAVY, width: 1 },
    });
    s.addText(badge, {
      isTextBox: true,
      x: bx,
      y: y + 0.03,
      w: 1.7,
      h: 0.34,
      margin: 0,
      fontFace: MONO,
      fontSize: 8.5,
      bold: true,
      charSpacing: 0.8,
      color: kind === 0 ? OFFWHITE : kind === 2 ? RED : NAVY,
      align: "center",
      valign: "middle",
    });
    rule(s, M, y + 0.46, 8.7, false);
  });

  s.addShape(p.ShapeType.rect, {
    x: 9.9,
    y: 2.95,
    w: 2.8,
    h: 3.0,
    fill: { color: WHITE },
    line: { color: RULE, width: 1 },
  });
  s.addText("Dados fictícios", {
    isTextBox: true,
    x: 10.15,
    y: 3.2,
    w: 2.3,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 17,
    bold: true,
    color: NAVY,
  });
  s.addText(
    "Pessoas, empresas e métricas exibidas no protótipo foram inventadas. A honestidade sobre o que ainda não existe é o que dá peso ao que já existe.",
    {
      isTextBox: true,
      x: 10.15,
      y: 3.7,
      w: 2.3,
      h: 2.0,
      margin: 0,
      fontFace: SANS,
      fontSize: 12,
      color: MUTED,
      lineSpacing: 18,
    },
  );
  footer(s);
  s.addNotes(
    "Funcional significa que o estado muda e persiste na sessão. Navegável significa que os passos avançam mas não gravam.",
  );
}

/* ───────────────────────── 12 — Roadmap + acessibilidade ───────────────────────── */
{
  const s = slide(false);
  label(s, "PRÓXIMOS PASSOS", false);
  title(s, "Em ordem de dependência, não de vontade.", false, { size: 30 });

  const steps = [
    ["Unificar as bases de dados", "Curadoria e solicitante leem listas paralelas. Maior risco estrutural.", true],
    [
      "Fechar o escopo do solicitante",
      "A sondagem respondeu: 13 de 17 esperam os dois lados. Falta assumir isso no código.",
      false,
    ],
    ["Persistência", "Nem que seja localStorage, para o estado sobreviver ao reload.", false],
    ["Autenticação real", "Com domínio institucional.", false],
    ["Evoluir o match", "Usando os níveis de proficiência já coletados.", false],
    ["Roteamento por URL", "Hoje nenhuma tela é compartilhável por link.", false],
  ];
  steps.forEach(([head, body, risk], i) => {
    const y = 2.4 + i * 0.72;
    s.addText(String(i + 1), {
      isTextBox: true,
      x: M,
      y,
      w: 0.4,
      h: 0.35,
      margin: 0,
      fontFace: MONO,
      fontSize: 13,
      bold: true,
      color: risk ? RED : MUTED,
    });
    s.addText(head, {
      isTextBox: true,
      x: M + 0.45,
      y: y - 0.02,
      w: 4.3,
      h: 0.32,
      margin: 0,
      fontFace: SANS,
      fontSize: 14.5,
      bold: true,
      color: risk ? RED : NAVY,
    });
    s.addText(body, {
      isTextBox: true,
      x: M + 0.45,
      y: y + 0.28,
      w: 6.9,
      h: 0.32,
      margin: 0,
      fontFace: SANS,
      fontSize: 12,
      color: MUTED,
    });
  });

  s.addShape(p.ShapeType.rect, { x: 8.3, y: 2.4, w: 4.4, h: 4.0, fill: { color: NAVY } });
  s.addText("WCAG 2.1 AA", {
    isTextBox: true,
    x: 8.65,
    y: 2.7,
    w: 3.7,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 22,
    bold: true,
    color: OFFWHITE,
  });
  s.addText(
    [
      {
        text: "Contraste de texto em 4,5:1 — trocamos opacidade por tokens de cor dedicados",
        options: { bullet: true, breakLine: true },
      },
      {
        text: "Foco visível em todo controle, invertido sobre superfícies escuras",
        options: { bullet: true, breakLine: true },
      },
      { text: "Todo campo com rótulo associado", options: { bullet: true, breakLine: true } },
      { text: 'h1, main e link "pular para o conteúdo" em cada tela', options: { bullet: true } },
    ],
    {
      isTextBox: true,
      x: 8.65,
      y: 3.3,
      w: 3.7,
      h: 2.1,
      margin: 0,
      fontFace: SANS,
      fontSize: 12,
      color: MUTED_DARK,
      lineSpacing: 17,
      paraSpaceAfter: 7,
    },
  );
  s.addText("Uma vitrine que exclui leitores de tela não é uma vitrine pública.", {
    isTextBox: true,
    x: 8.65,
    y: 5.6,
    w: 3.7,
    h: 0.7,
    margin: 0,
    fontFace: SERIF,
    fontSize: 14,
    italic: true,
    color: OFFWHITE,
    lineSpacing: 20,
  });
  footer(s);
  s.addNotes("Acessibilidade é requisito medido, não enfeite. O item 1 encarece a cada tela nova.");
}

/* ───────────────────────── 13 — Equipe ───────────────────────── */
{
  const s = slide(false);
  label(s, "EQUIPE", false);
  title(s, "Três pessoas, três frentes.", false, { size: 30 });

  const team = [
    ["Davi Domingos de Oliveira", "LIDERANÇA E BANCO DE DADOS"],
    ["Arthur Melo", "DESENVOLVIMENTO FRONT-END"],
    ["Rian Américo", "DESENVOLVIMENTO BACK-END"],
  ];
  const cw = 3.4;
  const gap = (CW - 3 * cw) / 2;
  team.forEach(([name, role], i) => {
    const x = M + i * (cw + gap);
    ph(s, x, 2.4, 2.4, 2.4, "[ retrato\n320 × 320 ]", false);
    s.addText(name, {
      isTextBox: true,
      x,
      y: 5.0,
      w: cw,
      h: 0.7,
      margin: 0,
      fontFace: SERIF,
      fontSize: 19,
      bold: true,
      color: NAVY,
      lineSpacing: 25,
    });
    s.addText(role, {
      isTextBox: true,
      x,
      y: 5.75,
      w: cw,
      h: 0.5,
      margin: 0,
      fontFace: MONO,
      fontSize: 9.5,
      bold: true,
      color: RED,
      charSpacing: 1.1,
      lineSpacing: 14,
    });
  });
  footer(s);
  s.addNotes("Instituto de Computação, UFAL. Projeto de Programação 3 (Web) e ACE 1.");
}

/* ───────────────────────── 14 — Fechamento ───────────────────────── */
{
  const s = slide(true);
  s.addText("O que o IC constrói\ndeve ser visível.", {
    isTextBox: true,
    x: M + 0.2,
    y: 2.0,
    w: 7.6,
    h: 1.8,
    margin: 0,
    fontFace: SERIF,
    fontSize: 44,
    bold: true,
    color: OFFWHITE,
    lineSpacing: 56,
  });
  s.addText("E quem precisa disso deve saber onde procurar.", {
    isTextBox: true,
    x: M + 0.2,
    y: 3.9,
    w: 7.6,
    h: 0.6,
    margin: 0,
    fontFace: SERIF,
    fontSize: 22,
    italic: true,
    color: MUTED_DARK,
  });
  s.addText("Vitrine pública, demanda com endereço,\nmatch com nome e justificativa.", {
    isTextBox: true,
    x: M + 0.2,
    y: 4.75,
    w: 7.6,
    h: 0.7,
    margin: 0,
    fontFace: SANS,
    fontSize: 14,
    color: OFFWHITE,
    lineSpacing: 21,
  });
  s.addText("VITRINEIC · INSTITUTO DE COMPUTAÇÃO · UFAL\nPROGRAMAÇÃO 3 (WEB) + ACE 1", {
    isTextBox: true,
    x: M + 0.2,
    y: 5.8,
    w: 7.6,
    h: 0.6,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    color: MUTED_DARK,
    charSpacing: 1.2,
    lineSpacing: 16,
  });
  s.addText("Perguntas?", {
    isTextBox: true,
    x: M + 0.2,
    y: 6.5,
    w: 3,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 18,
    italic: true,
    color: OFFWHITE,
  });
  ph(s, 9.6, 2.4, 3.1, 3.1, "[ QR code do\nrepositório ]", true);
  s.addText("[ e-mails de contato ]", {
    isTextBox: true,
    x: 9.6,
    y: 5.7,
    w: 3.1,
    h: 0.4,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: MUTED_DARK,
    align: "center",
  });
  s.addNotes("Fechamento. Abrir para perguntas.");
}

/* footers nos internos (2 a 11) */
p.writeFile({ fileName: process.argv[2] }).then((f) => console.log("escrito:", f));
