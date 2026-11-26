import { useState } from "react";
import { Input, Label, Select } from "./ui";
import type { OnboardingField } from "./Onboarding";
import { FieldError, invalidProps } from "@/components/app/FieldError";
import { SIGNUP_UNITS, findSignupUnit } from "@/data/institution";
import { BIO_MAX, type ProfileDraft } from "@/lib/profile";

const INTERESTS = [
  "Inteligência Artificial",
  "Engenharia de Software",
  "Redes & Sistemas",
  "Segurança da Informação",
  "Banco de Dados",
  "Computação Gráfica",
  "Sistemas Embarcados",
  "Bioinformática",
  "HCI & Design",
];

type Field = (name: OnboardingField) => { id: string; error?: string };

/**
 * Passo 1. Nome, e-mail, instituto e curso vieram do cadastro e aparecem num
 * resumo; "Editar" abre esses campos aqui mesmo (o e-mail é o login e não muda).
 */
export function Step1({
  data,
  setData,
  field,
  email,
}: {
  data: ProfileDraft;
  setData: (d: Partial<ProfileDraft>) => void;
  field: Field;
  email?: string;
}) {
  const [editingAccount, setEditingAccount] = useState(false);
  const interests = data.interests;
  const unit = findSignupUnit(data.unit);
  const accountError = field("name").error || field("unit").error || field("course").error;

  const toggleInterest = (item: string) =>
    setData({ interests: interests.includes(item) ? interests.filter((i) => i !== item) : [...interests, item] });

  const bio = field("bio");

  return (
    <div className="flex flex-col gap-8">
      {/* Dados da conta */}
      <div className="rounded-xl border border-navy/13 bg-offwhite p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy/55">Dados da conta</p>
            <p className="mt-2 font-sans text-[15px] text-navy">{data.name || "—"}</p>
            <p className="mt-1 break-words font-mono text-[11px] text-navy/65">
              {[email, unit?.short, data.course].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingAccount(!editingAccount)}
            aria-expanded={editingAccount || !!accountError}
            className="vt-btn vt-btn-secondary shrink-0"
          >
            {editingAccount ? "Fechar" : "Editar"}
          </button>
        </div>

        {(editingAccount || accountError) && (
          <div className="mt-5 grid gap-x-4 gap-y-5 border-t border-navy/8 pt-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Nome completo"
                value={data.name}
                onChange={(v) => setData({ name: v })}
                {...field("name")}
              />
            </div>
            <Select
              {...field("unit")}
              label="Instituto ou faculdade"
              options={SIGNUP_UNITS.map((u) => ({ value: u.short, label: `${u.name} (${u.short})` }))}
              value={data.unit}
              onChange={(v: string) => setData({ unit: v, course: "" })}
            />
            <Select
              {...field("course")}
              label="Curso"
              options={unit?.courses ?? []}
              value={data.course}
              onChange={(v: string) => setData({ course: v })}
            />
          </div>
        )}
      </div>

      <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
        <Input
          label="Matrícula"
          placeholder="19210345"
          inputMode="numeric"
          value={data.matricula}
          onChange={(v) => setData({ matricula: v })}
          {...field("matricula")}
        />
        <Select
          label="Período"
          options={Array.from({ length: 14 }, (_, i) => `${i + 1}º semestre`)}
          value={data.semester}
          onChange={(v: string) => setData({ semester: v })}
        />
        <div className="md:col-span-2">
          <label htmlFor={bio.id}>
            <Label>Bio curta</Label>
          </label>
          <textarea
            id={bio.id}
            rows={3}
            placeholder="Descreva brevemente seu percurso e objetivos..."
            className="vt-input"
            value={data.bio}
            onChange={(e) => setData({ bio: e.target.value })}
            {...invalidProps(bio.id, bio.error)}
          />
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <FieldError id={bio.id}>{bio.error}</FieldError>
            <span
              className={`ml-auto shrink-0 font-mono text-[10px] ${data.bio.length > BIO_MAX ? "text-terracotta" : "text-navy/55"}`}
            >
              {data.bio.length} de {BIO_MAX}
            </span>
          </div>
        </div>
      </div>

      <div>
        <Label>Áreas de interesse</Label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleInterest(item)}
              aria-pressed={interests.includes(item)}
              className={`vt-pill ${interests.includes(item) ? "vt-pill-selected" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
