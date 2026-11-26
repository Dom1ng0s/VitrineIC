import { useEffect, useId, useRef, type ReactNode } from "react";
import { CloseIcon } from "./Icons";
import { Eyebrow } from "@/components/public/Eyebrow";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal branco centralizado sobre fundo navy desfocado, no mesmo padrão do
 * modal de acesso. Fecha pelo X, pelo Esc ou clicando fora, com foco preso e
 * retorno ao elemento de origem ao fechar.
 */
export function Modal({
  eyebrow,
  title,
  onClose,
  children,
  width = "max-w-[520px]",
}: {
  eyebrow: string;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // O efeito abaixo roda uma vez só. Se dependesse de `onClose`, toda tecla
  // digitada em um campo recriaria a função na tela de origem, remontaria o
  // efeito e devolveria o foco ao botão de fechar.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add("modal-open");
    // O X é o primeiro focável em ordem de DOM; o foco inicial vai para o
    // conteúdo, não para ele.
    const first = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).find(
      (el) => !el.hasAttribute("data-modal-close"),
    );
    (first ?? dialogRef.current)?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar janela"
        onClick={onClose}
        className="fixed inset-0 bg-navy/55 backdrop-blur-[2px]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 m-auto w-full ${width} rounded-3xl bg-white p-6 shadow-[0_40px_80px_-24px_rgba(11,37,69,0.45)] sm:p-8`}
      >
        <button
          type="button"
          data-modal-close
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-navy/55 transition-colors hover:bg-navy/5 hover:text-navy"
        >
          <CloseIcon />
        </button>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={titleId} className="mt-3 mb-6 font-display text-2xl font-medium tracking-[-0.02em] text-navy">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
