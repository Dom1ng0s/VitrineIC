/**
 * Identidade visual e código de exibição de um projeto.
 *
 * O id vem do servidor como `PRJ-<uuid>`; só os projetos da semente têm um
 * sufixo curto. Imprimir `id.replace("PRJ-", "P")` jogava o uuid inteiro na
 * capa, então o código de exibição passa por `codigoDeProjeto`.
 *
 * A capa é placeholder por decisão de produto (ver docs/plano-de-completude.md),
 * mas o estudante pode enviar uma imagem; sem ela, o degradê é derivado do id
 * para que dois projetos não fiquem com a mesma capa.
 */
import { NAVY, NAVY_MID, NAVY_SOFT } from "@/styles/tokens";

/** Hash estável e pequeno (FNV-1a de 32 bits), só para escolher variações. */
function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Código curto e estável: `P-4DF1` para um uuid, `P-001` para a semente.
 * Serve de legenda na capa e de referência nas conversas.
 */
export function codigoDeProjeto(id: string): string {
  const resto = id.replace(/^PRJ-/i, "").replace(/-/g, "");
  return `P-${(resto.slice(-4) || "0000").toUpperCase()}`;
}

const ANGULOS = [118, 142, 160, 196, 214, 238];
const DESTAQUES = ["85% 0%", "12% 0%", "100% 28%", "0% 18%", "62% 0%", "30% 100%"];
const MEIOS = [NAVY_SOFT, NAVY_MID, "#1b4b7a", "#16395f"];

/**
 * Degradê da capa sem imagem, derivado do id. Substitui o `background-image`
 * de `.vt-stone`; o ruído do `::before` continua valendo.
 */
export function capaDeProjeto(id: string): { backgroundImage: string } {
  const h = hash(id);
  const angulo = ANGULOS[h % ANGULOS.length];
  const destaque = DESTAQUES[(h >>> 3) % DESTAQUES.length];
  const meio = MEIOS[(h >>> 7) % MEIOS.length];
  return {
    backgroundImage: [
      `radial-gradient(120% 80% at ${destaque}, rgba(141, 169, 196, 0.24) 0%, transparent 55%)`,
      "radial-gradient(90% 70% at 0% 100%, rgba(141, 169, 196, 0.14) 0%, transparent 60%)",
      `linear-gradient(${angulo}deg, ${NAVY_SOFT} 0%, ${meio} 45%, ${NAVY} 100%)`,
    ].join(", "),
  };
}

/** Endereço público da imagem enviada; `cover` é o instante do último envio. */
export function urlDaCapa(id: string, cover?: string | null): string | null {
  return cover ? `/api/projects/${encodeURIComponent(id)}/cover?v=${encodeURIComponent(cover)}` : null;
}

export const MIMES_DE_CAPA = ["image/png", "image/jpeg", "image/webp"] as const;
export const LIMITE_DA_CAPA = 5 * 1024 * 1024;
