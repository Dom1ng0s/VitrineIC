/**
 * Gera docs/VitrineIC-Pitch-7min.pptx — pitch de 7 minutos com capturas reais
 * das telas (docs/shots/). Rode com: node docs/pitch7-deck.build.cjs
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const NAVY = "1C2B4A";
const RED = "c1121f";
const OFFWHITE = "F5F4F0";
const MUTED = "4A4A4A";
const MUTED_DARK = "C9CEDA";
const WHITE = "FFFFFF";
const RULE = "C7CBD4";

const SERIF = "Cambria";
const SANS = "Calibri";
const MONO = "Consolas";

const M = 0.6;
const W = 13.333;
const H = 7.5;
const CW = W - 2 * M;
const SHOTS = path.join(__dirname, "shots");

const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Davi Domingos de Oliveira, Arthur Melo, Rian Américo";
p.company = "Instituto de Computação · UFAL";
p.title = "VitrineIC — Pitch (7 min)";

let N = 0;
function slide(dark) {
  N += 1;
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
function title(s, text, dark, o = {}) {
  s.addText(text, {
    isTextBox: true,
    x: M,
    y: o.y || 0.85,
    w: o.w || CW * 0.72,
    h: o.h || 1.0,
    margin: 0,
    fontFace: SERIF,
    fontSize: o.size || 30,
    bold: true,
    color: dark ? OFFWHITE : NAVY,
    lineSpacing: (o.size || 30) * 1.16,
    valign: "top",
  });
}
function footer(s, dark) {
  const c = dark ? MUTED_DARK : MUTED;
  s.addText("VITRINEIC · IC/UFAL", {
    isTextBox: true,
    x: M,
    y: H - 0.5,
    w: 4,
    h: 0.25,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: c,
    charSpacing: 1.2,
  });
  s.addText(String(N), {
    isTextBox: true,
    x: W - M - 1,
    y: H - 0.5,
    w: 1,
    h: 0.25,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: c,
    align: "right",
  });
}
/** Captura de tela com moldura e barra de janela. */
function shot(s, file, x, y, w, dark) {
  const h = (w * 900) / 1440;
  const bar = 0.16;
  s.addShape(p.ShapeType.roundRect, {
    x,
    y,
    w,
    h: h + bar,
    rectRadius: 0.06,
    fill: { color: dark ? "0F1A30" : WHITE },
    line: { color: dark ? "45536E" : RULE, width: 1 },
    shadow: { type: "outer", blur: 14, offset: 3, angle: 90, color: "000000", opacity: 0.16 },
  });
  [0, 1, 2].forEach((i) => {
    s.addShape(p.ShapeType.ellipse, {
      x: x + 0.12 + i * 0.14,
      y: y + 0.055,
      w: 0.075,
      h: 0.075,
      fill: { color: dark ? "45536E" : RULE },
      line: { width: 0 },
    });
  });
  s.addImage({ path: path.join(SHOTS, file), x, y: y + bar, w, h });
  return h + bar;
}
function caption(s, text, x, y, w, dark) {
  s.addText(text, {
    isTextBox: true,
    x,
    y,
    w,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: dark ? MUTED_DARK : MUTED,
    charSpacing: 1,
  });
}
function body(s, text, x, y, w, h, dark, o = {}) {
  s.addText(text, {
    isTextBox: true,
    x,
    y,
    w,
    h,
    margin: 0,
    fontFace: SANS,
    fontSize: o.size || 14,
    color: dark ? MUTED_DARK : MUTED,
    lineSpacing: (o.size || 14) * 1.5,
  });
}

