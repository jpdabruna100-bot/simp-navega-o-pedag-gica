export type RiskLevel = "low" | "medium" | "high";

export type PsychStatus = "pendente" | "em_acompanhamento" | "avaliado";

export type FamilyContactStatus =
  | "aguardando"
  | "tentativa_1"
  | "tentativa_2"
  | "tentativa_3"
  | "contatada"
  | "sem_retorno";

export interface FamilyContactAttempt {
  done: boolean;
  date: string | null;
}

export interface FamilyContact {
  id: string;
  studentId: string;
  tentativa1: FamilyContactAttempt;
  tentativa2: FamilyContactAttempt;
  tentativa3: FamilyContactAttempt;
  houveRetorno: boolean | null;
  observacao: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc";
  date: string;
  responsavel: string;
  url: string; // mock URL
}

export interface Student {
  id: string;
  name: string;
  matricula: string;
  turmaId: string;
  riskLevel: RiskLevel;
  lastAssessmentDate: string;
  psychReferral: boolean;
  assessments: Assessment[];
  psychAssessments: PsychAssessment[];
  interventions: Intervention[];
  timeline: TimelineEvent[];
  familyContact?: FamilyContact;
  documents: StudentDocument[];
}

export interface Assessment {
  id: string;
  date: string;
  conceitoGeral: string;
  leitura: string;
  escrita: string;
  matematica: string;
  atencao: string;
  comportamento: string;
  dificuldadePercebida: boolean;
  observacaoProfessor?: string;
  principalDificuldade?: string;
  recorrenteOuRecente?: string;
  estrategiaEmSala?: string;
}

export interface PsychAssessment {
  id: string;
  date: string;
  tipo: "Inicial" | "Reavaliação" | "Acompanhamento";
  classificacao: string;
  necessitaAcompanhamento: boolean;
  observacao: string;
  possuiPEI?: "Sim" | "Não" | "Em elaboração";
  responsavel?: string;
}

export interface Intervention {
  id: string;
  tipo: string;
  objetivo: string;
  responsavel: string;
  status: "Planejada" | "Em andamento" | "Concluída";
  resultado: string;
  date: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: "assessment" | "psych" | "intervention" | "referral" | "family_contact";
  description: string;
}

export interface Turma {
  id: string;
  name: string;
  turno: string;
  professorId: string;
}

export interface User {
  id: string;
  name: string;
  role: "professor" | "psicologia" | "coordenacao" | "diretoria" | "admin";
  email: string;
}

const firstNames = ["Ana", "Pedro", "Maria", "Lucas", "Julia", "Gabriel", "Beatriz", "Matheus", "Larissa", "Felipe", "Camila", "Rafael", "Isabela", "Gustavo", "Letícia", "Bruno", "Mariana", "Thiago", "Sophia", "Daniel", "Laura", "Vitor", "Helena", "Igor", "Alice", "Enzo", "Valentina", "Leonardo", "Manuela", "Arthur", "Heloísa", "Davi", "Luísa", "Bernardo", "Lorena", "João", "Cecília", "Samuel", "Clara", "Nicolas", "Lara", "Henrique", "Lívia", "Cauã", "Isadora", "Miguel", "Giovanna", "Rodrigo", "Emanuelly", "Caio"];
const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Nascimento", "Lima", "Araújo", "Pereira", "Costa", "Carvalho", "Gomes", "Martins", "Ribeiro", "Barbosa", "Moreira", "Vieira", "Lopes"];

export const turmas: Turma[] = [
  { id: "t1", name: "1º Ano A", turno: "Manhã", professorId: "u1" },
  { id: "t2", name: "1º Ano B", turno: "Tarde", professorId: "u1" },
  { id: "t3", name: "2º Ano A", turno: "Manhã", professorId: "u2" },
  { id: "t4", name: "3º Ano C", turno: "Tarde", professorId: "u2" },
  { id: "t5", name: "5º Ano B", turno: "Manhã", professorId: "u1" },
];

export const users: User[] = [
  { id: "u1", name: "Profª. Carla Mendes", role: "professor", email: "carla@simp.edu" },
  { id: "u2", name: "Prof. Ricardo Alves", role: "professor", email: "ricardo@simp.edu" },
  { id: "u3", name: "Dra. Fernanda Costa", role: "psicologia", email: "fernanda@simp.edu" },
  { id: "u4", name: "Coord. Marcos Lima", role: "coordenacao", email: "marcos@simp.edu" },
  { id: "u5", name: "Dir. Patrícia Santos", role: "diretoria", email: "patricia@simp.edu" },
  { id: "u6", name: "Admin Sistema", role: "admin", email: "admin@simp.edu" },
];

