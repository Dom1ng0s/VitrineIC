import { PAGE } from "./layout";
import { PublicFooter } from "./PublicFooter";
import { PublicNav } from "./PublicNav";
import { PageHead } from "./PageHead";
import { RouteLink } from "@/components/app/RouteLink";
import { ArrowIcon } from "@/components/app/Icons";
import type { AppRoute } from "@/lib/rotas";

/**
 * Endereço que não existe. Antes das rotas por URL não havia como chegar
 * aqui — nem como errar o caminho, porque não havia caminho.
 */
export function NotFound({
  path,
  onRoute,
  onSignIn,
}: {
  path: string;
  onRoute: (route: AppRoute) => void;
  onSignIn: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <PublicNav view="home" onRoute={onRoute} onSignIn={onSignIn} />

      <main className={`${PAGE} flex-1`}>
        <PageHead
          eyebrow="Erro 404"
          title="Esta página não existe"
          lead={
            <>
              Não encontramos nada em <code className="font-mono text-[0.9em] text-navy">{path}</code>. O endereço pode
              ter mudado, ou o projeto ou perfil pode ter saído da vitrine.
            </>
          }
        />

        <div className="flex flex-wrap gap-3 pb-20">
          <RouteLink
            to={{ area: "public", route: { view: "projects" } }}
            onNavigate={onRoute}
            className="vt-btn vt-btn-primary"
          >
            Ver projetos <ArrowIcon />
          </RouteLink>
          <RouteLink to={{ area: "landing" }} onNavigate={onRoute} className="vt-btn vt-btn-secondary">
            Voltar ao início
          </RouteLink>
        </div>
      </main>

      <PublicFooter onRoute={onRoute} onSignIn={onSignIn} />
    </div>
  );
}
