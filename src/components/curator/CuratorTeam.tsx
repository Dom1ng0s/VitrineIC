import { useEffect, useState } from "react";
import { Input } from "@/components/app/Field";
import { PageHead } from "@/components/public/PageHead";
import { PAGE } from "@/components/public/layout";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { useVitrine } from "@/lib/store";

type FunctionCode = "curador" | "coordenacao" | "comite";
interface Member {
  accountId: string;
  name: string;
  email: string;
  function: FunctionCode;
  active: boolean;
}

const labels: Record<FunctionCode, string> = {
  curador: "Curador",
  coordenacao: "Coordenação",
  comite: "Comitê de alunos",
};

export function CuratorTeam() {
  const { auth } = useVitrine();
  const coordinator = useSession()?.account.curatorFunction === "coordenacao";
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [functionCode, setFunctionCode] = useState<FunctionCode>("curador");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api<Member[]>("/curators")
      .then((rows) => {
        if (active) setMembers(rows);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a equipe.");
      });
    return () => {
      active = false;
    };
  }, []);

  const invite = async () => {
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    setError("");
    try {
      const member = await api<Member>("/curators", { method: "POST", body: { name, email, function: functionCode } });
      setMembers((current) => [...current, member].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setEmail("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível enviar o convite.");
    } finally {
      setBusy(false);
    }
  };

  const change = async (member: Member, functionCode: FunctionCode, active: boolean) => {
    setBusy(true);
    setError("");
    try {
      const updated = await api<Member>(`/curators/${encodeURIComponent(member.accountId)}`, {
        method: "PATCH",
        body: { function: functionCode, active },
      });
      setMembers((current) => current.map((entry) => (entry.accountId === updated.accountId ? updated : entry)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível alterar a equipe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={`${PAGE} pb-20`}>
      <PageHead
        eyebrow="Curadoria"
        title="Equipe da curadoria."
        lead="Funções definem quem tria, decide e registra pareceres."
      />
      {error && (
        <p role="alert" className="mb-5 rounded-lg bg-red/10 p-3 font-sans text-sm text-red">
          {error}
        </p>
      )}
      <ul className="vt-card divide-y divide-navy/10 overflow-hidden">
        {members.map((member) => (
          <li key={member.accountId} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-medium text-navy">{member.name}</p>
              <p className="font-sans text-xs text-navy/55">{member.email}</p>
            </div>
            {coordinator ? (
              <>
                <select
                  aria-label={`Função de ${member.name}`}
                  className="vt-input max-w-44"
                  value={member.function}
                  disabled={busy}
                  onChange={(event) => void change(member, event.target.value as FunctionCode, member.active)}
                >
                  {(Object.keys(labels) as FunctionCode[]).map((code) => (
                    <option key={code} value={code}>
                      {labels[code]}
                    </option>
                  ))}
                </select>
                <button
                  className="vt-btn vt-btn-secondary"
                  disabled={busy}
                  onClick={() => void change(member, member.function, !member.active)}
                >
                  {member.active ? "Desativar" : "Reativar"}
                </button>
              </>
            ) : (
              <span className="font-mono text-xs text-navy/55">
                {labels[member.function]}
                {member.active ? "" : " · Inativo"}
              </span>
            )}
          </li>
        ))}
      </ul>
      {coordinator && (
        <section className="vt-card mt-6 p-6">
          <h2 className="mb-5 font-display text-xl text-navy">Convidar integrante</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Input id="curator-name" label="Nome" value={name} onChange={setName} />
            <Input id="curator-email" label="E-mail" type="email" value={email} onChange={setEmail} />
            <div>
              <label htmlFor="curator-function" className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">
                  Função
                </span>
                <select
                  id="curator-function"
                  className="vt-input"
                  value={functionCode}
                  onChange={(event) => setFunctionCode(event.target.value as FunctionCode)}
                >
                  {(Object.keys(labels) as FunctionCode[]).map((code) => (
                    <option key={code} value={code}>
                      {labels[code]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {!auth.emailEnabled && (
            <p className="mt-4 font-sans text-xs text-navy/55">
              Configure o envio de e-mail para convidar novas pessoas.
            </p>
          )}
          <button
            className="vt-btn vt-btn-primary mt-5"
            disabled={busy || !auth.emailEnabled || !name.trim() || !email.trim()}
            onClick={() => void invite()}
          >
            Enviar convite
          </button>
        </section>
      )}
    </main>
  );
}
