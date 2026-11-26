CREATE TABLE tentativa_login (
  conta_id text PRIMARY KEY REFERENCES conta(id) ON DELETE CASCADE,
  falhas smallint NOT NULL DEFAULT 0,
  primeira_falha_em timestamptz NOT NULL DEFAULT now(),
  bloqueado_ate timestamptz
);
