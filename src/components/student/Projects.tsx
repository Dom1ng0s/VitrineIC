import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Select } from "./ui";
import { ArrowIcon, ChevronIcon, PlusIcon } from "@/components/app/Icons";
import { InProjectBadge } from "@/components/app/InProjectBadge";
import { Modal } from "@/components/app/Modal";
import { ProjectCover } from "@/components/app/ProjectCover";
import { StatusPill } from "@/components/app/StatusPill";
import { PageHead } from "@/components/public/PageHead";
import { PAGE } from "@/components/public/layout";
import { AREA_OPTIONS } from "@/data/demand-options";
import { LIMITE_DA_CAPA, MIMES_DE_CAPA, codigoDeProjeto } from "@/lib/projeto";
import {
  addProject,
  deleteProject,
  deleteProjectCover,
  setInProject,
  updateProject,
  uploadProjectCover,
  useVitrine,
} from "@/lib/store";
import { required, useValidation } from "@/lib/validate";
import { MOSS, OCHRE, SLATE } from "@/styles/tokens";

export interface MyProject {
  id: string;
  title: string;
  description: string;
  phase: string;
  link?: string;
  tools?: string;
  year?: string;
  area?: string;
  cover?: string | null;
}

const PHASES = ["Idealização", "Codificação", "Revisão", "Publicado"];

const PHASE_COLOR: Record<string, string> = {
  Idealização: SLATE,
  Codificação: OCHRE,
  Revisão: OCHRE,
  Publicado: MOSS,
};

const PHASE_STATUS: Record<string, import("@/types").ProjectStatus> = {
  Idealização: "ideation",
  Codificação: "coding",
  Revisão: "review",
  Publicado: "done",
};

export function toMyProject(project: import("@/types").StudentProject): MyProject {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    phase: Object.keys(PHASE_STATUS).find((k) => PHASE_STATUS[k] === project.status) ?? "Idealização",
    tools: project.stack.join(", "),
    link: project.link,
    year: project.year,
    area: project.area,
    cover: project.cover,
  };
}

/**
 * Selo "em projeto": o estudante avisa que já está alocado. É o único dado
 * que o site mantém depois que um contato é liberado.
 */
function InProjectToggle({ studentId }: { studentId: string }) {
  const { inProject } = useVitrine();
  const on = !!inProject[studentId];

  return (
    <section className="vt-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <p className="font-sans text-[15px] text-navy">Estou em projeto</p>
          {on && <InProjectBadge />}
        </div>
        <p className="font-sans text-[13px] text-navy/55">
          O selo aparece no seu perfil público e para quem consulta a vitrine.
        </p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => setInProject(studentId, !on)}
        className={`vt-btn shrink-0 self-start sm:self-auto ${on ? "vt-btn-secondary" : "vt-btn-primary"}`}
      >
        {on ? "Remover selo" : "Marcar em projeto"}
      </button>
    </section>
  );
}

const ACEITOS = MIMES_DE_CAPA.join(",");

/**
 * Capa do projeto no formulário. Em projeto novo a imagem fica retida até o
 * salvar, porque o envio precisa do id que o servidor devolve.
 */
