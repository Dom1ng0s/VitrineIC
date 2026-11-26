/**
 * Tipos do sino das áreas logadas.
 *
 * Diferem das mensagens da caixa de entrada: são uma linha sobre o andamento
 * de uma vaga, uma vaga nova, uma mensagem ou alguém interessado, e levam à
 * tela relacionada.
 */
export type UpdateKind = "processo" | "vaga" | "estudantes" | "interesse" | "mensagem";

export interface Update {
  id: string;
  kind: UpdateKind;
  text: string;
  time: string;
  unread: boolean;
  /** Tela da área que o aviso abre ao ser clicado. */
  target: string;
}
