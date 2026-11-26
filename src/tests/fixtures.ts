import type { Demand, Student } from "@/types";

/**
 * Fábricas de domínio para os testes. Tudo fictício, como em `src/data`.
 * Cada teste sobrescreve só os campos que o caso exige.
 */
export function makeStudent(patch: Partial<Student> = {}): Student {
  return {
    id: "s-teste",
    name: "Ana Souza",
    initials: "AS",
    email: "ana@ic.ufal.br",
    unit: "IC",
    course: "Ciência da Computação",
    semester: "5º",
    gpa: "8,4",
    bio: "",
    interests: [],
    skills: [],
    skillLevels: {},
    languages: [],
    projects: [],
    github: "",
    availability: "",
    ...patch,
  };
}

export function makeDemand(patch: Partial<Demand> = {}): Demand {
  return {
    id: "d-teste",
    title: "Site institucional",
    company: "Org Fictícia",
    area: "Sistemas Web",
    scope: "A definir",
    deadline: "2026-12-01",
    skills: [],
    description: "",
    submitted: "2026-11-01",
    status: "nova",
    priority: "normal",
    ...patch,
  };
}
