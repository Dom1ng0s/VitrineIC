import { describe, expect, it } from "vitest";
import { initialStatus, isRefused, nextStatus, turnOf, visibleToRequester } from "./interest";

describe("as três portas do interesse", () => {
  it("candidatura nasce aguardando o solicitante", () => {
    expect(initialStatus("candidatura")).toBe("aguardando_solicitante");
  });

  it("convite e sugestão nascem aguardando o estudante", () => {
    expect(initialStatus("convite")).toBe("aguardando_estudante");
    expect(initialStatus("sugestao")).toBe("aguardando_estudante");
  });
});

describe("turnOf", () => {
  it("aponta de quem é a vez", () => {
    expect(turnOf("aguardando_estudante")).toBe("estudante");
    expect(turnOf("aguardando_solicitante")).toBe("solicitante");
  });

  it("devolve null quando o interesse já terminou", () => {
    expect(turnOf("contato_liberado")).toBeNull();
    expect(turnOf("recusado_estudante")).toBeNull();
    expect(turnOf("recusado_solicitante")).toBeNull();
  });
});

describe("aceite duplo", () => {
  it("candidatura aceita pelo solicitante libera o contato", () => {
    expect(nextStatus("aguardando_solicitante", "candidatura", "solicitante", true)).toBe("contato_liberado");
  });

  it("convite aceito pelo estudante libera o contato", () => {
    expect(nextStatus("aguardando_estudante", "convite", "estudante", true)).toBe("contato_liberado");
  });

  it("sugestão exige os dois aceites, estudante primeiro", () => {
    const depoisDoEstudante = nextStatus("aguardando_estudante", "sugestao", "estudante", true);
    expect(depoisDoEstudante).toBe("aguardando_solicitante");
    expect(nextStatus(depoisDoEstudante, "sugestao", "solicitante", true)).toBe("contato_liberado");
  });

  it("recusa de qualquer lado encerra o interesse", () => {
    expect(nextStatus("aguardando_estudante", "convite", "estudante", false)).toBe("recusado_estudante");
    expect(nextStatus("aguardando_solicitante", "candidatura", "solicitante", false)).toBe("recusado_solicitante");
  });

  it("ignora resposta de quem não tem a vez", () => {
    expect(nextStatus("aguardando_solicitante", "candidatura", "estudante", true)).toBe("aguardando_solicitante");
    expect(nextStatus("aguardando_estudante", "convite", "solicitante", false)).toBe("aguardando_estudante");
  });

  it("não reabre interesse já encerrado", () => {
    expect(nextStatus("contato_liberado", "convite", "estudante", false)).toBe("contato_liberado");
    expect(nextStatus("recusado_estudante", "sugestao", "solicitante", true)).toBe("recusado_estudante");
  });
});

describe("isRefused", () => {
  it("reconhece as duas recusas e só elas", () => {
    expect(isRefused("recusado_estudante")).toBe(true);
    expect(isRefused("recusado_solicitante")).toBe(true);
    expect(isRefused("contato_liberado")).toBe(false);
    expect(isRefused("aguardando_estudante")).toBe(false);
  });
});

describe("visibleToRequester", () => {
  it("esconde sugestão que o estudante ainda não aceitou", () => {
    expect(visibleToRequester({ origin: "sugestao", status: "aguardando_estudante" })).toBe(false);
  });

  it("esconde sugestão recusada pelo estudante", () => {
    expect(visibleToRequester({ origin: "sugestao", status: "recusado_estudante" })).toBe(false);
  });

  it("mostra sugestão que chegou à vez do solicitante", () => {
    expect(visibleToRequester({ origin: "sugestao", status: "aguardando_solicitante" })).toBe(true);
  });

  it("não esconde candidatura nem convite em nenhum estado", () => {
    expect(visibleToRequester({ origin: "candidatura", status: "aguardando_solicitante" })).toBe(true);
    expect(visibleToRequester({ origin: "convite", status: "aguardando_estudante" })).toBe(true);
    expect(visibleToRequester({ origin: "convite", status: "recusado_estudante" })).toBe(true);
  });
});
