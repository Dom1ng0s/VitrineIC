/**
 * Rotas por URL.
 *
 * Antes, trocar de tela era estado local: não havia endereço para compartilhar
 * um projeto ou um perfil, o botão voltar do navegador saía do site, recarregar
 * caía na landing e o título da aba era o mesmo em toda parte.
 *
 * Em vez de um roteador de biblioteca, o caminho é traduzido à mão: o conjunto
 * de telas é pequeno e fechado, e a API de histórico do navegador resolve.
 * Quem serve o `dist/` já devolve `index.html` em caminho desconhecido
 * (`server/app.ts`), então link direto funciona depois do reload.
 *
 * As áreas logadas não entram aqui: o destino delas vem da sessão, e a aba
 * aberta é estado da própria área.
 */

import { useCallback, useEffect, useState } from "react";
import type { PublicRoute } from "@/components/public/routes";
import { INSTITUTION } from "@/data/institution";

export type AppRoute =
  | { area: "landing" }
  | { area: "public"; route: PublicRoute }
  | { area: "curator_signin" }
  | { area: "not_found"; path: string };

/** Primeiro segmento de cada seção pública, em português, como na interface. */
const SEGMENTO = { projects: "projetos", students: "estudantes", impact: "impacto" } as const;
const CURADORIA = "curadoria";

export function caminhoDaRota(route: AppRoute): string {
  if (route.area === "landing") return "/";
  if (route.area === "curator_signin") return `/${CURADORIA}`;
  if (route.area === "not_found") return route.path;
  const r = route.route;
  if (r.view === "project") return `/${SEGMENTO.projects}/${encodeURIComponent(r.id)}`;
  if (r.view === "profile") return `/${SEGMENTO.students}/${encodeURIComponent(r.id)}`;
  return `/${SEGMENTO[r.view]}`;
}

export function rotaDoCaminho(caminho: string): AppRoute {
  const partes = caminho.split("/").filter(Boolean).map(decodeURIComponent);
  if (!partes.length) return { area: "landing" };

  const [secao, id, ...resto] = partes;
  if (resto.length) return { area: "not_found", path: caminho };

  if (secao === CURADORIA && !id) return { area: "curator_signin" };
  if (secao === SEGMENTO.impact && !id) return { area: "public", route: { view: "impact" } };
  if (secao === SEGMENTO.projects)
    return { area: "public", route: id ? { view: "project", id } : { view: "projects" } };
  if (secao === SEGMENTO.students)
    return { area: "public", route: id ? { view: "profile", id } : { view: "students" } };

  return { area: "not_found", path: caminho };
}

/** Título da aba por rota. O nome do detalhe entra depois, na própria tela. */
export function tituloDaRota(route: AppRoute): string {
  const sufixo = `VitrineIC · ${INSTITUTION.unitShort}`;
  if (route.area === "landing") return `${sufixo} — projetos e demandas`;
  if (route.area === "curator_signin") return `Curadoria · ${sufixo}`;
  if (route.area === "not_found") return `Página não encontrada · ${sufixo}`;
  const porView: Record<string, string> = {
    projects: "Projetos",
    project: "Projeto",
    students: "Estudantes",
    profile: "Perfil",
    impact: "Impacto",
  };
  return `${porView[route.route.view]} · ${sufixo}`;
}

/**
 * Rota atual e como mudá-la. `navegar` empurra no histórico (o voltar do
 * navegador desfaz); `substituir` troca sem empilhar, para o caso de o próprio
 * código corrigir o endereço.
 */
export function useRota() {
  const [route, setRoute] = useState<AppRoute>(() => rotaDoCaminho(window.location.pathname));

  useEffect(() => {
    const aoVoltar = () => setRoute(rotaDoCaminho(window.location.pathname));
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  useEffect(() => {
    document.title = tituloDaRota(route);
  }, [route]);

  const ir = useCallback((proxima: AppRoute, substituir = false) => {
    const caminho = caminhoDaRota(proxima);
    if (caminho !== window.location.pathname) {
      window.history[substituir ? "replaceState" : "pushState"]({}, "", caminho);
    }
    setRoute(proxima);
  }, []);

  return { route, ir };
}
