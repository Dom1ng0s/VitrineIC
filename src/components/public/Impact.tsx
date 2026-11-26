import { courseShort } from "@/data/institution";
import { useVitrine } from "@/lib/store";
import type { ImpactTargetKey } from "@/types/api";
import { Eyebrow } from "./Eyebrow";
import { PageHead } from "./PageHead";
import { PAGE } from "./layout";

/**
 * Painel de indicadores da atividade de extensão (ACE1).
 *
 * Números, período e metas vêm do banco via API — nenhum valor é digitado aqui.
 * Depoimentos fictícios foram removidos por decisão de escopo.
 */
export function Impact() {
  const { impact } = useVitrine();
  const headline: { key: ImpactTargetKey; value: number; label: string }[] = [
    { key: "released", value: impact.released, label: "contatos liberados" },
    { key: "projects", value: impact.projects, label: "projetos na vitrine" },
    { key: "demands", value: impact.demands, label: "demandas recebidas" },
    { key: "students", value: impact.students, label: "estudantes com perfil público" },
  ];
  const byArea = impact.byArea;
  const maxArea = Math.max(...byArea.map(([, n]) => n), 1);
  const byCourse = impact.byCourse.map(([course, n]) => ({
    course,
    pct: impact.students ? Math.round((n / impact.students) * 100) : 0,
  }));

  return (
    <main className={`${PAGE} pb-20 md:pb-28`}>
      <PageHead
        eyebrow="Extensão"
        title={
          <>
            <span className="text-red">Impacto</span> em números.
          </>
        }
        lead={
          impact.period
            ? `Indicadores do projeto de extensão em ${impact.period}, apurados direto da base da plataforma.`
            : "Indicadores do projeto de extensão, apurados direto da base da plataforma."
        }
      />

      {/* ── Indicadores ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {headline.map((item, i) => {
          const target = impact.targets?.[item.key];
          return (
            <div key={item.key} className="vt-card flex flex-col p-6">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-[15px] font-medium text-red">{String(i + 1).padStart(2, "0")}</p>
                {target !== undefined && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/50">Meta {target}</p>
                )}
              </div>
              <p className="mt-8 font-display text-[48px] font-medium leading-none tracking-[-0.04em] text-navy">
                {item.value}
              </p>
              <p className="mt-3 font-sans text-sm text-navy/65">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Distribuições ── */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="vt-card p-6 md:p-8">
          <Eyebrow>Demandas por área</Eyebrow>
          {byArea.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-5">
              {byArea.map(([area, n]) => (
                <li key={area} className="grid grid-cols-[minmax(0,9rem)_1fr_1.5rem] items-center gap-4 md:gap-6">
                  <span className="truncate font-sans text-sm text-navy">{area || "Sem área"}</span>
                  <span className="h-1 rounded-full bg-navy/10">
                    <span className="block h-1 rounded-full bg-navy" style={{ width: `${(n / maxArea) * 100}%` }} />
                  </span>
                  <span className="text-right font-mono text-[10px] text-navy/65">{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 font-sans text-sm text-navy/55">Nenhuma demanda registrada ainda.</p>
          )}
        </section>

        <section className="vt-stone rounded-2xl p-6 md:p-8">
          <Eyebrow onDark>Distribuição por curso</Eyebrow>
          {byCourse.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-6">
              {byCourse.map(({ course, pct }) => (
                <li key={course}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-sans text-sm text-offwhite" title={course}>
                      {courseShort(course)}
                    </span>
                    <span className="font-mono text-[10px] text-offwhite/65">{pct}%</span>
                  </div>
                  <span className="mt-2.5 block h-1 rounded-full bg-offwhite/15">
                    <span className="block h-1 rounded-full bg-sky" style={{ width: `${pct}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 font-sans text-sm text-offwhite/60">Nenhum estudante com perfil público ainda.</p>
          )}
        </section>
      </div>
    </main>
  );
}
