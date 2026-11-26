import { useState } from "react";
import { Modal } from "@/components/app/Modal";
import { api } from "@/lib/api";

interface PortfolioFile {
  id: string;
  name: string;
  size: number;
}

export function PortfolioFiles({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<PortfolioFile[]>([]);
  const [error, setError] = useState("");

  const show = async () => {
    setOpen(true);
    setError("");
    try {
      setFiles(await api<PortfolioFile[]>(`/students/${encodeURIComponent(studentId)}/portfolio`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o portfólio.");
    }
  };

  return (
    <>
      <button className="vt-btn vt-btn-secondary" onClick={() => void show()}>
        Portfólio
      </button>
      {open && (
        <Modal eyebrow="Contato liberado" title={`Portfólio de ${studentName}`} onClose={() => setOpen(false)}>
          {error && (
            <p role="alert" className="font-sans text-sm text-red">
              {error}
            </p>
          )}
          {!error && files.length === 0 && (
            <p className="font-sans text-sm text-navy/60">Nenhum arquivo de portfólio enviado.</p>
          )}
          <ul className="divide-y divide-navy/10">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0 truncate font-sans text-sm text-navy">{file.name}</span>
                <a
                  href={`/api/attachments/${encodeURIComponent(file.id)}`}
                  className="vt-btn vt-btn-secondary"
                  download
                >
                  Baixar
                </a>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
}
