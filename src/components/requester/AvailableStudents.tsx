import { useState } from "react";
import { LANGUAGE_LEVELS } from "@/data/languages";
import { useCurrentRequester } from "@/lib/auth";
import { isProfileVisible } from "@/lib/profile";
import { createInterest, findActiveInterest, useVitrine } from "@/lib/store";
import { Avatar } from "@/components/app/Avatar";
import { ArrowIcon } from "@/components/app/Icons";
import { InProjectBadge } from "@/components/app/InProjectBadge";
import { InterestStatusPill } from "@/components/app/InterestStatusPill";
import { Modal } from "@/components/app/Modal";
import { BackButton } from "@/components/public/BackButton";
import { Eyebrow } from "@/components/public/Eyebrow";
import { PageHead } from "@/components/public/PageHead";
import { PAGE } from "@/components/public/layout";
import type { ProjectStatus, Student } from "@/types";

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ideation: "Ideação",
  coding: "Em desenvolvimento",
  review: "Em revisão",
  done: "Concluído",
};

function externalHref(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function StudentCard({ student, inProject, onClick }: { student: Student; inProject: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="vt-card vt-card-interactive flex flex-col gap-4 p-5 text-left">
      <div className="flex w-full items-start gap-3">
        <Avatar name={student.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-medium leading-[1.25] tracking-[-0.01em] text-navy">{student.name}</p>
          <p className="mt-0.5 font-sans text-[13px] text-navy/55">
            {student.course} · {student.semester}
          </p>
        </div>
        {inProject && <InProjectBadge />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {student.skills.slice(0, 3).map((s) => (
          <span key={s} className="vt-pill">
            {s}
          </span>
        ))}
        {student.skills.length > 3 && (
          <span className="self-center font-mono text-[10px] text-navy/45">+{student.skills.length - 3}</span>
        )}
      </div>
      <span className="mt-auto flex items-center gap-1.5 border-t border-navy/8 pt-4 font-sans text-[13px] text-navy/65">
        Ver perfil <ArrowIcon />
      </span>
    </button>
  );
}

/**
 * Vitrine de estudantes vista pelo solicitante. Daqui ele convida direto:
 * o convite vira um interesse que espera o aceite do estudante.
 */
export function AvailableStudents() {
  const { demands, interests, inProject, students } = useVitrine();
  const requester = useCurrentRequester();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const myOpenDemands = demands.filter(
    (d) => d.company === requester && (d.status === "aprovada" || d.status === "contato_liberado"),
  );
  const demand = myOpenDemands.find((d) => d.id === selectedDemand);
  const existing = demand && selectedStudent ? findActiveInterest(interests, demand.id, selectedStudent.id) : undefined;

  const closeOffer = () => {
    setShowOfferModal(false);
    setSelectedDemand("");
    setMessage("");
    setSent(false);
  };

  if (selectedStudent) {
    const links = [
      { label: "GitHub", value: selectedStudent.github },
      { label: "LinkedIn", value: selectedStudent.linkedin },
      { label: "Site", value: selectedStudent.site },
      { label: "Lattes", value: selectedStudent.lattes },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value?.trim()));

    return (
      <main className={`${PAGE} pt-8 pb-20`}>
        <BackButton label="Voltar para estudantes disponíveis" onClick={() => setSelectedStudent(null)} />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="flex flex-col gap-6">
            <div className="vt-card flex flex-col p-7">
              <Avatar name={selectedStudent.name} size="xl" />
              <h1 className="mt-6 font-display text-[22px] font-medium tracking-[-0.01em] text-navy">
                {selectedStudent.name}
              </h1>
              <p className="mt-1 font-sans text-sm text-navy/60">
                {[selectedStudent.course, selectedStudent.semester].filter(Boolean).join(" · ")}
              </p>
              {inProject[selectedStudent.id] && (
                <div className="mt-3">
                  <InProjectBadge />
                </div>
              )}
              <button onClick={() => setShowOfferModal(true)} className="vt-btn vt-btn-primary mt-6 w-full">
                Convidar <ArrowIcon />
              </button>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/55">
                Contato liberado quando o estudante aceitar
              </p>
            </div>

            <div className="vt-card flex flex-col gap-4 p-7">
              <Eyebrow>Competências técnicas</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skills.map((s) => (
                  <span key={s} className="vt-pill">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-2">
                <Eyebrow>Idiomas</Eyebrow>
              </div>
              {selectedStudent.languages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.languages.map((lang) => (
                    <span key={lang.name} className="vt-pill">
                      {lang.name} ({LANGUAGE_LEVELS[lang.level - 1]})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-xs text-navy/50">Nenhum idioma informado.</p>
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <section className="vt-card p-7">
              <Eyebrow>Sobre</Eyebrow>
              <p className="mt-4 font-sans text-[15px] leading-[1.6] text-navy/75">
                {selectedStudent.bio || "Este estudante ainda não escreveu uma apresentação."}
              </p>
              {links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {links.map((item) => (
                    <a
                      key={item.label}
                      href={externalHref(item.value)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-navy/65 underline underline-offset-4 hover:text-navy"
                    >
                      {item.label}: {item.value}
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section className="vt-card p-7">
              <Eyebrow>Projetos e experiências</Eyebrow>
              {selectedStudent.projects.length > 0 ? (
                <div className="mt-2 flex flex-col divide-y divide-navy/8">
                  {selectedStudent.projects.map((p) => (
                    <div key={p.id} className="py-5">
                      <p
                        className={`font-mono text-[10px] uppercase tracking-[0.08em] ${p.status === "done" ? "text-navy/55" : "text-red"}`}
                      >
                        {PROJECT_STATUS_LABEL[p.status]} ({p.year}){p.area ? ` · ${p.area}` : ""}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-medium text-navy">{p.title}</h3>
                      <p className="mt-1 font-sans text-sm leading-[1.6] text-navy/65">{p.description}</p>
                      {p.stack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.stack.map((tech) => (
                            <span key={tech} className="vt-pill">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {p.link && (
                        <a
                          href={externalHref(p.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block font-mono text-[11px] text-navy/65 underline underline-offset-4 hover:text-navy"
                        >
                          Ver repositório ou demonstração
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 font-sans text-sm text-navy/55">Nenhum projeto cadastrado na vitrine ainda.</p>
              )}
            </section>
          </div>
        </div>

        {showOfferModal && (
          <Modal eyebrow="Convite" title={sent ? "Convite enviado." : "Convidar estudante."} onClose={closeOffer}>
            {sent ? (
              <>
                <p className="font-sans text-sm leading-[1.6] text-navy/65">
                  {selectedStudent.name} recebe o convite na área dele. O contato é liberado para os dois lados assim
                  que ele aceitar; você acompanha em Interessados.
                </p>
                <button onClick={closeOffer} className="vt-btn vt-btn-primary mt-6 w-full">
                  Fechar
                </button>
              </>
            ) : (
              <>
                <p className="mb-6 font-sans text-sm leading-[1.6] text-navy/65">
                  Escolha para qual das suas demandas abertas você quer convidar este estudante.
                </p>
                <label
                  htmlFor="convite-demanda"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65"
                >
                  Demanda
                </label>
                <select
                  id="convite-demanda"
                  className="vt-input"
                  value={selectedDemand}
                  onChange={(event) => setSelectedDemand(event.target.value)}
                >
                  <option value="">Selecione uma demanda</option>
                  {myOpenDemands.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="convite-mensagem"
                  className="mt-5 mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65"
                >
                  Mensagem (opcional)
                </label>
                <textarea
                  id="convite-mensagem"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="O que chamou sua atenção no perfil dele..."
                  className="vt-input"
                />
                {existing ? (
                  <div className="mt-6 flex items-center gap-3">
                    <InterestStatusPill status={existing.status} viewer="solicitante" origin={existing.origin} />
                    <span className="font-sans text-xs text-navy/55">
                      Já existe um interesse com este estudante nesta demanda.
                    </span>
                  </div>
                ) : (
                  <button
                    disabled={!demand}
                    onClick={async () => {
                      if (!demand) return;
                      if (!(await createInterest(demand.id, selectedStudent.id, "convite", message))) return;
                      setSent(true);
                    }}
                    className="vt-btn vt-btn-primary mt-6 w-full"
                  >
                    Enviar convite <ArrowIcon />
                  </button>
                )}
              </>
            )}
          </Modal>
        )}
      </main>
    );
  }

  return (
    <main className={`${PAGE} pb-20`}>
      <PageHead
        eyebrow="Talentos"
        title="Estudantes disponíveis."
        lead="Consulte os perfis e convide quem combina com as suas demandas. O contato é liberado quando o estudante aceitar."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {students
          .filter(isProfileVisible)
          .slice(0, 10)
          .map((s) => (
            <StudentCard key={s.id} student={s} inProject={!!inProject[s.id]} onClick={() => setSelectedStudent(s)} />
          ))}
      </div>
    </main>
  );
}
