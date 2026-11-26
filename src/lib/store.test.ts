import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VitrineState } from "@/types/api";

/**
 * O store guarda estado em módulo, então cada teste recarrega o módulo para
 * começar limpo.
 */
async function loadStore() {
  vi.resetModules();
  return import("./store");
}

function snapshot(patch: Partial<VitrineState> = {}): VitrineState {
  return {
    students: [],
    companies: [],
    accounts: [],
    session: null,
    demands: [],
    interests: [],
    inProject: {},
    notifications: [],
    attachments: [],
    demo: false,
    auth: { emailEnabled: false, verificationRequired: false },
    impact: { released: 0, projects: 0, demands: 0, students: 0, byArea: [], byCourse: [] },
    ...patch,
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("refreshState", () => {
  it("substitui o estado e marca a conexão como pronta", async () => {
    const store = await loadStore();
    const vindo = snapshot({ demands: [{ id: "d1" } as never] });
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => vindo } as Response);

    await store.refreshState();

    expect(store.getState().demands).toHaveLength(1);
    expect(store.getConnection().ready).toBe(true);
    expect(store.getConnection().error).toBe("");
  });

  it("reúne páginas antes de publicar o estado completo", async () => {
    const store = await loadStore();
    const first = snapshot({ demands: [{ id: "d1" } as never], pagination: { nextOffset: 100 } });
    const second = snapshot({ demands: [{ id: "d2" } as never], pagination: { nextOffset: null } });
    fetchMock
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => first } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => second } as Response);

    await store.refreshState();

    expect(store.getState().demands.map((d) => d.id)).toEqual(["d1", "d2"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getConnection().ready).toBe(true);
  });

  it("não marca como pronta quando a API falha, e guarda o erro", async () => {
    const store = await loadStore();
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await store.refreshState();

    expect(store.getConnection().ready).toBe(false);
    expect(store.getConnection().error).toMatch(/Não foi possível conectar ao servidor/);
  });
});

describe("runAction", () => {
  it("conta a ação em curso e volta a zero ao terminar", async () => {
    const store = await loadStore();
    let liberar!: (valor: string) => void;
    const emCurso = new Promise<string>((resolve) => {
      liberar = resolve;
    });
    const acao = store.runAction(() => emCurso);

    expect(store.getConnection().pending).toBe(1);
    liberar("feito");
    await expect(acao).resolves.toBe("feito");
    expect(store.getConnection().pending).toBe(0);
  });

  it("engole a falha, devolve undefined e publica a mensagem", async () => {
    const store = await loadStore();
    const resultado = await store.runAction(async () => {
      throw new Error("Prazo inválido.");
    });

    expect(resultado).toBeUndefined();
    expect(store.getConnection().error).toBe("Prazo inválido.");
    expect(store.getConnection().pending).toBe(0);
  });

  it("limpa o erro anterior ao começar uma ação nova", async () => {
    const store = await loadStore();
    await store.runAction(async () => {
      throw new Error("Prazo inválido.");
    });
    expect(store.getConnection().error).toBe("Prazo inválido.");

    await store.runAction(async () => "ok");
    expect(store.getConnection().error).toBe("");
  });

  it("serializa as ações na ordem de chamada", async () => {
    const store = await loadStore();
    const ordem: string[] = [];
    const lenta = store.runAction(async () => {
      await new Promise((r) => setTimeout(r, 20));
      ordem.push("primeira");
    });
    const rapida = store.runAction(async () => {
      ordem.push("segunda");
    });

    await Promise.all([lenta, rapida]);
    expect(ordem).toEqual(["primeira", "segunda"]);
  });

  it("uma falha não impede a ação seguinte de rodar", async () => {
    const store = await loadStore();
    await store.runAction(async () => {
      throw new Error("caiu");
    });
    await expect(store.runAction(async () => "segue")).resolves.toBe("segue");
  });
});

describe("clearError", () => {
  it("apaga a mensagem sem tocar no estado", async () => {
    const store = await loadStore();
    await store.runAction(async () => {
      throw new Error("falhou");
    });
    store.clearError();
    expect(store.getConnection().error).toBe("");
  });
});

describe("allProjects", () => {
  it("achata os projetos de cada estudante e carrega o autor", async () => {
    const store = await loadStore();
    const students = [
      {
        id: "s1",
        name: "Ana",
        projects: [
          { id: "p1", title: "Um" },
          { id: "p2", title: "Dois" },
        ],
      },
      { id: "s2", name: "Bia", projects: [] },
    ] as never;

    const projetos = store.allProjects(students);

    expect(projetos.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(projetos[0].student.name).toBe("Ana");
  });
});

describe("findActiveInterest", () => {
  it("acha o interesse em aberto do par demanda/estudante", async () => {
    const store = await loadStore();
    const interests = [{ id: "i1", demandId: "d1", studentId: "s1", status: "aguardando_estudante" }] as never;
    expect(store.findActiveInterest(interests, "d1", "s1")?.id).toBe("i1");
  });

  it("ignora os recusados dos dois lados, para permitir nova tentativa", async () => {
    const store = await loadStore();
    const interests = [
      { id: "i1", demandId: "d1", studentId: "s1", status: "recusado_estudante" },
      { id: "i2", demandId: "d1", studentId: "s2", status: "recusado_solicitante" },
    ] as never;
    expect(store.findActiveInterest(interests, "d1", "s1")).toBeUndefined();
    expect(store.findActiveInterest(interests, "d1", "s2")).toBeUndefined();
  });

  it("considera contato liberado como interesse ativo", async () => {
    const store = await loadStore();
    const interests = [{ id: "i3", demandId: "d2", studentId: "s3", status: "contato_liberado" }] as never;
    expect(store.findActiveInterest(interests, "d2", "s3")?.id).toBe("i3");
  });
});
