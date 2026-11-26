ALTER TABLE demanda DROP CONSTRAINT demanda_status_check;
ALTER TABLE demanda ADD CONSTRAINT demanda_status_check CHECK (
  status IN ('nova', 'em_analise', 'aprovada', 'rejeitada', 'contato_liberado', 'cancelada', 'encerrada')
);
