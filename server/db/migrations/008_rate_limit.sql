CREATE TABLE IF NOT EXISTS rate_limit_bucket (
  chave      text PRIMARY KEY,
  contagem   integer NOT NULL,
  expira_em  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limit_bucket_expira ON rate_limit_bucket(expira_em);
