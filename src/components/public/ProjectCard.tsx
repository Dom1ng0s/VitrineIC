import type { ProjectWithStudent } from "@/lib/store";
import { ProjectCover } from "@/components/app/ProjectCover";
import { ProjectStatusPill } from "./ProjectStatusPill";

/**
 * Card de projeto do catálogo e do perfil público.
 * `compact` esconde descrição, stack e status, como nos cards do perfil no Figma.
 */
export function ProjectCard({
  project,
  onOpen,
  compact = false,
}: {
  project: ProjectWithStudent;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <button onClick={onOpen} className="vt-card vt-card-interactive flex min-w-0 flex-col gap-5 p-6 text-left">
      <div className="flex w-full items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">
        <span className="truncate">{project.area || "Sem área"}</span>
        <span className="shrink-0">{project.year}</span>
      </div>

      <ProjectCover id={project.id} title={project.title} cover={project.cover} className="h-32 w-full rounded-xl" />

      <div className="flex flex-col gap-2">
        <h3 className="line-clamp-2 font-display text-xl font-medium leading-[1.2] tracking-[-0.02em] text-navy">
          {project.title}
        </h3>
        {!compact && <p className="line-clamp-2 font-sans text-sm leading-[1.5] text-navy/65">{project.description}</p>}
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 3).map((tech) => (
            <span key={tech} className="vt-pill">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex w-full items-center gap-3 border-t border-navy/8 pt-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-navy font-display text-[13px] font-medium text-offwhite">
          {project.student.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[13px] text-navy">{project.student.name}</p>
          <p className="truncate font-sans text-xs text-navy/65">
            {project.student.course} · {project.student.semester}
          </p>
        </div>
        {!compact && <ProjectStatusPill status={project.status} />}
      </div>
    </button>
  );
}
