/**
 * Score de compatibilidade (0 a 100%) entre estudante e demanda.
 *
 * Única implementação do projeto, usada pelo endpoint `/api/demands/:id/ranking`
 * e pela ordenação de oportunidades do estudante. Considera:
 * - Competências (75 pts): peso 2 para obrigatórias, peso 1 para desejáveis,
 *   ponderadas pelo nível de proficiência declarado (1 a 4).
 * - Área (15 pts): afinidade entre a área da demanda e os interesses ou projetos
 *   do estudante.
 * - Disponibilidade (10 pts): horas/disponibilidade declarada, zerada quando o
 *   estudante já está marcado "em projeto".
 */

import type { Demand, SkillLevel, Student } from "@/types";

const LEVEL_FACTOR: Record<SkillLevel, number> = {
  1: 0.65,
  2: 0.8,
  3: 0.92,
  4: 1.0,
};
const DEFAULT_LEVEL_FACTOR = 0.85;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function areaMatches(demandArea: string, candidates: string[]): boolean {
  const target = normalize(demandArea);
  if (!target) return false;
  const targetTokens = target.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  return candidates.some((raw) => {
    const candidate = normalize(raw);
    if (!candidate) return false;
    if (candidate === target || candidate.includes(target) || target.includes(candidate)) return true;
    const tokens = new Set(candidate.split(/[^a-z0-9]+/).filter((t) => t.length >= 3));
    return targetTokens.some((t) => tokens.has(t));
  });
}

function availabilityPoints(student: Student): number {
  if (student.inProject) return 0;
  const text = normalize(student.availability ?? "");
  if (!text || text.includes("indispon")) return 0;
  const hours = text.match(/(\d+)\s*h/);
  if (hours) {
    const n = Number(hours[1]);
    if (n >= 15) return 10;
    if (n > 0) return 6;
    return 0;
  }
  if (text.includes("imediata") || text.includes("dispon") || text.includes("integral")) return 10;
  return 6;
}

export function scoreStudent(student: Student, demand: Demand): number {
  const uniqueSkills = [...new Set(demand.skills.map((s) => s.toLowerCase()))];
  if (!uniqueSkills.length) return 0;

  const desiredSet = new Set((demand.desiredSkills ?? []).map((s) => s.toLowerCase()));
  const studentSkillLevels = new Map<string, SkillLevel | undefined>();
  for (const skill of student.skills) {
    studentSkillLevels.set(skill.toLowerCase(), student.skillLevels?.[skill]);
  }
  for (const [skill, level] of Object.entries(student.skillLevels ?? {})) {
    const key = skill.toLowerCase();
    if (studentSkillLevels.has(key) && level) studentSkillLevels.set(key, level);
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  let matchedCount = 0;

  for (const skill of uniqueSkills) {
    const weight = desiredSet.has(skill) ? 1 : 2;
    totalWeight += weight;
    if (studentSkillLevels.has(skill)) {
      matchedCount += 1;
      const level = studentSkillLevels.get(skill);
      const factor = level ? LEVEL_FACTOR[level] : DEFAULT_LEVEL_FACTOR;
      earnedWeight += weight * factor;
    }
  }

  if (matchedCount === 0 || totalWeight === 0) return 0;

  const skillPoints = (earnedWeight / totalWeight) * 75;
  const areaSources = [...(student.interests ?? []), ...(student.projects ?? []).map((p) => p.area)];
  const areaPts = areaMatches(demand.area, areaSources) ? 15 : 0;
  const availPts = availabilityPoints(student);

  return Math.min(100, Math.round(skillPoints + areaPts + availPts));
}
