-- Capa enviada pelo estudante para o projeto.
--
-- Tabela à parte, e não colunas em projeto_estudante, porque o blob não pode
-- entrar na subconsulta de projetos de SQL_ESTUDANTE: ali só se lê o instante
-- do envio, que vira a versão da URL pública da imagem.

CREATE TABLE projeto_capa (
  projeto_id    text PRIMARY KEY REFERENCES projeto_estudante(id) ON DELETE CASCADE,
  mime          text NOT NULL CHECK (mime IN ('image/png', 'image/jpeg', 'image/webp')),
  conteudo      bytea NOT NULL,
  tamanho_bytes integer NOT NULL CHECK (tamanho_bytes > 0),
  enviada_em    timestamptz NOT NULL DEFAULT now()
);
