import { useEffect, useState } from "react";
import { AuthModal } from "@/components/landing/AuthModal";
import LandingPage from "@/components/landing/LandingPage";
import PublicArea from "@/components/public/PublicArea";
import { NotFound } from "@/components/public/NotFound";
import CuratorArea from "@/components/curator/CuratorArea";
import { CuratorSignIn } from "@/components/curator/CuratorSignIn";
import RequesterArea from "@/components/requester/RequesterArea";
import StudentArea from "@/components/student/StudentArea";
import { signOut, useSession } from "@/lib/auth";
import { useRota } from "@/lib/rotas";
import { AccountLinkPage, readAccountLink } from "@/components/landing/AccountLinkPage";

/**
 * Raiz da aplicação: landing, páginas públicas e as três áreas logadas.
 *
 * As telas públicas têm endereço próprio (`src/lib/rotas.ts`): dá para
 * compartilhar um projeto, voltar pelo navegador e recarregar onde se estava.
 * A área logada vem da sessão do servidor (cookie HttpOnly), não da URL:
 * recarregar com sessão aberta volta direto para ela, e o endereço é
 * normalizado para a raiz enquanto a sessão existe.
 */
export default function App() {
  const session = useSession();
  const { route, ir } = useRota();
  const [modalOpen, setModalOpen] = useState(false);
  const [accountLink, setAccountLink] = useState(readAccountLink);
  const role = session?.account.role;

  const toLanding = () => ir({ area: "landing" });
  const openSignIn = () => setModalOpen(true);

  // Trocar de tela não volta ao topo sozinho.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route, role]);

  // As áreas logadas não têm rota própria; manter um caminho público na barra
  // de endereço enquanto a sessão abre a área seria mentira.
  useEffect(() => {
    if (role && route.area !== "landing") ir({ area: "landing" }, true);
  }, [role, route.area, ir]);

  const exit = async () => {
    if (await signOut()) toLanding();
  };

  if (accountLink)
    return (
      <AccountLinkPage
        link={accountLink}
        onDone={() => {
          setAccountLink(null);
          toLanding();
        }}
      />
    );
  if (role === "student") return <StudentArea onBack={exit} />;
  if (role === "requester") return <RequesterArea onBack={exit} />;
  if (role === "curator") return <CuratorArea onBack={exit} />;

  if (route.area === "curator_signin") return <CuratorSignIn onSignedIn={toLanding} onBack={toLanding} />;

  return (
    <>
      {route.area === "landing" && <LandingPage onSignIn={openSignIn} onRoute={ir} />}

      {route.area === "public" && <PublicArea route={route.route} onRoute={ir} onSignIn={openSignIn} />}

      {route.area === "not_found" && <NotFound path={route.path} onRoute={ir} onSignIn={openSignIn} />}

      {modalOpen && (
        <AuthModal
          onClose={() => setModalOpen(false)}
          onSignedIn={() => {
            setModalOpen(false);
            toLanding();
          }}
        />
      )}
    </>
  );
}
