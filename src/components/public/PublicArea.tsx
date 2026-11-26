import { Impact } from "./Impact";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectsCatalog } from "./ProjectsCatalog";
import { PublicFooter } from "./PublicFooter";
import { PublicNav } from "./PublicNav";
import { PublicProfile } from "./PublicProfile";
import { StudentsDirectory } from "./StudentsDirectory";
import { navSection, type PublicRoute } from "./routes";
import type { AppRoute } from "@/lib/rotas";

/** Casca das páginas públicas: nav fixa, a tela da rota atual e o rodapé. */
export default function PublicArea({
  route,
  onRoute,
  onSignIn,
}: {
  route: PublicRoute;
  onRoute: (route: AppRoute) => void;
  onSignIn: () => void;
}) {
  const ir = (publica: PublicRoute) => onRoute({ area: "public", route: publica });

  return (
    <div className="min-h-screen bg-offwhite">
      <PublicNav view={navSection(route)} onRoute={onRoute} onSignIn={onSignIn} />

      {route.view === "projects" && <ProjectsCatalog onOpenProject={(id) => ir({ view: "project", id })} />}

      {route.view === "project" && (
        <ProjectDetail
          id={route.id}
          onBack={() => ir({ view: "projects" })}
          onOpenProfile={(id) => ir({ view: "profile", id })}
          onSignIn={onSignIn}
        />
      )}

      {route.view === "students" && <StudentsDirectory onOpenProfile={(id) => ir({ view: "profile", id })} />}

      {route.view === "profile" && (
        <PublicProfile
          id={route.id}
          onBack={() => ir({ view: "students" })}
          onOpenProject={(id) => ir({ view: "project", id })}
        />
      )}

      {route.view === "impact" && <Impact />}

      <PublicFooter onRoute={onRoute} onSignIn={onSignIn} />
    </div>
  );
}
