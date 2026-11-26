CREATE TABLE parecer_comite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text NOT NULL REFERENCES demanda(id) ON DELETE CASCADE,
  curador_conta_id text NOT NULL REFERENCES curador(conta_id),
  texto text NOT NULL CHECK (length(btrim(texto)) BETWEEN 1 AND 3000),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX parecer_comite_demanda ON parecer_comite(demanda_id, criado_em DESC);
CREATE INDEX parecer_comite_curador ON parecer_comite(curador_conta_id);
