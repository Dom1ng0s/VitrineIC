import { describe, expect, it } from "vitest";
import { capaDeProjeto, codigoDeProjeto, urlDaCapa } from "./projeto";

describe("codigoDeProjeto", () => {
  it("encurta o uuid que o servidor gera, em vez de imprimi-lo inteiro", () => {
    expect(codigoDeProjeto("PRJ-0c08a639-530f-47c7-8f55-3cb1f93c4df1")).toBe("P-4DF1");
  });

  it("mantém legível o id curto da semente", () => {
    expect(codigoDeProjeto("PRJ-001")).toBe("P-001");
  });

  it("é estável para o mesmo id", () => {
    expect(codigoDeProjeto("PRJ-002")).toBe(codigoDeProjeto("PRJ-002"));
  });
});

describe("capaDeProjeto", () => {
  it("dá o mesmo degradê ao mesmo projeto", () => {
    expect(capaDeProjeto("PRJ-001")).toEqual(capaDeProjeto("PRJ-001"));
  });

  it("separa projetos diferentes", () => {
    const variacoes = new Set(
      ["PRJ-001", "PRJ-002", "PRJ-003", "PRJ-004", "PRJ-005", "PRJ-006"].map((id) => capaDeProjeto(id).backgroundImage),
    );
    expect(variacoes.size).toBeGreaterThan(1);
  });
});

describe("urlDaCapa", () => {
  it("não aponta para lugar nenhum quando não há imagem", () => {
    expect(urlDaCapa("PRJ-001")).toBeNull();
    expect(urlDaCapa("PRJ-001", null)).toBeNull();
  });

  it("versiona pelo instante do envio, para a troca de capa não ficar em cache", () => {
    expect(urlDaCapa("PRJ-001", "2026-11-26T10:00:00.000Z")).toBe(
      "/api/projects/PRJ-001/cover?v=2026-11-26T10%3A00%3A00.000Z",
    );
  });
});
