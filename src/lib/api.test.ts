import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

/** Resposta mínima no formato que `api` espera do `fetch`. */
function reply(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("api", () => {
  it("prefixa /api e devolve o payload", async () => {
    fetchMock.mockResolvedValue(reply({ ok: 1 }));
    await expect(api("/state")).resolves.toEqual({ ok: 1 });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/state");
  });

  it("vai como GET com credenciais da mesma origem e sem Content-Type", async () => {
    fetchMock.mockResolvedValue(reply({}));
    await api("/state");
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("same-origin");
    expect(init.headers["X-Vitrine-Client"]).toBe("web");
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body).toBeUndefined();
  });

  it("serializa corpo de objeto como JSON", async () => {
    fetchMock.mockResolvedValue(reply({}));
    await api("/demands", { method: "POST", body: { title: "Site" } });
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ title: "Site" }));
  });

  it("manda FormData sem Content-Type, para o navegador pôr o boundary", async () => {
    fetchMock.mockResolvedValue(reply({}));
    const form = new FormData();
    form.append("file", new Blob(["x"]), "portfolio.pdf");
    await api("/attachments/portfolio", { method: "POST", body: form });
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body).toBe(form);
  });

  it("usa os erros de campo como mensagem, juntos", async () => {
    fetchMock.mockResolvedValue(
      reply({ fields: { email: ["E-mail inválido."], senha: ["Curta."] } }, { ok: false, status: 400 }),
    );
    await expect(api("/auth/login", { method: "POST", body: {} })).rejects.toThrow("E-mail inválido. Curta.");
  });

  it("cai para o erro geral do servidor quando não há campo", async () => {
    fetchMock.mockResolvedValue(reply({ error: "Conta não encontrada." }, { ok: false, status: 404 }));
    await expect(api("/auth/login")).rejects.toThrow("Conta não encontrada.");
  });

  it("tem mensagem própria para falha sem corpo legível", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(api("/state")).rejects.toThrow("Não foi possível concluir a operação.");
  });

  it("recusa resposta vazia mesmo com status ok", async () => {
    fetchMock.mockResolvedValue(reply(null));
    await expect(api("/state")).rejects.toThrow("O servidor enviou uma resposta inválida.");
  });

  it("transforma falha de rede em mensagem de conexão", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api("/state")).rejects.toThrow(/Não foi possível conectar ao servidor/);
  });
});
