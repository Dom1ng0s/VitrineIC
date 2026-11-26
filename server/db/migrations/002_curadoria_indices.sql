CREATE TABLE funcao_curadoria (
  codigo text PRIMARY KEY CHECK (codigo IN ('curador', 'coordenacao', 'comite')),
  rotulo text NOT NULL
);

INSERT INTO funcao_curadoria (codigo, rotulo) VALUES
  ('curador', 'Curador'),
  ('coordenacao', 'Coordenação'),
  ('comite', 'Comitê de alunos');

CREATE TABLE curador (
  conta_id text PRIMARY KEY REFERENCES conta(id) ON DELETE CASCADE,
  funcao_codigo text NOT NULL REFERENCES funcao_curadoria(codigo),
  ativo boolean NOT NULL DEFAULT true
);

-- As contas existentes tinham acesso irrestrito à curadoria.
INSERT INTO curador (conta_id, funcao_codigo)
SELECT id, 'coordenacao' FROM conta WHERE papel = 'curator';

CREATE INDEX notificacao_demanda ON notificacao(demanda_id);
CREATE INDEX notificacao_interesse ON notificacao(interesse_id);
CREATE INDEX notificacao_mensagem ON notificacao(mensagem_id);
CREATE INDEX mensagem_remetente ON mensagem(remetente_conta_id);
CREATE INDEX projeto_competencia_competencia ON projeto_competencia(competencia_id);
CREATE INDEX estudante_idioma_idioma ON estudante_idioma(idioma_id);
CREATE INDEX estudante_topico_topico ON estudante_topico(topico_id);
