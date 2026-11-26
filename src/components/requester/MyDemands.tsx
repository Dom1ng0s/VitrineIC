import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { useCurrentRequester } from "@/lib/auth";
import { visibleToRequester } from "@/lib/interest";
import { useVitrine } from "@/lib/store";
import { ArrowIcon, ChevronIcon } from "@/components/app/Icons";
import { DemandExtras } from "@/components/app/DemandExtras";
import { PageHead } from "@/components/public/PageHead";
import { PAGE } from "@/components/public/layout";
import { paraExibicao } from "@/lib/datas";
import { closeDemand, deleteBriefing, uploadBriefing } from "@/lib/store";
import { Modal } from "@/components/app/Modal";
import { Input } from "./ui";
import type { Demand } from "@/types";
import { REQUESTER_KIND_LABEL } from "@/data/companies";

export function MyDemands({
  onNew,
  onEdit,
  onViewMatch,
}: {
  onNew: () => void;
  onEdit: (demand: Demand) => void;
  onViewMatch: (demandId: string) => void;
}) {
  const { demands, interests } = useVitrine();
  const requester = useCurrentRequester();
  const [selected, setSelected] = useState<string | null>(null);
  const [closing, setClosing] = useState<Demand | null>(null);
  const [closeReason, setCloseReason] = useState("");

  const mine = demands.filter((d) => d.company === requester);
  const openCount = mine.filter((d) => d.status === "aprovada" || d.status === "contato_liberado").length;
  const analysisCount = mine.filter((d) => d.status === "nova" || d.status === "em_analise").length;

  return (
    <main className={`${PAGE} pb-20`}>
      <PageHead
        eyebrow="Demandas"
        title="Minhas demandas."
        lead={`${mine.length} no total · ${openCount} publicadas · ${analysisCount} em análise`}
        aside={
          <button onClick={onNew} className="vt-btn vt-btn-primary self-start md:self-auto">
            Nova demanda <ArrowIcon />
          </button>
        }
      />

      <ul className="vt-card divide-y divide-navy/8 overflow-hidden">
        {mine.map((d) => {
          const open = selected === d.id;
          const published = d.status === "aprovada" || d.status === "contato_liberado";
          const visible = interests.filter((i) => i.demandId === d.id && visibleToRequester(i));
          const awaiting = visible.filter((i) => i.status === "aguardando_solicitante").length;
          const active = visible.some((i) => !i.status.startsWith("recusado_"));
          const canClose =
            !["cancelada", "encerrada"].includes(d.status) && (!active || d.status === "contato_liberado");
          const rejection = [...(d.statusHistory ?? [])]
            .reverse()
            .find((entry) => entry.status === "rejeitada")?.observation;
          return (
            <li key={d.id}>
              <button
                onClick={() => setSelected(open ? null : d.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-4 rounded-none! px-5 py-5 text-left transition-colors hover:bg-navy/[0.02] md:gap-6 md:px-6"
              >
                <span className="hidden w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/45 md:block">
                  {d.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-sans text-[15px] text-navy">{d.title}</span>
                  {d.requesterKind && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">
                      {REQUESTER_KIND_LABEL[d.requesterKind]}
                    </span>
                  )}
                  <span className="block font-sans text-[13px] text-navy/55">
                    Prazo {paraExibicao(d.deadline)} · {d.area}
                    {awaiting > 0 && <span className="text-red"> · {awaiting} aguardando você</span>}
                  </span>
                </span>
                <StatusBadge status={d.status} />
                <span className={`hidden text-navy/35 transition-transform sm:block ${open ? "rotate-90" : ""}`}>
                  <ChevronIcon />
                </span>
              </button>

              {open && (
                <div className="flex flex-col gap-4 border-t border-navy/8 bg-navy/[0.02] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6 md:pl-[166px]">
                  <div className="max-w-[560px]">
                    <p className="font-sans text-[13px] leading-[1.6] text-navy/65">
                      {published || d.status === "cancelada" || d.status === "encerrada"
                        ? d.description
                        : "A curadoria está validando o escopo. Depois de aprovada, a demanda aparece para os estudantes e recebe candidaturas e sugestões."}
                    </p>
                    {d.status === "rejeitada" && rejection && (
                      <p className="mt-2 font-sans text-[13px] text-red">Motivo: {rejection}</p>
                    )}
                    <DemandExtras demand={d} compact />
                    {d.briefing && (
                      <p className="mt-2 font-sans text-[13px] text-navy/65">
                        Briefing:{" "}
                        <a
                          className="underline underline-offset-2"
                          href={`/api/demands/${encodeURIComponent(d.id)}/briefing`}
                          download
                        >
                          {d.briefing.name}
                        </a>
                        {d.status === "nova" || d.status === "em_analise" ? (
                          <button
                            className="ml-3 text-red underline underline-offset-2"
                            onClick={() => void deleteBriefing(d.id)}
                          >
                            Remover
                          </button>
                        ) : null}
                      </p>
                    )}
                    {(d.status === "nova" || d.status === "em_analise") && (
                      <label htmlFor={`briefing-${d.id}`} className="mt-3 block font-sans text-xs text-navy/60">
                        Anexar briefing em PDF
                        <input
                          id={`briefing-${d.id}`}
                          aria-label="Anexar briefing em PDF"
                          type="file"
                          accept="application/pdf,.pdf"
                          className="mt-2 block w-full font-sans text-xs"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void uploadBriefing(d.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {d.status === "nova" && (
                      <button onClick={() => onEdit(d)} className="vt-btn vt-btn-secondary">
                        Editar
                      </button>
                    )}
                    {canClose && (
                      <button
                        onClick={() => {
                          setClosing(d);
                          setCloseReason("");
                        }}
                        className="vt-btn vt-btn-secondary"
                      >
                        {d.status === "contato_liberado" ? "Encerrar" : "Cancelar"}
                      </button>
                    )}
                    {published ? (
                      <button onClick={() => onViewMatch(d.id)} className="vt-btn vt-btn-secondary shrink-0">
                        {visible.length > 0 ? `Ver interessados (${visible.length})` : "Ver interessados"} <ArrowIcon />
                      </button>
                    ) : d.status === "nova" || d.status === "em_analise" ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">
                        Aguardando curadoria
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {closing && (
        <Modal
          eyebrow="Demanda"
          title={closing.status === "contato_liberado" ? "Encerrar demanda?" : "Cancelar demanda?"}
          onClose={() => setClosing(null)}
        >
          <p className="mb-5 font-sans text-sm text-navy/65">Esta ação tira a demanda das oportunidades abertas.</p>
          <Input label="Motivo (opcional)" value={closeReason} onChange={setCloseReason} textarea rows={3} />
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setClosing(null)} className="vt-btn vt-btn-secondary">
              Voltar
            </button>
            <button
              onClick={async () => {
                if (await closeDemand(closing.id, closeReason)) setClosing(null);
              }}
              className="vt-btn vt-btn-primary"
            >
              Confirmar
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
