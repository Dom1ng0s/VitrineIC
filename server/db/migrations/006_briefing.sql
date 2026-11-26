CREATE TABLE anexo_demanda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text NOT NULL UNIQUE REFERENCES demanda(id) ON DELETE CASCADE,
  nome text NOT NULL,
  mime text NOT NULL,
  conteudo bytea NOT NULL,
  tamanho_bytes integer NOT NULL CHECK (tamanho_bytes BETWEEN 1 AND 20971520),
  enviado_em timestamptz NOT NULL DEFAULT now()
);