/* ───── 1 — Capa + propósito ───── */
{
  const s = slide(true);
  s.addText("VitrineIC", {
    isTextBox: true,
    x: M + 0.2,
    y: 1.5,
    w: 6.0,
    h: 1.1,
    margin: 0,
    fontFace: SERIF,
    fontSize: 54,
    bold: true,
    color: OFFWHITE,
  });
  s.addShape(p.ShapeType.line, { x: M + 0.2, y: 2.75, w: 1.2, h: 0, line: { color: RED, width: 2.5 } });
  s.addText("Conectando inovação acadêmica\na quem precisa dela", {
    isTextBox: true,
    x: M + 0.2,
    y: 2.95,
    w: 6.0,
    h: 1.0,
    margin: 0,
    fontFace: SERIF,
    fontSize: 21,
    italic: true,
    color: MUTED_DARK,
    lineSpacing: 29,
  });
  s.addText(
    "Uma vitrine pública dos projetos do Instituto de Computação, um mural de demandas de quem precisa de desenvolvedores, e um match com curadoria humana entre os dois.",
    {
      isTextBox: true,
      x: M + 0.2,
      y: 4.15,
      w: 5.9,
      h: 1.3,
      margin: 0,
      fontFace: SANS,
      fontSize: 14,
      color: OFFWHITE,
      lineSpacing: 22,
    },
  );
  s.addText("INSTITUTO DE COMPUTAÇÃO · UFAL · MACEIÓ\nPROGRAMAÇÃO 3 (WEB) + ACE 1", {
    isTextBox: true,
    x: M + 0.2,
    y: 5.9,
    w: 6.0,
    h: 0.7,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    color: MUTED_DARK,
    charSpacing: 1.2,
    lineSpacing: 17,
  });
  shot(s, "01-landing.png", 7.1, 1.85, 5.6, true);
  s.addNotes(
    "Todo semestre, dezenas de projetos bons morrem em repositórios do GitHub que ninguém abre. E quem precisa de um desenvolvedor não sabe onde procurar dentro do próprio Instituto. O VitrineIC resolve os dois lados do mesmo problema.",
  );
}

