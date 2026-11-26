import { useState } from "react";
import { DEMAND_STATUS, KANBAN_COLS, StatusBadge } from "./StatusBadge";
import { SkillTag } from "./ui";
import { ClockIcon } from "@/components/app/Icons";
import { DemandExtras } from "@/components/app/DemandExtras";
import { StatusPill } from "@/components/app/StatusPill";
import { PageHead } from "@/components/public/PageHead";
import { PAGE } from "@/components/public/layout";
import { Modal } from "@/components/app/Modal";
import { Input } from "@/components/app/Field";
import { CommitteeOpinions } from "./CommitteeOpinions";
import { removeDemand, setDemandStatus } from "@/lib/store";
import { useSession } from "@/lib/auth";
import { canTriageTransition } from "@/lib/demand-status";
import { paraExibicao } from "@/lib/datas";
import { REQUESTER_KIND_LABEL } from "@/data/companies";
import { TERRACOTTA } from "@/styles/tokens";
import type { Demand, DemandStatus, RequesterKind } from "@/types";

/** Card do kanban: id, prioridade, título, empresa, skills e escopo. Clique abre as ações. */
export function TriageCard({
  demand,
  onStatus,
  onDragStart,
  onDelete,
  curatorFunction,
}: {
  demand: Demand;
  onStatus: (s: DemandStatus) => void;
  onDragStart: (id: string) => void;
  onDelete?: () => void;
  curatorFunction: "curador" | "coordenacao" | "comite";
}) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className="vt-card cursor-grab overflow-hidden active:cursor-grabbing"
      draggable={curatorFunction !== "comite"}
      onDragStart={() => onDragStart(demand.id)}
    >
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-col gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-mono text-[10px] whitespace-nowrap uppercase tracking-[0.08em] text-navy/45">
            {demand.id}
          </span>
          {demand.priority === "alta" && <StatusPill color={TERRACOTTA}>Alta</StatusPill>}
        </div>
        <p className="font-sans text-[15px] leading-[1.3] text-navy">{demand.title}</p>
        <p className="font-sans text-[13px] text-navy/55">{demand.company}</p>
        {demand.requesterKind && (
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/55">
            {REQUESTER_KIND_LABEL[demand.requesterKind]}
          </span>
        )}
        <div className="flex flex-wrap gap-1.5">
          {demand.skills.slice(0, 2).map((s) => (
            <SkillTag key={s}>{s}</SkillTag>
          ))}
          {demand.skills.length > 2 && (
            <span className="self-center font-mono text-[10px] text-navy/45">+{demand.skills.length - 2}</span>
          )}
        </div>
        <p className="flex w-full items-center gap-1.5 border-t border-navy/8 pt-3 font-sans text-[12px] text-navy/55">
          <ClockIcon />
          {demand.scope}
        </p>
      </button>

      {open && (
        <div className="border-t border-navy/8 bg-navy/[0.02] p-3">
          <p className="mb-3 px-1 font-sans text-[12px] leading-[1.55] text-navy/65">{demand.description}</p>
          <div className="mb-3 px-1">
            <DemandExtras demand={demand} compact />
          </div>
          {demand.briefing && (
            <a
              className="mb-3 block px-1 font-sans text-xs text-navy underline underline-offset-2"
              href={`/api/demands/${encodeURIComponent(demand.id)}/briefing`}
              download
            >
              Baixar briefing: {demand.briefing.name}
            </a>
          )}
          <div className="flex flex-col gap-1.5">
            {(["em_analise", "aprovada", "rejeitada"] as DemandStatus[]).map((s) => {
              const current = demand.status === s;
              const enabled = canTriageTransition(demand.status, s, curatorFunction);
              return (
                <button
                  key={s}
                  disabled={!enabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatus(s);
                  }}
                  className={`flex h-9 items-center justify-between border px-3 font-sans text-[12px] transition-colors ${
                    current ? "text-white" : "bg-white hover:bg-navy/[0.03]"
                  }`}
                  style={{
                    borderColor: `color-mix(in srgb, ${DEMAND_STATUS[s].color} 35%, transparent)`,
                    background: current ? DEMAND_STATUS[s].color : undefined,
                    color: current ? undefined : DEMAND_STATUS[s].color,
                  }}
                >
                  Mover para {DEMAND_STATUS[s].label.toLowerCase()}
                  {current && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}

            {(demand.statusHistory ?? []).length > 0 && (
              <div className="mt-3 border-t border-navy/10 pt-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">Histórico</p>
                {demand.statusHistory?.map((entry, index) => (
                  <p key={`${entry.changedAt}-${index}`} className="font-sans text-xs leading-6 text-navy/65">
                    {DEMAND_STATUS[entry.status]?.label ?? entry.status} · {paraExibicao(entry.changedAt)}
                    {entry.observation ? ` · ${entry.observation}` : ""}
                  </p>
                ))}
              </div>
            )}

            <CommitteeOpinions demandId={demand.id} />

            {demand.status === "rejeitada" && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="mt-1 flex h-9 items-center justify-center rounded-[10px] bg-terracotta px-3 font-sans text-[12px] text-white"
              >
                Excluir demanda
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function Triage({ demands }: { demands: Demand[] }) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const curatorFunction = useSession()?.account.curatorFunction ?? "comite";
  const [pendingRejection, setPendingRejection] = useState<string | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<Demand | null>(null);
  const [reason, setReason] = useState("");
  const [kind, setKind] = useState<RequesterKind | "todos">("todos");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = demands.filter((demand) => {
    if (kind !== "todos" && demand.requesterKind !== kind) return false;
    if (!q) return true;
    return (
      demand.title.toLowerCase().includes(q) ||
      demand.company.toLowerCase().includes(q) ||
      demand.id.toLowerCase().includes(q) ||
      demand.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const updateStatus = (id: string, status: DemandStatus) => {
    const demand = demands.find((item) => item.id === id);
    if (!demand || !canTriageTransition(demand.status, status, curatorFunction)) return;
    if (status === "rejeitada") {
      setPendingRejection(id);
      setReason("");
      return;
    }
    void setDemandStatus(id, status);
  };
  const deleteDemand = (id: string) => removeDemand(id);

  const handleDrop = (e: React.DragEvent, status: DemandStatus) => {
    e.preventDefault();
    if (draggedId) {
      updateStatus(draggedId, status);
      setDraggedId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const [dropTarget, setDropTarget] = useState<DemandStatus | null>(null);
  const count = (col: DemandStatus) => shown.filter((d) => d.status === col).length;

  return (
    <main className={`${PAGE} pb-20`}>
      <PageHead eyebrow="Curadoria" title="Triagem de demandas." />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Filtrar pelo tipo de solicitante">
          <button
            className={`vt-pill ${kind === "todos" ? "vt-pill-selected" : ""}`}
            aria-pressed={kind === "todos"}
            onClick={() => setKind("todos")}
          >
            Todos
          </button>
          {(Object.entries(REQUESTER_KIND_LABEL) as [RequesterKind, string][]).map(([code, label]) => (
            <button
              key={code}
              className={`vt-pill ${kind === code ? "vt-pill-selected" : ""}`}
              aria-pressed={kind === code}
              onClick={() => setKind(code)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          aria-label="Buscar demandas por título, organização, protocolo ou tecnologia"
          placeholder="Buscar demanda..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="vt-input max-w-[260px] py-2! text-[13px]!"
        />
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
        <div className="grid min-w-[1100px] grid-cols-5 gap-3">
          {KANBAN_COLS.map((col) => (
            <div key={col} className="vt-card flex items-center justify-between px-4 py-4">
              <StatusBadge status={col} />
              <span className="font-display text-[28px] font-medium tracking-[-0.02em] text-navy">
                {String(count(col)).padStart(2, "0")}
              </span>
            </div>
          ))}

          {KANBAN_COLS.map((col) => (
            <section
              key={col}
              aria-label={`Coluna ${DEMAND_STATUS[col].label}`}
              onDrop={(e) => {
                handleDrop(e, col);
                setDropTarget(null);
              }}
              onDragOver={handleDragOver}
              onDragEnter={() => {
                const dragged = demands.find((item) => item.id === draggedId);
                setDropTarget(dragged && canTriageTransition(dragged.status, col, curatorFunction) ? col : null);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
              }}
              className={`flex min-h-[460px] flex-col gap-3 rounded-2xl p-3 transition-colors ${
                dropTarget === col ? "bg-navy/[0.09]" : "bg-navy/[0.045]"
              }`}
            >
              <div className="flex items-center justify-between px-1 pt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/55">
                <span>{DEMAND_STATUS[col].label}</span>
                <span>{count(col)}</span>
              </div>
              {shown
                .filter((d) => d.status === col)
                .map((d) => (
                  <TriageCard
                    key={d.id}
                    demand={d}
                    onStatus={(s) => updateStatus(d.id, s)}
                    onDragStart={(id) => setDraggedId(id)}
                    onDelete={curatorFunction === "coordenacao" ? () => setPendingDeletion(d) : undefined}
                    curatorFunction={curatorFunction}
                  />
                ))}
              {count(col) === 0 && (
                <div className="pointer-events-none grid h-24 place-items-center rounded-xl border border-dashed border-navy/20 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/40">
                  Solte aqui
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      {pendingDeletion && (
        <Modal eyebrow="Triagem" title="Excluir demanda?" onClose={() => setPendingDeletion(null)}>
          <p className="font-sans text-sm leading-[1.6] text-navy/70">
            Tem certeza que deseja excluir permanentemente <strong>{pendingDeletion.title}</strong> (
            {pendingDeletion.id}
            )? Esta ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setPendingDeletion(null)} className="vt-btn vt-btn-secondary">
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                if (await deleteDemand(pendingDeletion.id)) setPendingDeletion(null);
              }}
              className="vt-btn vt-btn-danger"
            >
              Excluir demanda
            </button>
          </div>
        </Modal>
      )}
      {pendingRejection && (
        <Modal eyebrow="Triagem" title="Rejeitar demanda?" onClose={() => setPendingRejection(null)}>
          <Input label="Motivo da rejeição" textarea rows={3} value={reason} onChange={setReason} />
          <p className="mt-2 font-sans text-xs text-navy/55">O solicitante verá este motivo.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setPendingRejection(null)} className="vt-btn vt-btn-secondary">
              Voltar
            </button>
            <button
              disabled={!reason.trim()}
              onClick={async () => {
                if (await setDemandStatus(pendingRejection, "rejeitada", reason.trim())) setPendingRejection(null);
              }}
              className="vt-btn vt-btn-primary"
            >
              Rejeitar
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
