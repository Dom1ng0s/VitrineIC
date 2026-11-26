import { useState } from "react";
import { allProjects, useVitrine } from "@/lib/store";
import { isProfileVisible } from "@/lib/profile";
import { INSTITUTION } from "@/data/institution";
import { PageHead } from "./PageHead";
import { ProjectCard } from "./ProjectCard";
import { PAGE } from "./layout";

const ALL = "Todas";
const PAGE_SIZE = 9;

/** Dois dígitos, como no contador do Figma ("06 de 12 projetos"). */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Catálogo público de projetos — a vitrine que o visitante vê sem login.
 *
 * Monta-se a partir de `allProjects`, derivado dos estudantes do store, para
 * não criar outra base de projetos. Estudante sem perfil visível fica de fora.
 */
export function ProjectsCatalog({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [area, setArea] = useState(ALL);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { students } = useVitrine();
  const projects = allProjects(students.filter(isProfileVisible));
  const areas = [ALL, ...Array.from(new Set(projects.map((p) => p.area).filter(Boolean)))];
  const q = query.trim().toLowerCase();
  const shown = projects.filter((p) => {
    if (area !== ALL && p.area !== area) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.student.name.toLowerCase().includes(q) ||
      p.stack.some((s) => s.toLowerCase().includes(q))
    );
  });
  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <main className={`${PAGE} pb-20 md:pb-28`}>
      <PageHead
        eyebrow="Catálogo"
        title={`Projetos da ${INSTITUTION.universityShort}.`}
        lead="Trabalhos reais de estudantes, revisados pela curadoria antes da publicação."
        aside={
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar projeto, tecnologia ou autor"
            aria-label="Buscar projetos por título, tecnologia ou estudante"
            className="vt-input h-11! w-full md:w-[288px]"
          />
        }
      />

      <div className="flex flex-col gap-4 border-b border-navy/13 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <button
              key={a}
              onClick={() => {
                setArea(a);
                setPage(1);
              }}
              aria-pressed={area === a}
              className={`vt-pill ${area === a ? "vt-pill-selected" : ""}`}
            >
              {a}
            </button>
          ))}
        </div>
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">
          {pad(shown.length)} de {pad(projects.length)} projetos
        </p>
      </div>

      {paged.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-navy/20 p-12 text-center font-sans text-sm text-navy/55">
          Nenhum projeto encontrado com esse filtro.
        </p>
      ) : (
        <div className="grid gap-5 pt-8 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={() => onOpenProject(project.id)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginação do catálogo" className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className="vt-btn vt-btn-secondary disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-navy/65">
            Página {safePage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className="vt-btn vt-btn-secondary disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      )}
    </main>
  );
}
