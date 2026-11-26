export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function ensure(condition: unknown, status: number, message: string): asserts condition {
  if (!condition) throw new HttpError(status, message);
}

export function ensureUuid(value: string, label: string) {
  ensure(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
    404,
    `${label} não encontrado.`,
  );
}