/* ───── 2 — O propósito / o problema ───── */
{
  const s = slide(false);
  label(s, "POR QUE EXISTE", false);
  title(s, "Fora do GitHub, não existe lugar onde\no que o IC produz fique visível.", false, {
    size: 29,
    w: CW * 0.85,
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
      "10 de 17 não conhecem gente com interesses parecidos fora da própria turma",
    ],
  ];
  const cw = (CW - 1.0) / 3;
  cols.forEach(([num, head, txt, datum], i) => {
    const x = M + i * (cw + 0.5);
    s.addText(num, {
      isTextBox: true,
      x,
      y: 2.55,
      w: cw,
      h: 0.5,
      margin: 0,
      fontFace: MONO,
      fontSize: 21,
      bold: true,
      color: RED,
    });
    s.addText(head, {
      isTextBox: true,
      x,
      y: 3.12,
      w: cw,
      h: 0.4,
      margin: 0,
      fontFace: SANS,
      fontSize: 17,
      bold: true,
      color: NAVY,
    });
    s.addText(txt, {
      isTextBox: true,
      x,
      y: 3.6,
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
      y: 4.6,
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
    s.addShape(p.ShapeType.line, {
      x: M + (i + 1) * (cw + 0.5) - 0.25,
      y: 2.6,
      w: 0,
      h: 2.4,
      line: { color: RULE, width: 0.75 },
    });
  });
  s.addShape(p.ShapeType.rect, { x: 0, y: 5.4, w: W, h: 1.3, fill: { color: NAVY } });
  s.addText(
    "O custo não é só do estudante. É do Instituto, que perde PIBIC, PIBITI\ne startups que nunca chegaram a começar.",
    {
      isTextBox: true,
      x: M,
      y: 5.65,
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
  s.addNotes(
    "Três consequências concretas, cada uma apoiada na sondagem que fizemos com estudantes do IC. O custo é institucional, não individual.",
  );
}

/* ───── 3 — A solução em três peças ───── */
{
  const s = slide(false);
  label(s, "A SOLUÇÃO", false);
  title(s, "Vitrine pública, mural de demandas,\ne um match com crivo humano entre os dois.", false, {
    size: 26,
    w: CW * 0.9,
  });

  const cards = [
    ["Vitrine de projetos", "O estudante expõe o que constrói, no espírito de startup em estágio inicial.", false],
    [
      "Match com crivo humano",
      "O sistema ordena por compatibilidade; um curador escolhe uma pessoa e escreve o porquê.",
      true,
    ],
    ["Mural de demandas", "Quem precisa publica o que precisa, com skills, escopo e prazo definidos.", false],
  ];
  const cw = 3.7;
  const gap = (CW - 3 * cw) / 2;
  cards.forEach(([head, txt, hero], i) => {
    const x = M + i * (cw + gap);
    const y = hero ? 2.4 : 2.6;
    const h = hero ? 2.9 : 2.5;
    s.addShape(p.ShapeType.roundRect, {
      x,
      y,
      w: cw,
      h,
      rectRadius: 0.04,
      fill: { color: hero ? NAVY : WHITE },
      line: { color: hero ? NAVY : RULE, width: 1 },
    });
    s.addText(String(i + 1).padStart(2, "0"), {
      isTextBox: true,
      x: x + 0.35,
      y: y + 0.3,
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
      y: y + 0.82,
      w: cw - 0.7,
      h: 0.8,
      margin: 0,
      fontFace: SERIF,
      fontSize: 19,
      bold: true,
      color: hero ? OFFWHITE : NAVY,
      lineSpacing: 25,
    });
    s.addText(txt, {
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
  s.addText("Não é candidatura aberta: a máquina nunca confirma sozinha.", {
    isTextBox: true,
    x: M,
    y: 5.7,
    w: CW,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 17,
    italic: true,
    color: NAVY,
  });
  footer(s);
  s.addNotes(
    "Três peças, nenhuma opcional. A do meio é a que nos diferencia: num mural comum, trinta pessoas se candidatam e alguém filtra trinta currículos. Aqui o algoritmo ordena e o humano decide.",
  );
}

/* ───── 4 — A vitrine pública ───── */
{
  const s = slide(false);
  label(s, "SEM LOGIN · ALCANCE EXTERNO", false);
  title(s, "O catálogo público é a vitrine.", false, { size: 29 });
  body(
    s,
    "Qualquer pessoa — empresa, professor, candidato ao vestibular — navega os projetos e os perfis sem criar conta. É isso que sustenta a exigência de alcance externo da ACE1: o trabalho do IC fica visível para quem nunca entrou na plataforma.",
    M,
    1.95,
    4.3,
    2.0,
    false,
    { size: 13.5 },
  );
  shot(s, "02-catalogo.png", 5.3, 1.9, 7.4, false);
  caption(s, "CATÁLOGO PÚBLICO DE PROJETOS", 5.3, 6.7, 6.0, false);
  footer(s);
  s.addNotes("Catálogo público, perfis de estudante e painel de impacto: tudo acessível sem login.");
}

/* ───── 5 — A demanda ───── */
{
  const s = slide(false);
  label(s, "QUEM PRECISA", false);
  title(s, "A demanda entra em quatro passos.", false, { size: 29 });
  body(
    s,
    "Descrição do problema, escopo e prazo, requisitos técnicos, revisão. No fim o solicitante recebe um protocolo e acompanha o status da demanda até o match.",
    M,
    1.95,
    4.3,
    1.6,
    false,
    { size: 13.5 },
  );
  s.addText("DESCRIÇÃO  →  ESCOPO  →  REQUISITOS  →  REVISÃO", {
    isTextBox: true,
    x: M,
    y: 3.9,
    w: 4.4,
    h: 0.6,
    margin: 0,
    fontFace: MONO,
    fontSize: 10.5,
    color: RED,
    charSpacing: 0.8,
    lineSpacing: 18,
  });
  shot(s, "14-wizard.png", 5.3, 1.9, 7.4, false);
  caption(s, "SOLICITANTE · NOVA DEMANDA", 5.3, 6.7, 6.0, false);
  footer(s);
  s.addNotes(
    "O solicitante é a empresa, o laboratório ou o professor. Quatro passos, sem jargão de formulário acadêmico.",
  );
}

/* ───── 6 — A curadoria ───── */
{
  const s = slide(false);
  label(s, "CURADORIA", false);
  title(s, "Toda demanda passa por triagem humana.", false, { size: 27 });
  body(
    s,
    "Um kanban com cinco estados — nova, em análise, aprovada, rejeitada, matched. Nada chega ao estudante sem ter passado por aqui.",
    M,
    1.95,
    4.3,
    1.6,
    false,
    { size: 13.5 },
  );
  shot(s, "05-triagem.png", 5.3, 1.9, 7.4, false);
  caption(s, "CURADORIA · FILA DE TRIAGEM", 5.3, 6.7, 6.0, false);
  footer(s);
  s.addNotes(
    "A curadoria é operada por um projeto de extensão do IC. Tem custo humano recorrente, e isso está assumido no modelo de negócio.",
  );
}

/* ───── 7 — O match ───── */
{
  const s = slide(true);
  label(s, "O MATCH", true);
  title(s, "O algoritmo ordena. O humano decide.", true, { size: 27 });
  s.addShape(p.ShapeType.rect, {
    x: M,
    y: 2.0,
    w: 4.3,
    h: 0.75,
    fill: { color: "0F1A30" },
    line: { color: "45536E", width: 1 },
  });
  s.addText("score = skills cobertas ÷ skills exigidas × 100", {
    isTextBox: true,
    x: M + 0.2,
    y: 2.18,
    w: 3.95,
    h: 0.4,
    margin: 0,
    fontFace: MONO,
    fontSize: 10.5,
    color: OFFWHITE,
  });
  body(
    s,
    "A demanda é o denominador — mede cobertura da necessidade, não o repertório do estudante. Nomes de tecnologia são normalizados, então grafia diferente não quebra o match.\n\nPreferimos um algoritmo que o curador consegue explicar ao estudante a um que ninguém consegue auditar.",
    M,
    3.0,
    4.3,
    2.6,
    true,
    { size: 13 },
  );
  shot(s, "07-ranking.png", 5.3, 1.9, 7.4, true);
  caption(s, "CURADORIA · RANKING DE CANDIDATOS", 5.3, 6.7, 6.0, true);
  footer(s, true);
  s.addNotes(
    "Limitações conhecidas, ditas em voz alta: os níveis de proficiência já são coletados e ainda não pesam na conta; disponibilidade e área de interesse ficam de fora; todas as skills valem igual.",
  );
}

/* ───── 8 — O estudante ───── */
{
  const s = slide(false);
  label(s, "DO OUTRO LADO", false);
  title(s, "O estudante recebe um convite,\nnão uma vaga para disputar.", false, { size: 26 });
  body(
    s,
    "Só a pessoa escolhida é contatada, com a justificativa técnica visível. Ela aceita ou recusa — e a conexão aparece nos dois painéis.",
    M,
    2.3,
    4.3,
    1.6,
    false,
    { size: 13.5 },
  );
  shot(s, "12-convites.png", 5.3, 1.9, 7.4, false);
  caption(s, "ESTUDANTE · NOTIFICAÇÕES E CONVITES", 5.3, 6.7, 6.0, false);
  footer(s);
  s.addNotes(
    "Antes disso o estudante passa por um onboarding de três passos: perfil, competências com nível de proficiência e idiomas, portfólio.",
  );
}

/* ───── 9 — Impacto e ACE1 ───── */
{
  const s = slide(false);
  label(s, "IMPACTO · ACE 1", false);
  title(s, "A plataforma mede a si mesma.", false, { size: 29 });
  body(
    s,
    "Os indicadores do painel são derivados das bases em tempo de render, nunca digitados à mão. Mais depoimentos de estudante e de solicitante — o qualitativo que número não alcança.",
    M,
    1.95,
    4.3,
    1.8,
    false,
    { size: 13.5 },
  );
  const metas = [
    ["8", "ESTUDANTES"],
    ["10", "PROJETOS"],
    ["6", "DEMANDAS"],
    ["3", "MATCHES"],
  ];
  metas.forEach(([n, l], i) => {
    const x = M + (i % 2) * 2.15;
    const y = 4.0 + Math.floor(i / 2) * 1.05;
    s.addText(n, {
      isTextBox: true,
      x,
      y,
      w: 1.9,
      h: 0.5,
      margin: 0,
      fontFace: SERIF,
      fontSize: 26,
      bold: true,
      color: NAVY,
    });
    s.addText(l, {
      isTextBox: true,
      x,
      y: y + 0.52,
      w: 1.9,
      h: 0.3,
      margin: 0,
      fontFace: MONO,
      fontSize: 8.5,
      color: MUTED,
      charSpacing: 1,
    });
  });
  s.addText("METAS DO PERÍODO", {
    isTextBox: true,
    x: M,
    y: 3.65,
    w: 4.3,
    h: 0.3,
    margin: 0,
    fontFace: MONO,
    fontSize: 9,
    color: RED,
    charSpacing: 1.2,
  });
  shot(s, "04-impacto.png", 5.3, 1.9, 7.4, false);
  caption(s, "PAINEL PÚBLICO DE IMPACTO", 5.3, 6.7, 6.0, false);
  footer(s);
  s.addNotes(
    "Todos os dados exibidos no protótipo são fictícios — pessoas, empresas e métricas foram inventadas. Diga isso aqui, uma vez, e siga.",
  );
}

/* ───── 10 — Estado e próximos passos ───── */
{
  const s = slide(false);
  label(s, "ESTADO ATUAL E PRÓXIMOS PASSOS", false);
  title(s, "React 19 · TypeScript strict · Vite · Tailwind v4", false, { size: 25, w: CW });

  const left = [
    [
      "Funcional",
      "Triagem e match da curadoria · convites do estudante · vitrine de projetos · catálogo público, perfis e impacto",
    ],
    ["Navegável", "Onboarding do estudante e wizard de demanda — os passos avançam, ainda não gravam"],
    ["Ainda não", "Autenticação real e persistência entre sessões"],
  ];
  left.forEach(([h, t], i) => {
    const y = 2.3 + i * 1.25;
    s.addText(h, {
      isTextBox: true,
      x: M,
      y,
      w: 5.6,
      h: 0.35,
      margin: 0,
      fontFace: MONO,
      fontSize: 10,
      bold: true,
      color: RED,
      charSpacing: 1.2,
    });
    s.addText(t, {
      isTextBox: true,
      x: M,
      y: y + 0.38,
      w: 5.6,
      h: 0.8,
      margin: 0,
      fontFace: SANS,
      fontSize: 13,
      color: MUTED,
      lineSpacing: 19,
    });
  });
  s.addShape(p.ShapeType.line, { x: 6.75, y: 2.3, w: 0, h: 3.6, line: { color: RULE, width: 0.75 } });
  s.addText("PRÓXIMOS PASSOS", {
    isTextBox: true,
    x: 7.2,
    y: 2.3,
    w: 5.5,
    h: 0.35,
    margin: 0,
    fontFace: MONO,
    fontSize: 10,
    bold: true,
    color: RED,
    charSpacing: 1.2,
  });
  const next = [
    "Unificar as bases paralelas de demandas — maior risco estrutural",
    "Persistência, nem que seja local, para o estado sobreviver ao reload",
    "Autenticação real com domínio institucional",
    "Evoluir o match usando os níveis de proficiência já coletados",
    "Roteamento por URL, para que cada tela seja compartilhável",
  ];
  next.forEach((t, i) => {
    const y = 2.78 + i * 0.63;
    s.addText(String(i + 1).padStart(2, "0"), {
      isTextBox: true,
      x: 7.2,
      y,
      w: 0.5,
      h: 0.3,
      margin: 0,
      fontFace: MONO,
      fontSize: 10,
      color: NAVY,
    });
    s.addText(t, {
      isTextBox: true,
      x: 7.75,
      y: y - 0.03,
      w: 4.95,
      h: 0.5,
      margin: 0,
      fontFace: SANS,
      fontSize: 13,
      color: MUTED,
      lineSpacing: 18,
    });
  });
  footer(s);
  s.addNotes(
    "Em ordem de dependência, não de vontade. Unificar as bases vem primeiro porque cada tela nova encarece o conserto.",
  );
}

/* ───── 11 — Fechamento ───── */
{
  const s = slide(true);
  s.addShape(p.ShapeType.line, { x: M + 0.2, y: 2.2, w: 1.2, h: 0, line: { color: RED, width: 2.5 } });
  s.addText("O que o IC constrói\ndeve ser visível.", {
    isTextBox: true,
    x: M + 0.2,
    y: 2.5,
    w: 8.6,
    h: 1.9,
    margin: 0,
    fontFace: SERIF,
    fontSize: 42,
    bold: true,
    color: OFFWHITE,
    lineSpacing: 52,
  });
  s.addText("E quem precisa disso deve saber onde procurar.", {
    isTextBox: true,
    x: M + 0.2,
    y: 4.45,
    w: 8.6,
    h: 0.5,
    margin: 0,
    fontFace: SERIF,
    fontSize: 20,
    italic: true,
    color: MUTED_DARK,
  });
  s.addText("VitrineIC — vitrine pública, demanda com endereço,\nmatch com nome e justificativa.", {
    isTextBox: true,
    x: M + 0.2,
    y: 5.25,
    w: 8.6,
    h: 0.8,
    margin: 0,
    fontFace: SANS,
    fontSize: 14,
    color: OFFWHITE,
    lineSpacing: 22,
  });
  s.addText("INSTITUTO DE COMPUTAÇÃO · UFAL\nPROGRAMAÇÃO 3 (WEB) + ACE 1", {
    isTextBox: true,
    x: M + 0.2,
    y: 6.4,
    w: 6,
    h: 0.6,
    margin: 0,
    fontFace: MONO,
    fontSize: 9.5,
    color: MUTED_DARK,
    charSpacing: 1.2,
    lineSpacing: 16,
  });
  s.addText("Perguntas?", {
    isTextBox: true,
    x: W - M - 3.2,
    y: 6.4,
    w: 3,
    h: 0.4,
    margin: 0,
    fontFace: SERIF,
    fontSize: 18,
    italic: true,
    color: MUTED_DARK,
    align: "right",
  });
  s.addNotes(
    "Fechar e abrir para perguntas. Se houver tempo, demonstrar ao vivo o eixo curadoria → convite → conexão.",
  );
}

p.writeFile({ fileName: path.join(__dirname, "VitrineIC-Pitch-7min.pptx") }).then((f) => console.log("gerado:", f));
