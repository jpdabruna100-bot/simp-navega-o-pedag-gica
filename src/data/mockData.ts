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
  docCategory?: "laudo" | "pei" | "outro"; // Laudo, PEI ou outro (para filtro na visão Psicologia)
}

export interface Student {
  id: string;
  name: string;
  matricula: string;
  turmaId: string;
  riskLevel: RiskLevel;
  lastAssessmentDate: string;
  psychReferral: boolean;
  psychReferralReason?: string;
  assessments: Assessment[];
  psychAssessments: PsychAssessment[];
  interventions: Intervention[];
  timeline: TimelineEvent[];
  familyContact?: FamilyContact;
  documents: StudentDocument[];
  /** Indica encaminhamento por Alerta Crítico (OC-1) para priorização no painel Psicologia */
  criticalAlert?: boolean;
  /** Medicação em uso (registro da equipe multidisciplinar) */
  medicacao?: string;
  /** Acompanhamento clínico/terapêutico externo (ex.: rede de saúde, clínica) */
  acompanhamentoExterno?: string;
  /** Potencialidades (ZDR) — equipe multidisciplinar / OQE */
  potencialidades?: string;
  /** Objetivos de desenvolvimento (ZDP) */
  zdp?: string;
  /** PEI/PDI elaborado no sistema (formato legado ou completo do wizard) */
  pei?: {
    objetivos: string;
    estrategias: string;
    responsavel: string;
    dataRevisao: string;
    dataRegistro?: string;
    /** Campos do PEI guiado (modelo Jonas) */
    capacidades?: string[];
    oQueSabe?: Record<string, string>;
    oQueGosta?: string[];
    necessidades?: string[];
    recursos?: string[];
    objetivosAcademicos?: Record<string, string>;
    objetivosSociais?: string[];
    metasCurtoPrazo?: Record<string, string>;
    metasLongoPrazo?: Record<string, string>;
  };
  /** PEI recomendado pela equipe, aguardando conclusão pelo professor (limpa quando pei for preenchido) */
  peiRecomendado?: { dataRecomendacao: string; prazo: string; areasAtencao: string[]; sugestoes?: string };
}

export interface Assessment {
  id: string;
  date: string;
  anoLetivo: number;
  bimestre: number;
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

  // Novos campos da Avaliação Guiada (Teste)
  sintomasIdentificados?: string[];
  acoesIniciais?: string[];
  outrosSintomas?: string;
  outraAcao?: string;
  frequenciaPorArea?: Record<string, string>;
}

export interface PsychAssessment {
  id: string;
  date: string;
  tipo: "Inicial" | "Reavaliação" | "Acompanhamento";
  classificacao: string; // Decisão da Equipe Multidisciplinar (valor de DECISAO_EQUIPE_OPTIONS)
  necessitaAcompanhamento: boolean; // derivado: "Não necessita acompanhamento" → false
  observacao: string;
  possuiPEI?: "Sim" | "Não" | "Em elaboração";
  responsavel?: string;
  potencialidades?: string;
  zdp?: string;
  queixaDescritiva?: string;
  pei?: { objetivos: string; estrategias: string; responsavel: string; dataRevisao: string };
  /** Recomendação de elaboração de PEI nesta avaliação */
  recomendaElaboracaoPEI?: boolean;
  areasAtencaoPEI?: string[];
  sugestoesPEI?: string;
  prazoPEI?: string;
}

export interface InterventionUpdate {
  id: string;
  date: string;
  time: string;
  author: string;
  content: string;
}

export interface Intervention {
  id: string;
  date: string;
  // A categoria de ação escolhida
  actionCategory: "Ações Internas" | "Acionar Família" | "Acionar Psicologia" | "Acionar Psicopedagogia" | "Equipe Multidisciplinar";
  // A ferramenta específica escolhida dentro do cardápio
  actionTool: string;
  objetivo: string;
  responsavel: string;
  // Status do Kanban
  status: "Aguardando" | "Em_Acompanhamento" | "Concluído";
  // Dados extras para o Kanban
  pendingUntil?: string; // Prazo estipulado para a ação resolver
  resolutionAta?: string; // Preenchimento obrigatório para fechar o ciclo
  updates?: InterventionUpdate[]; // Respostas diárias e andamento livre
  acceptedBy?: string; // Profissional Multidisciplinar que assumiu (se houve triagem/aceite)
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: "assessment" | "psych" | "intervention" | "referral" | "family_contact" | "potencialidades_registradas" | "pei_atualizado";
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
  role: "professor" | "psicologia" | "psicopedagogia" | "coordenacao" | "diretoria" | "admin";
  email: string;
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
    case "em_acompanhamento": return "Intervenções Pontuais";
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

export const INTERVENTION_TYPES = [
  "Alinhamento Interno (Coordenador + Professor)",
  "Comunicação à Família (Aviso formal)",
  "Orientação de Reforço Externo",
  "Acompanhamento Pedagógico (Interno)",
  "Adaptação de Material/Avaliação",
] as const;

export const PSYCH_CLASSIFICATIONS = [
  "Típico",
  "Observação",
  "Suspeita",
  "Neurodivergente",
] as const;

/** Decisão da Equipe Multidisciplinar — único campo sobre continuidade do acompanhamento */
export const DECISAO_EQUIPE_OPTIONS = [
  "Em escuta",
  "Em acompanhamento",
  "Encaminhamento externo em curso",
  "Não necessita acompanhamento",
] as const;

/** Áreas de atenção para orientar o professor na elaboração do PEI */
export const AREAS_ATENCAO_PEI = [
  "Leitura",
  "Escrita",
  "Matemática",
  "Atenção",
  "Comportamento",
  "Interação social",
  "Autonomia / organização",
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
