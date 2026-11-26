import type { ReactNode } from "react";
import { caminhoDaRota, type AppRoute } from "@/lib/rotas";

/**
 * Link de navegação interna: é uma âncora de verdade, com `href`, então dá
 * para copiar o endereço, abrir em outra aba e ler como link — mas o clique
 * comum navega pelo histórico, sem recarregar a página.
 *
 * Clique com Ctrl, Cmd, Shift ou do botão do meio segue o caminho do
 * navegador, que é o que a pessoa pediu ao usar esses atalhos.
 */
export function RouteLink({
  to,
  onNavigate,
  className,
  ariaCurrent,
  ariaLabel,
  children,
}: {
  to: AppRoute;
  onNavigate: (route: AppRoute) => void;
  className?: string;
  ariaCurrent?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={caminhoDaRota(to)}
      className={className}
      aria-current={ariaCurrent ? "page" : undefined}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        onNavigate(to);
      }}
    >
      {children}
    </a>
  );
}
