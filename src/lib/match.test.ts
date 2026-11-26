import { describe, expect, it } from "vitest";
import { scoreStudent } from "./match";
import { makeDemand, makeStudent } from "@/tests/fixtures";

describe("scoreStudent", () => {
  it("devolve 0 — não NaN — quando a demanda não lista competência", () => {
    const score = scoreStudent(makeStudent({ skills: ["React"] }), makeDemand({ skills: [] }));
    expect(score).toBe(0);
  });

  it("devolve 0 para quem não tem nenhuma das competências pedidas", () => {
    const student = makeStudent({ skills: ["Flutter"], interests: ["Web"], availability: "20h/sem" });
    expect(scoreStudent(student, makeDemand({ skills: ["React"], area: "Web" }))).toBe(0);
  });

  it("chega a 100 quando cobre tudo em nível especialista, com área e disponibilidade", () => {
    const student = makeStudent({
      skills: ["React", "SQL", "Figma"],
      skillLevels: { React: 4, SQL: 4 },
      interests: ["Desenvolvimento Web"],
      availability: "20h/sem",
      inProject: false,
    });
    expect(scoreStudent(student, makeDemand({ skills: ["React", "SQL"], area: "Desenvolvimento Web" }))).toBe(100);
  });

  it("diferencia nível de proficiência entre dois estudantes com as mesmas skills", () => {
    const demand = makeDemand({ skills: ["React", "SQL"], area: "Web" });
    const basico = makeStudent({
      skills: ["React", "SQL"],
      skillLevels: { React: 1, SQL: 1 },
      interests: ["Web"],
      availability: "20h/sem",
    });
    const especialista = makeStudent({
      skills: ["React", "SQL"],
      skillLevels: { React: 4, SQL: 4 },
      interests: ["Web"],
      availability: "20h/sem",
    });
    expect(scoreStudent(especialista, demand)).toBeGreaterThan(scoreStudent(basico, demand));
  });

  it("dá peso maior a competências obrigatórias do que a desejáveis", () => {
    const demand = makeDemand({
      skills: ["React", "Docker"],
      desiredSkills: ["Docker"],
      area: "Web",
    });
    const comObrigatoria = makeStudent({
      skills: ["React"],
      skillLevels: { React: 3 },
      interests: [],
      availability: "20h/sem",
    });
    const soDesejavel = makeStudent({
      skills: ["Docker"],
      skillLevels: { Docker: 3 },
      interests: [],
      availability: "20h/sem",
    });
    expect(scoreStudent(comObrigatoria, demand)).toBeGreaterThan(scoreStudent(soDesejavel, demand));
  });

  it("bonifica afinidade de área e disponibilidade livre", () => {
    const demand = makeDemand({ skills: ["React"], area: "Dados" });
    const disponivelNaArea = makeStudent({
      skills: ["React"],
      skillLevels: { React: 3 },
      interests: ["Ciência de Dados"],
      availability: "20h/sem",
      inProject: false,
    });
    const emProjetoOutraArea = makeStudent({
      skills: ["React"],
      skillLevels: { React: 3 },
      interests: ["Redes"],
      availability: "20h/sem",
      inProject: true,
    });
    expect(scoreStudent(disponivelNaArea, demand)).toBeGreaterThan(scoreStudent(emProjetoOutraArea, demand));
  });

  it("ignora diferença de caixa e não infla competência repetida", () => {
    const student = makeStudent({
      skills: ["react"],
      skillLevels: { react: 4 },
      interests: [],
      availability: "",
    });
    const semDuplicata = scoreStudent(student, makeDemand({ skills: ["React", "SQL"], area: "Outra" }));
    const comDuplicata = scoreStudent(student, makeDemand({ skills: ["React", "react", "SQL"], area: "Outra" }));
    expect(comDuplicata).toBe(semDuplicata);
  });
});
