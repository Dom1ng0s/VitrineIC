import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { paraExibicao } from "@/lib/datas";

interface Opinion {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export function CommitteeOpinions({ demandId }: { demandId: string }) {
  const committee = useSession()?.account.curatorFunction === "comite";
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api<Opinion[]>(`/demands/${encodeURIComponent(demandId)}/opinions`)
      .then((rows) => {
        if (active) setOpinions(rows);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar os pareceres.");
      });
    return () => {
      active = false;
    };
  }, [demandId]);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      setOpinions(
        await api<Opinion[]>(`/demands/${encodeURIComponent(demandId)}/opinions`, { method: "POST", body: { text } }),
      );
      setText("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível registrar o parecer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-3 border-t border-navy/10 pt-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">Pareceres do comitê</p>
      {opinions.length === 0 && <p className="font-sans text-xs text-navy/50">Nenhum parecer registrado.</p>}
      <ul className="space-y-2">
        {opinions.map((opinion) => (
          <li key={opinion.id} className="rounded-lg bg-white p-3 font-sans text-xs text-navy/70">
            <p className="mb-1 font-medium text-navy">
              {opinion.author} · {paraExibicao(opinion.createdAt)}
            </p>
            <p className="whitespace-pre-wrap">{opinion.text}</p>
          </li>
        ))}
      </ul>
      {committee && (
        <div className="mt-3">
          <label htmlFor={`opinion-${demandId}`} className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-navy/65">
              Seu parecer
            </span>
            <textarea
              id={`opinion-${demandId}`}
              aria-label="Seu parecer"
              className="vt-input"
              rows={3}
              maxLength={3000}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          <button className="vt-btn vt-btn-secondary mt-2" disabled={busy || !text.trim()} onClick={() => void send()}>
            Registrar parecer
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 font-sans text-xs text-red">
          {error}
        </p>
      )}
    </section>
  );
}
