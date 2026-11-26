import { useState } from "react";
import { sendMessage } from "@/lib/store";
import { Modal } from "./Modal";

export function ContactMessage({ interestId, recipient }: { interestId: string; recipient: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setSent(false);
        }}
        className="vt-btn vt-btn-secondary"
      >
        Enviar mensagem
      </button>
      {open && (
        <Modal eyebrow="Contato liberado" title={`Mensagem para ${recipient}`} onClose={() => setOpen(false)}>
          {sent ? (
            <div>
              <p role="status" className="font-sans text-sm text-navy/70">
                Mensagem enviada. A resposta aparecerá na sua caixa de entrada.
              </p>
              <button onClick={() => setOpen(false)} className="vt-btn vt-btn-primary mt-5">
                Fechar
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor={`contact-message-${interestId}`} className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">
                  Mensagem
                </span>
                <textarea
                  id={`contact-message-${interestId}`}
                  aria-label="Mensagem"
                  className="vt-input"
                  rows={5}
                  maxLength={5000}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </label>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setOpen(false)} className="vt-btn vt-btn-secondary">
                  Cancelar
                </button>
                <button
                  disabled={!content.trim()}
                  onClick={async () => {
                    if (await sendMessage(interestId, content.trim())) {
                      setContent("");
                      setSent(true);
                    }
                  }}
                  className="vt-btn vt-btn-primary"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