function CoverField({
  project,
  file,
  onPick,
}: {
  project: MyProject | null;
  file: File | null;
  onPick: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState("");
  // O endereço da prévia nasce no evento, não na renderização nem num efeito:
  // em StrictMode o blob criado em render ou efeito era revogado logo depois,
  // e a prévia aparecia vazia.
  const [previa, setPrevia] = useState<string | null>(null);
  const previaRef = useRef<string | null>(null);
  const trocarPrevia = (nova: string | null) => {
    if (previaRef.current) URL.revokeObjectURL(previaRef.current);
    previaRef.current = nova;
    setPrevia(nova);
  };
  useEffect(() => () => trocarPrevia(null), []);

  const escolher = (escolhido: File | undefined) => {
    if (!escolhido) return;
    if (!MIMES_DE_CAPA.includes(escolhido.type as (typeof MIMES_DE_CAPA)[number])) {
      setErro("Envie uma imagem PNG, JPEG ou WebP.");
      return;
    }
    if (escolhido.size > LIMITE_DA_CAPA) {
      setErro("A imagem passa de 5 MB.");
      return;
    }
    setErro("");
    trocarPrevia(URL.createObjectURL(escolhido));
    onPick(escolhido);
  };

  const descartar = () => {
    trocarPrevia(null);
    onPick(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">Capa</span>
      {previa ? (
        <img src={previa} alt="Prévia da capa escolhida" className="h-32 w-full rounded-xl object-cover" />
      ) : project ? (
        <ProjectCover id={project.id} title={project.title} cover={project.cover} className="h-32 w-full rounded-xl" />
      ) : (
        <div className="grid h-32 w-full place-items-center rounded-xl border border-dashed border-navy/20 font-sans text-[13px] text-navy/55">
          Sem imagem — a capa usa o degradê do projeto.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} className="vt-btn vt-btn-secondary">
          {project?.cover || file ? "Trocar imagem" : "Enviar imagem"}
        </button>
        {file && (
          <button
            type="button"
            onClick={descartar}
            className="rounded-[10px] px-3 py-2 font-sans text-sm text-navy/65 transition-colors hover:text-navy"
          >
            Descartar escolha
          </button>
        )}
        {!file && project?.cover && (
          <button
            type="button"
            onClick={() => void deleteProjectCover(project.id)}
            className="rounded-[10px] px-3 py-2 font-sans text-sm text-navy/65 transition-colors hover:text-navy"
          >
            Remover capa
          </button>
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">PNG, JPEG ou WebP · 5 MB</span>
      </div>
      {erro && <p className="vt-field-error font-sans text-[13px]">{erro}</p>}
      <input
        ref={inputRef}
        type="file"
        aria-label="Imagem de capa do projeto"
        accept={ACEITOS}
        className="hidden"
        onChange={(e) => {
          const escolhido = e.target.files?.[0];
          e.target.value = "";
          escolher(escolhido);
        }}
      />
    </div>
  );
}

export function Projects({ projects, studentId }: { projects: MyProject[]; studentId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<MyProject>>({});
  const [opened, setOpened] = useState<MyProject | null>(null);
  const [editing, setEditing] = useState<MyProject | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { validate, field, reset } = useValidation<"title" | "phase" | "description" | "year">(() => ({
    title: required(form.title ?? "", "Dê um nome ao projeto."),
    phase: required(form.phase ?? "", "Escolha a etapa."),
    description: required(form.description ?? "", "Descreva o projeto."),
    // Vazio vale: o ano volta para o do projeto ou o corrente.
    year: !form.year || /^\d{4}$/.test(form.year) ? null : "Informe o ano com quatro dígitos.",
  }));

  // O banco guarda a área como texto livre e tem valores anteriores ao
  // vocabulário das demandas. Sem isso o select cairia no vazio e o salvar
  // apagaria a área do projeto.
  const areaOptions = useMemo(() => {
    const atual = form.area?.trim();
    return atual && !AREA_OPTIONS.includes(atual) ? [atual, ...AREA_OPTIONS] : AREA_OPTIONS;
  }, [form.area]);

  const close = () => {
    setIsAdding(false);
    setForm({});
    setEditing(null);
    setCoverFile(null);
    reset();
  };

  const saveProject = async () => {
    if (!validate()) return;
    const payload = {
      title: form.title!,
      description: form.description!,
      status: PHASE_STATUS[form.phase!],
      stack: (form.tools ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      year: form.year || editing?.year || String(new Date().getFullYear()),
      area: form.area ?? editing?.area ?? "",
      link: form.link ?? "",
    };
    const id = editing
      ? (await updateProject(editing.id, payload))
        ? editing.id
        : null
      : (await addProject(payload))?.id;
    if (!id) return;
    if (coverFile && !(await uploadProjectCover(id, coverFile))) return;
    close();
  };

  const startEdit = (project: MyProject) => {
    setForm(project);
    setEditing(project);
    setOpened(null);
    setIsAdding(true);
  };

  return (
    <main className={`${PAGE} pb-20`}>
      <PageHead
        eyebrow="Portfólio"
        title="Meus projetos."
        aside={
          <button onClick={() => setIsAdding(true)} className="vt-btn vt-btn-primary self-start md:self-auto">
            <PlusIcon /> Novo projeto <ArrowIcon />
          </button>
        }
      />

      <InProjectToggle studentId={studentId} />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center font-sans text-sm text-navy/55">
          Você ainda não publicou nenhum projeto.
        </div>
      ) : (
        <ul className="vt-card divide-y divide-navy/8 overflow-hidden">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setOpened(p)}
                className="flex w-full items-center gap-4 rounded-none! px-5 py-5 text-left transition-colors hover:bg-navy/[0.03] md:gap-6 md:px-6"
              >
                <ProjectCover
                  id={p.id}
                  title={p.title}
                  cover={p.cover}
                  semLegenda
                  className="hidden h-11 w-16 shrink-0 rounded-lg sm:block"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[15px] text-navy">{p.title}</p>
                  <p className="truncate font-sans text-[13px] text-navy/55">
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-navy/45">
                      {codigoDeProjeto(p.id)}
                    </span>
                    {" · "}
                    {p.area || p.tools || p.description}
                  </p>
                </div>
                <StatusPill color={PHASE_COLOR[p.phase] ?? SLATE}>{p.phase}</StatusPill>
                <span className="grid size-8 shrink-0 place-items-center text-navy/40">
                  <ChevronIcon />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {opened && (
        <Modal eyebrow={opened.phase} title={opened.title} onClose={() => setOpened(null)}>
          <div className="flex flex-col gap-6">
            <ProjectCover id={opened.id} title={opened.title} cover={opened.cover} className="h-36 w-full rounded-xl" />
            <p className="font-sans text-[15px] leading-[1.6] text-navy/75">{opened.description}</p>
            {opened.tools && (
              <div className="flex flex-wrap gap-1.5">
                {opened.tools
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <span key={t} className="vt-pill">
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="mt-8 flex items-center justify-end gap-3">
            {confirmDelete ? (
              <>
                <span className="font-sans text-sm text-red">Excluir este projeto?</span>
                <button onClick={() => setConfirmDelete(false)} className="vt-btn vt-btn-secondary">
                  Voltar
                </button>
                <button
                  onClick={async () => {
                    if (await deleteProject(opened.id)) {
                      setOpened(null);
                      setConfirmDelete(false);
                    }
                  }}
                  className="vt-btn vt-btn-primary"
                >
                  Confirmar exclusão
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setConfirmDelete(true)} className="vt-btn vt-btn-secondary">
                  Excluir
                </button>
                <button onClick={() => startEdit(opened)} className="vt-btn vt-btn-secondary">
                  Editar e mudar etapa
                </button>
              </>
            )}
            <button
              onClick={() => {
                setOpened(null);
                setConfirmDelete(false);
              }}
              className="rounded-[10px] px-3 py-2 font-sans text-sm text-navy/65 transition-colors hover:text-navy"
            >
              Fechar
            </button>
            {opened.link && (
              <a href={opened.link} target="_blank" rel="noreferrer" className="vt-btn vt-btn-primary">
                Abrir link <ArrowIcon />
              </a>
            )}
          </div>
        </Modal>
      )}

      {isAdding && (
        <Modal
          eyebrow={editing ? "Edição" : "Cadastro"}
          title={editing ? "Editar projeto." : "Novo projeto."}
          onClose={close}
        >
          <div className="flex flex-col gap-5">
            <Input
              label="Título"
              placeholder="Nome do projeto"
              value={form.title || ""}
              onChange={(v) => setForm({ ...form, title: v })}
              {...field("title")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                {...field("phase")}
                label="Etapa"
                options={PHASES}
                value={form.phase || ""}
                onChange={(v) => setForm({ ...form, phase: v })}
              />
              <Select
                label="Área"
                placeholder="Sem área definida"
                options={areaOptions}
                value={form.area || ""}
                onChange={(v) => setForm({ ...form, area: v })}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                {...field("year")}
                label="Ano"
                placeholder={String(new Date().getFullYear())}
                value={form.year || ""}
                onChange={(v) => setForm({ ...form, year: v.replace(/\D/g, "").slice(0, 4) })}
                mono
              />
              <Input
                label="Link (opcional)"
                placeholder="https://github.com/..."
                value={form.link || ""}
                onChange={(v) => setForm({ ...form, link: v })}
                mono
              />
            </div>
            <Input
              label="Descrição"
              placeholder="O que o projeto resolve e como"
              textarea
              rows={4}
              value={form.description || ""}
              onChange={(v) => setForm({ ...form, description: v })}
              {...field("description")}
            />
            <Input
              label="Tecnologias"
              placeholder="React, Python..."
              value={form.tools || ""}
              onChange={(v) => setForm({ ...form, tools: v })}
            />
            <CoverField project={editing} file={coverFile} onPick={setCoverFile} />
          </div>
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={close}
              className="rounded-[10px] px-3 py-2 font-sans text-sm text-navy/65 transition-colors hover:text-navy"
            >
              Cancelar
            </button>
            <button onClick={saveProject} className="vt-btn vt-btn-primary">
              {editing ? "Salvar projeto" : "Publicar projeto"} <ArrowIcon />
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
