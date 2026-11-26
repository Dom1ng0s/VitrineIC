# Estado atual

Atualizado em 26/11/2026 após o fechamento de todas as fases (0 a 7) do
[docs/plano-de-completude.md](../docs/plano-de-completude.md). A referência de
execução, persistência, segurança e endpoints é [docs/backend.md](../docs/backend.md).

## Maturidade por fluxo

| Fluxo                                                                 | Estado                                                                                                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticação, sessão, recuperação e confirmação de e-mail             | **Funcional** — scrypt, cookie HttpOnly, CSRF, bloqueio por conta e rate limit distribuído em PostgreSQL                                                                                  |
| Persistência                                                          | **Funcional** — PostgreSQL em 3FN, migrações com checksum e `pg_advisory_lock` no boot                                                                                                    |
| Triagem, papéis da curadoria e pareceres                              | **Funcional** — `curador`, `coordenacao` e `comite`, transições compartilhadas, equipe e pareceres                                                                                        |
| Ranking e matchmaking                                                 | **Funcional** — score unificado (nível, área, disponibilidade, obrigatória/desejável) servido por `/api/demands/:id/ranking`; 409 em sugestão duplicada                                   |
| Interesses (candidatar, convidar, sugerir, aceitar, recusar, retirar) | **Funcional** — aceite duplo no servidor, retirada de candidatura antes da resposta, contato e portfólio só após aceite                                                                   |
| Demandas (criar, editar, cancelar, encerrar, briefing)                | **Funcional** — wizard acessível como `<form>`, todos os campos exibidos, anexo PDF                                                                                                       |
| Projetos do estudante                                                 | **Funcional** — criar, editar, mudar etapa e excluir                                                                                                                                      |
| Catálogo público, diretório e impacto (ACE1)                          | **Funcional** — rotas por URL, busca/paginação, metas da tabela `meta_indicador` e período derivado do banco                                                                              |
| Notificações e mensagens                                              | **Funcional** — sino tipado por evento e mensagens iniciáveis após o aceite duplo                                                                                                         |
| Acessibilidade                                                        | **Funcional** — `jsx-a11y` elevado para `"error"` em `eslint.config.js` com zero erros                                                                                                    |
| Publicação e operação                                                 | **Pronto** — `Dockerfile` e `render.yaml` para PostgreSQL, `trustProxy`, CSP, `Permissions-Policy`, `/api/health`, `/api/ready`, `/api/metrics`, `X-Request-Id` e `scripts/pg-backup.mjs` |

## Pauta da próxima reunião

Registrada a partir das decisões de produto da Fase 5:

- **Coluna `estudante.certificados`**: decidir se entra no formulário/perfil do estudante ou se será removida em migração futura.
- **Caixinhas de contexto no matchmaking**: decidir se passam a compor o peso do algoritmo de score.
- **Confirmação de e-mail**: desligada em produção (`MAIL_MODE=disabled`),
  porque entregar e-mail exige domínio verificado. Enquanto estiver assim, a
  recuperação de senha não funciona. Ver a seção de e-mail em
  [docs/railway.md](../docs/railway.md).
