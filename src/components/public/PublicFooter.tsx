import { INSTITUTION } from "@/data/institution";
import { Logo } from "./Logo";
import { PAGE } from "./layout";
import type { PublicView } from "./routes";
import { RouteLink } from "@/components/app/RouteLink";
import type { AppRoute } from "@/lib/rotas";

/** Rodapé azul das páginas públicas, igual na landing e nas telas internas. */
export function PublicFooter({ onRoute, onSignIn }: { onRoute: (route: AppRoute) => void; onSignIn: () => void }) {
  const secao = (view: PublicView): AppRoute => ({ area: "public", route: { view } });
  const linkClass = "font-sans text-sm text-offwhite/75 transition-colors hover:text-offwhite";

  // Plataforma leva a páginas, então são âncoras; Acesso abre o modal de login.
  const navegacao: { label: string; to: AppRoute }[] = [
    { label: "Projetos", to: secao("projects") },
    { label: "Estudantes", to: secao("students") },
    { label: "Impacto", to: secao("impact") },
    { label: "Curadoria", to: { area: "curator_signin" } },
  ];

  return (
    <footer className={`${PAGE} pb-6`}>
      <div className="vt-stone rounded-3xl p-8 md:p-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo inverted />
            <p className="mt-4 max-w-[280px] font-sans text-sm font-light leading-[1.5] text-offwhite/60">
              Projeto de extensão do {INSTITUTION.unit} da {INSTITUTION.university}.
            </p>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-sky">Plataforma</p>
            <ul className="flex flex-col gap-3">
              {navegacao.map((link) => (
                <li key={link.label}>
                  <RouteLink to={link.to} onNavigate={onRoute} className={linkClass}>
                    {link.label}
                  </RouteLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-sky">Acesso</p>
            <ul className="flex flex-col gap-3">
              {["Estudantes", "Solicitantes"].map((label) => (
                <li key={label}>
                  <button onClick={onSignIn} className={linkClass}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-sky">Contato</p>
            <ul className="flex flex-col gap-3 font-sans text-sm text-offwhite/75">
              <li>{INSTITUTION.contactEmail}</li>
              <li>{INSTITUTION.campus}</li>
              <li>
                {INSTITUTION.city} — {INSTITUTION.stateShort}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-offwhite/10 pt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-offwhite/60 sm:flex-row sm:justify-between">
          <span>VitrineIC — {INSTITUTION.universityShort} · 2026</span>
          <span>Curadoria humana · contato só com aceite dos dois lados</span>
        </div>
      </div>
    </footer>
  );
}
