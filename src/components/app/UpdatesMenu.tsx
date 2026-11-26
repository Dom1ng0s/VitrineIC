import { useEffect, useRef, useState } from "react";
import { BellIcon } from "./Icons";
import type { Update, UpdateKind } from "@/data/updates";
import { useSession } from "@/lib/auth";
import { comoDecorrido } from "@/lib/datas";
import { useVitrine, markRead, markAllRead } from "@/lib/store";
import type { Notification } from "@/types/api";
import type { Role } from "@/types";

const KIND_LABEL: Record<UpdateKind, string> = {
  processo: "Processo",
  vaga: "Demanda",
  estudantes: "Novos estudantes",
  interesse: "Interesse",
  mensagem: "Mensagem",
};

function classify(n: Notification, role?: Role): { kind: UpdateKind; target: string } {
  if (n.type === "MENSAGEM") return { kind: "mensagem", target: "inbox" };
  if (n.interestId) {
    return {
      kind: "interesse",
      target: role === "requester" ? "matches" : "interests",
    };
  }
  if (n.demandId) {
    return {
      kind: "vaga",
      target: role === "requester" ? "dashboard" : role === "student" ? "opportunities" : "triage",
    };
  }
  return { kind: "processo", target: "inbox" };
}

/**
 * Sino das áreas logadas: abre uma lista curta de avisos (andamento, demandas,
 * interesses e mensagens). Cada aviso marca-se como lido e leva à tela dele.
 */
export function UpdatesMenu({ onOpen }: { onOpen: (target: string) => void }) {
  const { notifications } = useVitrine();
  const role = useSession()?.account.role;
  const updates: Update[] = notifications.map((n) => {
    const { kind, target } = classify(n, role);
    return {
      id: n.id,
      kind,
      text: n.project || n.content,
      time: comoDecorrido(n.time),
      unread: n.unread,
      target,
    };
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = updates.filter((u) => u.unread).length;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const select = async (update: Update) => {
    if (!(await markRead(update.id))) return;
    setOpen(false);
    onOpen(update.target);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notificações"
        aria-expanded={open}
        className={`relative grid size-8 place-items-center transition-colors hover:text-navy ${open ? "text-navy" : "text-navy/65"}`}
      >
        <BellIcon />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red" />}
      </button>

      {open && (
        <div className="absolute top-11 -right-12 w-[min(360px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-[0_12px_40px_rgba(11,37,69,0.16)] sm:right-0">
          <div className="flex items-center justify-between gap-3 border-b border-navy/8 px-5 py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">
              Notificações{unread > 0 && ` · ${unread} novas`}
            </span>
            <button
              onClick={() => void markAllRead()}
              disabled={unread === 0}
              className="font-sans text-xs text-navy/55 underline underline-offset-4 transition-colors hover:text-navy disabled:no-underline disabled:opacity-40"
            >
              Marcar como lidas
            </button>
          </div>
          <ul className="max-h-[360px] divide-y divide-navy/8 overflow-y-auto">
            {updates.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => select(u)}
                  className="flex w-full items-start gap-3 rounded-none! px-5 py-4 text-left transition-colors hover:bg-navy/[0.03]"
                >
                  <span className={`mt-[7px] size-1.5 shrink-0 rounded-full ${u.unread ? "bg-red" : "bg-navy/15"}`} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-sans text-[13px] leading-[1.45] text-navy">{u.text}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/45">
                      {KIND_LABEL[u.kind]} · {u.time}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
