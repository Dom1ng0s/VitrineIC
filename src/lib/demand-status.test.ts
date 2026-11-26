import { describe, expect, it } from "vitest";
import { canTriageTransition } from "./demand-status";

describe("transições da triagem", () => {
  it("separa triagem de decisão", () => {
    expect(canTriageTransition("nova", "em_analise", "curador")).toBe(true);
    expect(canTriageTransition("nova", "aprovada", "curador")).toBe(false);
    expect(canTriageTransition("nova", "rejeitada", "coordenacao")).toBe(true);
    expect(canTriageTransition("nova", "em_analise", "comite")).toBe(false);
  });

  it("impede reabrir contato liberado ou demanda encerrada", () => {
    expect(canTriageTransition("contato_liberado", "em_analise", "coordenacao")).toBe(false);
    expect(canTriageTransition("cancelada", "nova", "coordenacao")).toBe(false);
    expect(canTriageTransition("encerrada", "nova", "coordenacao")).toBe(false);
    expect(canTriageTransition("aprovada", "nova", "coordenacao")).toBe(false);
  });
});
