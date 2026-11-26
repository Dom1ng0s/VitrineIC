import { LEVELS } from "@/data/skills";
import type { SkillLevel } from "@/types";

const STEPS: SkillLevel[] = [1, 2, 3, 4];

/**
 * Seletor de proficiência: quatro pílulas, a escolhida em navy sólido.
 * Setas do teclado sobem e descem o nível.
 */
export function LevelPicker({
  value,
  onChange,
  name,
  labels = LEVELS,
}: {
  value: SkillLevel;
  onChange: (level: SkillLevel) => void;
  name: string;
  labels?: readonly string[];
}) {
  return (
    <div
      role="radiogroup"
      tabIndex={-1}
      aria-label={`Proficiência em ${name}`}
      className="flex flex-wrap gap-1.5"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(4, value + 1) as SkillLevel);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(1, value - 1) as SkillLevel);
        }
      }}
    >
      {STEPS.map((step) => {
        const active = step === value;
        return (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(step)}
            className={`vt-pill ${active ? "vt-pill-selected" : ""}`}
          >
            {labels[step - 1]}
          </button>
        );
      })}
    </div>
  );
}
