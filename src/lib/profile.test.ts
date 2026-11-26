import { describe, expect, it } from "vitest";
import { fromDraft, isProfileVisible, toDraft } from "./profile";
import { makeStudent } from "@/tests/fixtures";

describe("isProfileVisible", () => {
  it("esconde quem não declarou nenhuma competência", () => {
    expect(isProfileVisible(makeStudent({ skills: [] }))).toBe(false);
  });

  it("mostra quem declarou ao menos uma", () => {
    expect(isProfileVisible(makeStudent({ skills: ["React"] }))).toBe(true);
  });

  it("não depende de bio, projeto ou foto", () => {
    const vazio = makeStudent({ skills: ["SQL"], bio: "", projects: [], photo: "" });
    expect(isProfileVisible(vazio)).toBe(true);
  });
});

describe("toDraft e fromDraft", () => {
  it("leva o nível declarado para o rascunho e devolve 1 quando falta", () => {
    const student = makeStudent({ skills: ["React", "SQL"], skillLevels: { React: 3 } });
    expect(toDraft(student).skills).toEqual([
      { name: "React", level: 3 },
      { name: "SQL", level: 1 },
    ]);
  });

  it("preserva competências e níveis na ida e volta", () => {
    const student = makeStudent({ skills: ["React", "SQL"], skillLevels: { React: 3, SQL: 2 } });
    const volta = fromDraft(toDraft(student));
    expect(volta.skills).toEqual(["React", "SQL"]);
    expect(volta.skillLevels).toEqual({ React: 3, SQL: 2 });
  });

  it("deriva as iniciais do primeiro e do último nome", () => {
    expect(fromDraft(toDraft(makeStudent({ name: "maria clara de souza lima" }))).initials).toBe("ML");
  });

  it("usa uma só inicial em nome único", () => {
    expect(fromDraft(toDraft(makeStudent({ name: "Madonna" }))).initials).toBe("M");
  });

  it("apara espaço em volta do nome e dos links", () => {
    const draft = { ...toDraft(makeStudent()), name: "  Ana Souza  ", github: " github.com/ana " };
    const volta = fromDraft(draft);
    expect(volta.name).toBe("Ana Souza");
    expect(volta.github).toBe("github.com/ana");
  });
});