function randomRisk(): RiskLevel {
  const r = Math.random();
  if (r < 0.5) return "low";
  if (r < 0.8) return "medium";
  return "high";
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPsychStatus(student: Student): PsychStatus {
  if (!student.psychReferral) return "avaliado";
  if (student.psychAssessments.length === 0) return "pendente";
  const last = student.psychAssessments[student.psychAssessments.length - 1];
  if (last.necessitaAcompanhamento) return "em_acompanhamento";
  return "avaliado";
}

export function getPsychStatusLabel(status: PsychStatus): string {
  switch (status) {
    case "pendente": return "Avaliação pendente";
    case "em_acompanhamento": return "Em acompanhamento";
    case "avaliado": return "Avaliado";
  }
}

export function getFamilyContactStatusLabel(contact?: FamilyContact): string {
  if (!contact) return "Aguardando contato";
  if (contact.houveRetorno === true) return "Família contatada";
  if (contact.tentativa3.done && contact.houveRetorno === false) return "Sem retorno após 3 tentativas";
  if (contact.tentativa3.done) return "3ª tentativa realizada";
  if (contact.tentativa2.done) return "2ª tentativa realizada";
  if (contact.tentativa1.done) return "1ª tentativa realizada";
  return "Aguardando contato";
}

function generateStudents(turmaId: string, count: number, startIdx: number): Student[] {
  return Array.from({ length: count }, (_, i) => {
    const risk = randomRisk();
    const id = `s${startIdx + i}`;
    const name = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    const mat = `2025${turmaId.replace("t", "")}${String(i + 1).padStart(3, "0")}`;
    const hasPsych = risk === "high" || (risk === "medium" && Math.random() > 0.5);

    const assessments: Assessment[] = [{
      id: `a${id}`,
      date: "2025-01-15",
      conceitoGeral: risk === "high" ? "Insuficiente" : risk === "medium" ? "Regular" : randomFrom(["Bom", "Excelente"]),
      leitura: risk === "high" ? "Defasada" : risk === "medium" ? "Em desenvolvimento" : "Adequada",
      escrita: risk === "high" ? "Defasada" : randomFrom(["Adequada", "Em desenvolvimento"]),
      matematica: risk === "high" ? "Defasada" : risk === "medium" ? "Em desenvolvimento" : "Adequada",
      atencao: risk === "high" ? "Defasada" : "Adequada",
      comportamento: risk === "high" ? "Defasado" : "Adequado",
      dificuldadePercebida: risk !== "low",
      observacaoProfessor: risk !== "low" ? "Aluno apresenta dificuldades recorrentes em atividades de leitura e escrita." : undefined,
      principalDificuldade: risk === "high" ? "Leitura e interpretação de textos" : undefined,
    }];

    const psychAssessments: PsychAssessment[] = hasPsych ? [{
      id: `pa${id}`,
      date: "2025-02-01",
      tipo: "Inicial",
      classificacao: risk === "high" ? "Neurodivergente" : "Suspeita",
      necessitaAcompanhamento: true,
      observacao: "Aluno apresenta dificuldades significativas que requerem acompanhamento especializado.",
      possuiPEI: risk === "high" ? "Em elaboração" : "Não",
      responsavel: "Dra. Fernanda Costa",
    }] : [];

    const familyContact: FamilyContact | undefined = hasPsych ? {
      id: `fc${id}`,
      studentId: id,
      tentativa1: { done: Math.random() > 0.3, date: Math.random() > 0.3 ? "2025-02-05" : null },
      tentativa2: { done: Math.random() > 0.5, date: Math.random() > 0.5 ? "2025-02-10" : null },
      tentativa3: { done: false, date: null },
      houveRetorno: Math.random() > 0.7 ? true : null,
      observacao: "",
    } : undefined;

    const interventions: Intervention[] = risk !== "low" ? [{
      id: `int${id}`,
      tipo: randomFrom(["Nivelamento", "Reforço Pedagógico", "Estratégia Diferenciada", "Conversa com a Família"]),
      objetivo: "Melhorar desempenho em leitura e escrita",
      responsavel: "Profª. Carla Mendes",
      status: randomFrom(["Planejada", "Em andamento", "Concluída"] as const),
      resultado: "Em observação",
      date: "2025-01-20",
    }] : [];

    const timeline: TimelineEvent[] = [
      { id: `tl1${id}`, date: "2025-01-15", type: "assessment", description: "Avaliação pedagógica realizada" },
      ...(hasPsych ? [{ id: `tl2${id}`, date: "2025-01-18", type: "referral" as const, description: "Encaminhado para avaliação psicopedagógica" }] : []),
      ...(hasPsych ? [{ id: `tl3${id}`, date: "2025-02-01", type: "psych" as const, description: "Avaliação psicopedagógica realizada" }] : []),
      ...(hasPsych && familyContact?.tentativa1.done ? [{ id: `tl5${id}`, date: "2025-02-05", type: "family_contact" as const, description: "1ª tentativa de contato com a família" }] : []),
      ...(risk !== "low" ? [{ id: `tl4${id}`, date: "2025-01-20", type: "intervention" as const, description: "Intervenção de reforço escolar iniciada" }] : []),
    ];

    return {
      id,
      name,
      matricula: mat,
      turmaId,
      riskLevel: risk,
      lastAssessmentDate: "2025-01-15",
      psychReferral: hasPsych,
      assessments,
      psychAssessments,
      interventions,
      timeline,
      familyContact,
      documents: hasPsych && risk === "high" ? [
        { id: `doc${id}`, name: "Laudo_Neuropsicologico.pdf", type: "pdf" as const, date: "2025-02-15", responsavel: "Dra. Fernanda Costa", url: "#" },
      ] : [],
    };
  });
}

export const initialStudents: Student[] = [
  ...generateStudents("t1", 10, 1),
  ...generateStudents("t2", 10, 11),
  ...generateStudents("t3", 10, 21),
  ...generateStudents("t4", 10, 31),
  ...generateStudents("t5", 10, 41),
];

export const INTERVENTION_TYPES = [
  "Nivelamento",
  "Reforço Pedagógico",
  "Estratégia Diferenciada",
  "Conversa com a Família",
] as const;

export const PSYCH_CLASSIFICATIONS = [
  "Típico",
  "Observação",
  "Suspeita",
  "Neurodivergente",
] as const;

export const PEI_OPTIONS = ["Sim", "Não", "Em elaboração"] as const;

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "low": return "Baixo risco";
    case "medium": return "Médio risco";
    case "high": return "Alto risco";
  }
}

export function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case "low": return "🟢";
    case "medium": return "🟡";
    case "high": return "🔴";
  }
}
