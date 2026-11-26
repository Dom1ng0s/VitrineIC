import type * as React from "react";
import { FieldError, FieldHint, invalidProps } from "./FieldError";

/**
 * Campos de formulário das áreas logadas.
 *
 * Antes cada área tinha a própria cópia em `ui.tsx`: `Input` era idêntico no
 * estudante e no solicitante, `Select` e `SelectField` eram o mesmo campo com
 * nomes diferentes, e o `Label` da curadoria tinha outro tom de navy sem que
 * ninguém tivesse decidido isso. Agora há uma implementação só, e o `ui.tsx`
 * de cada área reexporta daqui.
 *
 * Os campos aceitam `id` opcional por herança do protótipo; sem ele não há
 * `label` ligado nem mensagem de erro acessível. Tornar o `id` obrigatório é
 * a fase 6 do plano de completude.
 */

export function Label({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={`mb-2 block font-mono text-[10px] uppercase tracking-[0.08em] ${light ? "text-offwhite/60" : "text-navy/65"}`}
    >
      {children}
    </span>
  );
}

/** Rótulo ligado ao campo quando há `id`; solto quando não há. */
function CampoLabel({ label, id, light }: { label?: string; id?: string; light?: boolean }) {
  if (!label) return null;
  return id ? (
    <label htmlFor={id}>
      <Label light={light}>{label}</Label>
    </label>
  ) : (
    <Label light={light}>{label}</Label>
  );
}

export function Input({
  label,
  type = "text",
  placeholder,
  mono,
  textarea,
  rows = 3,
  value,
  onChange,
  id,
  error,
  hint,
  maxLength,
  inputMode,
}: {
  id?: string;
  /** Mensagem de erro; liga `aria-invalid` e `aria-describedby`. */
  error?: string;
  hint?: React.ReactNode;
  maxLength?: number;
  inputMode?: "numeric" | "text" | "email" | "url";
  label?: string;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  textarea?: boolean;
  rows?: number;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const cls = mono ? "vt-input vt-input-mono" : "vt-input";
  return (
    <div>
      <CampoLabel label={label} id={id} />
      {textarea ? (
        <textarea
          id={id}
          maxLength={maxLength}
          {...invalidProps(id, error)}
          rows={rows}
          placeholder={placeholder}
          className={cls}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <input
          id={id}
          maxLength={maxLength}
          inputMode={inputMode}
          {...invalidProps(id, error)}
          type={type}
          placeholder={placeholder}
          className={cls}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {id && error ? <FieldError id={id}>{error}</FieldError> : hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

/** Seta do select: o `.vt-input` não passa pelas camadas do Tailwind. */
function Chevron() {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-navy/55"
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Select({
  label,
  options,
  value,
  onChange,
  multiple,
  id,
  error,
  placeholder = "Selecione...",
}: {
  id?: string;
  error?: string;
  label?: string;
  /** Texto simples, ou valor e rótulo quando o que se grava difere do que se mostra. */
  options: readonly (string | { value: string; label: string })[];
  value: string | string[];
  onChange: (v: never) => void;
  multiple?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <CampoLabel label={label} id={id} />
      <div className="relative">
        <select
          id={id}
          {...invalidProps(id, error)}
          value={value}
          multiple={multiple}
          onChange={(e) => {
            if (multiple) onChange(Array.from(e.target.selectedOptions, (option) => option.value) as never);
            else onChange(e.target.value as never);
          }}
          className="vt-input"
          style={{
            appearance: multiple ? "auto" : "none",
            cursor: "pointer",
            paddingRight: multiple ? undefined : 40,
          }}
        >
          {!multiple && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const { value: v, label: l } = typeof o === "string" ? { value: o, label: o } : o;
            return (
              <option key={v} value={v}>
                {l}
              </option>
            );
          })}
        </select>
        {!multiple && <Chevron />}
      </div>
      {id && <FieldError id={id}>{error}</FieldError>}
    </div>
  );
}

/** Seleção única: o mesmo campo, com o nome que o solicitante já usava. */
export function SelectField(props: {
  id?: string;
  error?: string;
  label?: string;
  options: readonly (string | { value: string; label: string })[];
  value: string;
  onChange: (v: string) => void;
}) {
  return <Select {...props} onChange={props.onChange as (v: never) => void} />;
}

/** Linha divisória entre blocos do formulário. */
export function Rule() {
  return <div className="my-6 h-px bg-navy/8" />;
}
