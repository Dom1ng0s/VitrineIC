import { useState } from "react";
import { Logo } from "./Logo";
import type { PublicView } from "./routes";
import { RouteLink } from "@/components/app/RouteLink";
import type { AppRoute } from "@/lib/rotas";

const ITENS: { id: PublicView; label: string }[] = [
  { id: "projects", label: "Projetos" },
  { id: "students", label: "Estudantes" },
  { id: "impact", label: "Impacto" },
];

const rotaDe = (view: PublicView): AppRoute => ({ area: "public", route: { view } });
const INICIO: AppRoute = { area: "landing" };
const CURADORIA: AppRoute = { area: "curator_signin" };

/**
 * Navegação das páginas públicas, unificada com a Landing Page.
 *
 * Os destinos são âncoras com `href` de verdade, para dar copiar endereço e
 * abrir em outra aba. No celular as seções ficavam escondidas por
 * `hidden md:flex` e não havia menu nenhum: só sobravam "Curadoria" e
 * "Entrar". Agora há um menu que as abre.
 */
export function PublicNav({
  view,
  onRoute,
  onSignIn,
  comCuradoria = true,
}: {
  /** Seção ativa; ausente ou "home" na landing. */
  view?: PublicView | "home";
  onRoute: (route: AppRoute) => void;
  onSignIn: () => void;
  comCuradoria?: boolean;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const linkClass = (ativo: boolean) =>
    `font-sans text-[13px] transition-colors ${ativo ? "text-navy" : "text-navy/65 hover:text-navy"}`;
  const naInicial = !view || view === "home";

  const navegar = (route: AppRoute) => {
    setMenuAberto(false);
    onRoute(route);
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-navy/8 bg-offwhite/85 backdrop-blur-[8px]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-5 md:px-10">
        <RouteLink to={INICIO} onNavigate={navegar} ariaLabel="VitrineIC, início">
          <Logo />
        </RouteLink>

        <div className="hidden items-center gap-6 md:flex">
          <RouteLink to={INICIO} onNavigate={navegar} className={linkClass(naInicial)} ariaCurrent={naInicial}>
            Início
          </RouteLink>
          {ITENS.map((item) => (
            <RouteLink
              key={item.id}
              to={rotaDe(item.id)}
              onNavigate={navegar}
              className={linkClass(view === item.id)}
              ariaCurrent={view === item.id}
            >
              {item.label}
            </RouteLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {comCuradoria && (
            <RouteLink
              to={CURADORIA}
              onNavigate={navegar}
              className="hidden font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65 transition-colors hover:text-navy sm:block"
            >
              Curadoria
            </RouteLink>
          )}
          <button onClick={onSignIn} className="vt-btn vt-btn-secondary">
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy/15 text-navy md:hidden"
            aria-expanded={menuAberto}
            aria-controls="menu-publico"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {menuAberto ? (
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              ) : (
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuAberto && (
        <div id="menu-publico" className="border-t border-navy/8 bg-offwhite px-5 py-3 md:hidden">
          <ul className="flex flex-col">
            {[{ to: INICIO, label: "Início", ativo: naInicial }]
              .concat(ITENS.map((item) => ({ to: rotaDe(item.id), label: item.label, ativo: view === item.id })))
              .concat(comCuradoria ? [{ to: CURADORIA, label: "Curadoria", ativo: false }] : [])
              .map((item) => (
                <li key={item.label}>
                  <RouteLink
                    to={item.to}
                    onNavigate={navegar}
                    ariaCurrent={item.ativo}
                    className={`block py-2.5 font-sans text-[15px] ${item.ativo ? "text-navy" : "text-navy/70"}`}
                  >
                    {item.label}
                  </RouteLink>
                </li>
              ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
