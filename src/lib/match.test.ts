import { describe, expect, it } from "vitest";
import { scoreStudent } from "./match";
import { makeDemand, makeStudent } from "@/tests/fixtures";

describe("scoreStudent", () => {
  it("devolve 0 — não NaN — quando a demanda não lista competência", () => {
    const score = scoreStudent(makeStudent({ skills: ["React"] }), makeDemand({ skills: [] }));
    expect(score).toBe(0);
  });

  it("devolve 100 quando o estudante cobre tudo", () => {
    const student = makeStudent({ skills: ["React", "SQL", "Figma"] });
    expect(scoreStudent(student, makeDemand({ skills: ["React", "SQL"] }))).toBe(100);
  });

  it("devolve o percentual coberto, arredondado", () => {
    const student = makeStudent({ skills: ["React"] });
    expect(scoreStudent(student, makeDemand({ skills: ["React", "SQL", "Figma"] }))).toBe(33);
  });

  it("ignora diferença de caixa", () => {
    const student = makeStudent({ skills: ["react", "NODE.JS"] });
    expect(scoreStudent(student, makeDemand({ skills: ["React", "node.js"] }))).toBe(100);
  });

  it("não deixa competência repetida na demanda inflar o total", () => {
    const student = makeStudent({ skills: ["React"] });
    expect(scoreStudent(student, makeDemand({ skills: ["React", "react", "SQL"] }))).toBe(50);
  });

  it("devolve 0 para quem não tem nenhuma das competências pedidas", () => {
    const student = makeStudent({ skills: ["Flutter"] });
    expect(scoreStudent(student, makeDemand({ skills: ["React"] }))).toBe(0);
  });
});
