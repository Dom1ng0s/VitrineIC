ALTER TABLE demanda_competencia
  ADD COLUMN IF NOT EXISTS obrigatoria boolean NOT NULL DEFAULT true;
