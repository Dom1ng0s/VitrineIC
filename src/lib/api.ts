export interface ApiOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  /** Número de novas tentativas para GET em falhas transitórias (rede ou 502/503/504). */
  retries?: number;
  /** Atraso base em ms para backoff exponencial (padrão 250ms). */
  retryDelayMs?: number;
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const form = options.body instanceof FormData;
  const maxRetries = method === "GET" ? (options.retries ?? 2) : 0;
  const baseDelay = options.retryDelayMs ?? 250;

  let response: Response | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
    }
    const timeoutSignal = AbortSignal.timeout(30_000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;
    try {
      response = await fetch(`/api${path}`, {
        method,
        credentials: "same-origin",
        headers: {
          "X-Vitrine-Client": "web",
          ...(options.body !== undefined && !form ? { "Content-Type": "application/json" } : {}),
        },
        body: options.body === undefined ? undefined : form ? (options.body as FormData) : JSON.stringify(options.body),
        signal,
      });
      if (!RETRYABLE_STATUS.has(response.status) || attempt === maxRetries) break;
    } catch (err) {
      if (options.signal?.aborted) throw err;
      lastError = err;
      if (attempt === maxRetries) {
        throw new Error("Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.");
      }
    }
    await wait(baseDelay * 2 ** attempt, options.signal);
  }

  if (!response) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const fields = payload?.fields as Record<string, string[]> | undefined;
    const detail = fields ? Object.values(fields).flat().join(" ") : "";
    throw new Error(detail || payload?.error || "Não foi possível concluir a operação.");
  }
  if (!payload) throw new Error("O servidor enviou uma resposta inválida.");
  return payload as T;
}
