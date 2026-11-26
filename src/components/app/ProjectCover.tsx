import { capaDeProjeto, codigoDeProjeto, urlDaCapa } from "@/lib/projeto";

/**
 * Capa do projeto, igual no catálogo, na página pública e no perfil.
 *
 * Com imagem enviada pelo estudante, mostra a imagem; sem ela, o degradê
 * derivado do id mais a inicial do título, para cada projeto ficar distinto
 * na grade em vez de repetir o mesmo retângulo.
 */
export function ProjectCover({
  id,
  title,
  cover,
  className = "",
  sufixo,
  semLegenda = false,
}: {
  id: string;
  title: string;
  cover?: string | null;
  /** Altura e raio ficam com quem usa: o card e a página têm medidas diferentes. */
  className?: string;
  /** Texto extra na legenda, como "capa do projeto" na página pública. */
  sufixo?: string;
  /** Miniaturas não cabem a legenda. */
  semLegenda?: boolean;
}) {
  const url = urlDaCapa(id, cover);
  const legenda = ["VIC", codigoDeProjeto(id), sufixo].filter(Boolean).join(" · ");

  return (
    <div className={`vt-stone relative overflow-hidden ${className}`} style={url ? undefined : capaDeProjeto(id)}>
      {url ? (
        <>
          <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy/70 to-transparent" />
        </>
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-display text-[64px] font-medium leading-none text-offwhite/12 md:text-[96px]"
        >
          {title.trim().charAt(0).toUpperCase()}
        </span>
      )}
      {!semLegenda && (
        <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.08em] text-sky">
          {legenda}
        </span>
      )}
    </div>
  );
}
