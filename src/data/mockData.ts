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
  /** PEI/PDI elaborado no sistema */
  pei?: { objetivos: string; estrategias: string; responsavel: string; dataRevisao: string; dataRegistro?: string };
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
  { id: "u7", name: "Dra. Beatriz Souza", role: "psicopedagogia", email: "beatriz@simp.edu" },
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

function generateStudents(turmaId: string, count: number, startIdx: number): Student[] {
  return Array.from({ length: count }, (_, i) => {
    let risk = randomRisk();
    const id = `s${startIdx + i}`;
    let name = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    const mat = `2025${turmaId.replace("t", "")}${String(i + 1).padStart(3, "0")}`;
    let hasPsych = risk === "high" || (risk === "medium" && Math.random() > 0.5);

    if (id === "s1") {
      name = "Laura Barbosa";
      risk = "high";
      hasPsych = true;
    }
    const isCriticalAlert = id === "s1"; // Encaminhamento crítico (OC-1) para painel Psicologia

    const levelByRisk = (r: RiskLevel, bim: number) => {
      // Simulate progression over bimesters
      if (r === "high") {
        if (bim <= 2) return { l: "Defasada", e: "Defasada", m: "Defasada", a: "Defasada", c: "Defasado", cg: "Insuficiente" };
        if (bim === 3) return { l: "Em desenvolvimento", e: "Defasada", m: "Em desenvolvimento", a: "Em desenvolvimento", c: "Adequado", cg: "Regular" };
        return { l: "Em desenvolvimento", e: "Em desenvolvimento", m: "Em desenvolvimento", a: "Adequada", c: "Adequado", cg: "Regular" };
      }
      if (r === "medium") {
        if (bim <= 2) return { l: "Em desenvolvimento", e: randomFrom(["Adequada", "Em desenvolvimento"]), m: "Em desenvolvimento", a: "Adequada", c: "Adequado", cg: "Regular" };
        return { l: "Adequada", e: "Adequada", m: "Adequada", a: "Adequada", c: "Adequado", cg: "Bom" };
      }
      return { l: "Adequada", e: "Adequada", m: "Adequada", a: "Adequada", c: "Adequado", cg: randomFrom(["Bom", "Excelente"]) };
    };

    const bimestreDates: Record<number, Record<number, string>> = {
      2024: { 1: "2024-03-20", 2: "2024-06-15", 3: "2024-09-10", 4: "2024-11-25" },
      2025: { 1: "2025-03-18", 2: "2025-06-12", 3: "2025-09-15", 4: "2025-11-20" },
    };

    const mockSintomas = risk === "high"
      ? ["Dificuldade em decodificar/ler isoladamente", "Troca, omissão ou acréscimo de letras (sons semelhantes)", "Dificuldade em armar e efetuar contas"]
      : risk === "medium"
        ? ["Dificuldade em manter atenção nas aulas", "Lentidão na aprendizagem da leitura"]
        : [];

    const mockAcoes = risk === "high"
      ? ["Fiz sondagens diagnósticas pontuais de leitura", "Adaptei tamanho das atividades e espaçamentos"]
      : risk === "medium"
        ? ["Mudei de lugar (foco na lousa / longe de distrações)"]
        : [];

    const mockFrequenciaPorArea = risk !== "low" ? {
      "Leitura": randomFrom(["Diariamente", "Semanalmente", "Mensalmente"]),
      "Escrita": randomFrom(["Diariamente", "Semanalmente", "Mensalmente"]),
      "Matemática": randomFrom(["Diariamente", "Semanalmente", "Mensalmente"]),
      "Atenção": randomFrom(["Diariamente", "Semanalmente", "Mensalmente"]),
      "Comportamento": randomFrom(["Diariamente", "Semanalmente", "Mensalmente"]),
    } : undefined;

    const assessments: Assessment[] = [];
    // 2024: generate 4 bimesters
    for (let bim = 1; bim <= 4; bim++) {
      const lvl = levelByRisk(risk, bim);
      assessments.push({
        id: `a${id}-2024-b${bim}`,
        date: bimestreDates[2024][bim],
        anoLetivo: 2024,
        bimestre: bim,
        conceitoGeral: lvl.cg,
        leitura: lvl.l,
        escrita: lvl.e,
        matematica: lvl.m,
        atencao: lvl.a,
        comportamento: lvl.c,
        dificuldadePercebida: risk !== "low" && bim <= 2,
        observacaoProfessor: risk !== "low" && bim <= 2 ? "Aluno apresenta dificuldades recorrentes em atividades de leitura e escrita." : undefined,
        sintomasIdentificados: risk !== "low" ? mockSintomas : undefined,
        acoesIniciais: risk !== "low" ? mockAcoes : undefined,
        frequenciaPorArea: risk !== "low" ? mockFrequenciaPorArea : undefined,
      });
    }
    // 2025: generate 2 bimesters (current year in progress)
    for (let bim = 1; bim <= 2; bim++) {
      const lvl = levelByRisk(risk, bim);
      assessments.push({
        id: `a${id}-2025-b${bim}`,
        date: bimestreDates[2025][bim],
        anoLetivo: 2025,
        bimestre: bim,
        conceitoGeral: lvl.cg,
        leitura: lvl.l,
        escrita: lvl.e,
        matematica: lvl.m,
        atencao: lvl.a,
        comportamento: lvl.c,
        dificuldadePercebida: risk !== "low",
        observacaoProfessor: risk !== "low" ? "Aluno apresenta dificuldades recorrentes em atividades de leitura e escrita." : undefined,
        sintomasIdentificados: risk !== "low" ? mockSintomas : undefined,
        acoesIniciais: risk !== "low" ? mockAcoes : undefined,
      });
    }

    // Alguns encaminhados já foram avaliados e não necessitam acompanhamento (status Concluído)
    const concluidoSemAcompanhamento = hasPsych && (startIdx + i) % 4 === 0;
    const psychAssessments: PsychAssessment[] = hasPsych ? [{
      id: `pa${id}`,
      date: "2025-02-01",
      tipo: "Inicial",
      classificacao: concluidoSemAcompanhamento ? "Típico" : (risk === "high" ? "Neurodivergente" : "Suspeita"),
      necessitaAcompanhamento: !concluidoSemAcompanhamento,
      observacao: concluidoSemAcompanhamento
        ? "Avaliação inicial concluída. Aluno dentro do esperado para a idade, sem necessidade de acompanhamento periódico."
        : "Aluno apresenta necessidades que requerem intervenções pontuais na escola.",
      possuiPEI: risk === "high" && !concluidoSemAcompanhamento ? "Em elaboração" : "Não",
      responsavel: randomFrom(["Dra. Fernanda Costa", "Dra. Beatriz Souza"]),
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
      date: "2025-01-20",
      actionCategory: randomFrom(["Ações Internas", "Acionar Família", "Acionar Psicologia", "Equipe Multidisciplinar"] as const),
      actionTool: randomFrom(["Alinhamento Interno", "Comunicado Oficial", "Reunião Presencial", "Pendente de Avaliação Clínica/Triagem"]),
      objetivo: "Melhorar desempenho acadêmico e comportamental",
      responsavel: "Coord. Marcos Lima",
      status: randomFrom(["Aguardando", "Concluído", "Em_Acompanhamento"] as const),
      pendingUntil: Math.random() > 0.5 ? "2025-03-10" : undefined,
    }] : [];

    // Assign 'acceptedBy' to "Multi" interventions not in triage
    interventions.forEach(i => {
      if (["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory)) {
        if (i.status !== "Aguardando" || Math.random() > 0.5) {
          i.acceptedBy = randomFrom(["Dra. Fernanda (Psicologia)", "Dra. Beatriz (Psicopedagogia)"]);
        }
      }
    });

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
        { id: `doc${id}`, name: "Laudo_Neuropsicologico.pdf", type: "pdf" as const, date: "2025-02-15", responsavel: "Dra. Fernanda Costa", url: "#", docCategory: "laudo" as const },
      ] : [],
      criticalAlert: isCriticalAlert,
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

// s1: PEI já registrado (para testar bloco "PEI registrado" no modal de avaliação psicopedagógica)
const s1Override = initialStudents.find((s) => s.id === "s1");
if (s1Override) {
  s1Override.potencialidades = "Boa interação com colegas; interesse por desenhos e histórias orais.";
  s1Override.zdp = "Ampliar tempo de atenção em leitura compartilhada.";
  s1Override.pei = {
    objetivos: "Fortalecer atenção em leitura e escrita; organizar rotina de tarefas.",
    estrategias: "Leitura compartilhada; pausas entre tarefas; checklist diário.",
    responsavel: "Prof. regente + AEE",
    dataRevisao: "2025-06-15",
    dataRegistro: "2025-02-10",
  };
  const lastPa = s1Override.psychAssessments[s1Override.psychAssessments.length - 1] as PsychAssessment | undefined;
  if (lastPa) {
    lastPa.pei = s1Override.pei;
    lastPa.possuiPEI = "Sim";
  }
}

// Alunos com plano já aplicado (determinístico para testar "Ver plano estratégico")
const s7 = initialStudents.find((s) => s.id === "s7");
if (s7) {
  s7.riskLevel = "high";
  s7.interventions = [{
    id: "ints7",
    date: "2025-01-20",
    actionCategory: "Acionar Família",
    actionTool: "Registrar Envio (WhatsApp)",
    objetivo: "Reforço na leitura em casa e acompanhamento das atividades. Reunião com responsáveis agendada.",
    responsavel: "Coord. Marcos Lima",
    status: "Em_Acompanhamento",
    pendingUntil: "2024-12-15", // Intencionalmente atrasado
    updates: [
      {
        id: "up1",
        date: "2025-01-20",
        time: "14:15",
        author: "Coord. Marcos Lima",
        content: "Tratativa iniciada. Mensagem programada no Bling."
      },
      {
        id: "up2",
        date: "2025-01-22",
        time: "09:30",
        author: "Coord. Marcos Lima",
        content: "Mãe visualizou a mensagem mas não respondeu. Realizei uma tentativa de ligação que caiu na caixa postal."
      }
    ]
  }];
}

// Painel /psicologia: aluno em "Em Avaliação Inicial" (caso assumido, ainda sem avaliação registrada)
const s2 = initialStudents.find((s) => s.id === "s2");
if (s2) {
  s2.psychReferral = true;
  s2.psychAssessments = []; // Sem avaliação ainda → getPsychStatus "pendente" → coluna Em Avaliação Inicial
  s2.riskLevel = "medium";
  s2.interventions = [{
    id: "ints2",
    date: "2025-02-20",
    actionCategory: "Acionar Psicologia",
    actionTool: "Avaliação Inicial",
    objetivo: "Avaliar queixas de desatenção e dificuldade de organização em sala.",
    responsavel: "Coord. Marcos Lima",
    status: "Em_Acompanhamento",
    pendingUntil: "2025-04-15",
    acceptedBy: "Dra. Fernanda (Psicologia)", // Filtro "Meus Casos" Psicologia
  }];
}

// Painel /psicologia: caso com Dra. Beatriz para filtro "Meus Casos" Psicopedagogia
const s3 = initialStudents.find((s) => s.id === "s3");
if (s3) {
  s3.psychReferral = true;
  s3.riskLevel = "medium";
  s3.interventions = [{
    id: "ints3",
    date: "2025-02-01",
    actionCategory: "Acionar Psicopedagogia",
    actionTool: "Avaliação Cognitiva Básica",
    objetivo: "Investigar dificuldades de leitura e escrita relatadas pelo professor.",
    responsavel: "Coord. Marcos Lima",
    status: "Em_Acompanhamento",
    pendingUntil: "2025-04-30",
    acceptedBy: "Dra. Beatriz (Psicopedagogia)", // Filtro "Meus Casos" Psicopedagogia
  }];
  // Garantir que está em Intervenções Pontuais (já tem avaliação e necessita acompanhamento)
  if (s3.psychAssessments.length === 0) {
    s3.psychAssessments = [{
      id: "pa-s3",
      date: "2025-02-15",
      tipo: "Inicial",
      classificacao: "Suspeita",
      necessitaAcompanhamento: true,
      observacao: "Aluno em processo de avaliação psicopedagógica. Encaminhado para intervenções pontuais.",
      possuiPEI: "Não",
      responsavel: "Dra. Beatriz Souza",
    }];
  } else {
    (s3.psychAssessments[s3.psychAssessments.length - 1] as PsychAssessment).necessitaAcompanhamento = true;
  }
}

const s5 = initialStudents.find((s) => s.id === "s5");
if (s5) {
  s5.riskLevel = "high";
  s5.interventions = [{
    id: "ints5",
    date: "2025-02-25",
    actionCategory: "Acionar Psicologia",
    actionTool: "Avaliação Urgente",
    objetivo: "Sintomas depressivos relatados. Necessita triagem e acolhimento imediato.",
    responsavel: "Coord. Marcos Lima",
    status: "Em_Acompanhamento",
    pendingUntil: "2025-03-05", // Dentro do prazo
    // acceptedBy está undefined de propósito! (simulando que está na fila sem dono)
    updates: [
      {
        id: "up-s5-1",
        date: "2025-02-25",
        time: "08:30",
        author: "Coord. Marcos Lima",
        content: "Tratativa iniciada. Caso grave e urgente delegado para a caixa de triagem da equipe multi."
      }
    ]
  }];
}

const s6 = initialStudents.find((s) => s.id === "s6");
if (s6) {
  s6.riskLevel = "medium";
  s6.interventions = [{
    id: "ints6",
    date: "2025-02-10",
    actionCategory: "Acionar Psicopedagogia",
    actionTool: "Avaliação Cognitiva Básica",
    objetivo: "Investigar possível dislexia ou déficit de atenção relatado nas aulas de Matemática.",
    responsavel: "Coord. Marcos Lima",
    status: "Em_Acompanhamento",
    pendingUntil: "2025-05-20", // Pendente mas no prazo
    acceptedBy: "Dra. Fernanda C.",
    updates: [
      {
        id: "up-s6-1",
        date: "2025-02-10",
        time: "10:00",
        author: "Coord. Marcos Lima",
        content: "Tratativa iniciada. Encaminhando para avaliação psicopedagógica externa."
      }
    ]
  }];
}

const s8 = initialStudents.find((s) => s.id === "s8");
if (s8) {
  s8.riskLevel = "medium";
  s8.interventions = [{
    id: "ints8",
    date: "2025-01-10",
    actionCategory: "Ações Internas",
    actionTool: "Reforço no Contraturno",
    objetivo: "Melhorar desempenho acadêmico e comportamental.",
    responsavel: "Coord. Marcos Lima",
    status: "Concluído",
    pendingUntil: "2025-02-28",
    resolutionAta: "Ciclo encerrado em 2025-02-28. Aluno apresentou evolução satisfatória no reforço. Recomenda-se acompanhamento contínuo nas próximas avaliações.",
  }];
  // PEI recomendado pela equipe, aguardando conclusão pelo professor (testar bloco "aguardando conclusão")
  s8.peiRecomendado = {
    dataRecomendacao: "2025-02-18",
    prazo: "2025-04-30",
    areasAtencao: ["Leitura", "Atenção"],
    sugestoes: "Priorizar objetivos curtos em leitura; uso de material com apoio visual.",
  };
}

// OBRIGATÓRIO: Forçar o caso do aluno s28 (Pedro Santos) para demonstrar a evolução de 6 pontos de avaliação
const pSantos = initialStudents.find(s => s.id === "s28");
if (pSantos) {
  pSantos.name = "Pedro Santos";
  pSantos.riskLevel = "medium";
  pSantos.psychReferral = true;
  pSantos.psychReferralReason = "Professor observou agitação atípica seguida de choro constante em Matemática. Dificuldades em pareamento de números.";
  pSantos.assessments = [
    {
      id: "a-p1",
      date: "2025-02-15",
      anoLetivo: 2025,
      bimestre: 1,
      conceitoGeral: "Insuficiente",
      leitura: "Defasada",
      escrita: "Defasada",
      matematica: "Defasada",
      atencao: "Defasada",
      comportamento: "Defasado",
      dificuldadePercebida: true,
      observacaoProfessor: "Muitas dificuldades na adaptação inicial.",
      sintomasIdentificados: ["Dificuldade de concentração", "Choro sem motivo aparente"],
    },
    {
      id: "a-p2",
      date: "2025-04-10",
      anoLetivo: 2025,
      bimestre: 1,
      conceitoGeral: "Insuficiente",
      leitura: "Em desenvolvimento",
      escrita: "Defasada",
      matematica: "Defasada",
      atencao: "Defasada",
      comportamento: "Regular",
      dificuldadePercebida: true,
      acoesIniciais: ["Reforço no contraturno aplicado"],
    },
    {
      id: "a-p3",
      date: "2025-06-20",
      anoLetivo: 2025,
      bimestre: 2,
      conceitoGeral: "Regular",
      leitura: "Em desenvolvimento",
      escrita: "Em desenvolvimento",
      matematica: "Defasada",
      atencao: "Em desenvolvimento",
      comportamento: "Regular",
      dificuldadePercebida: true,
    },
    {
      id: "a-p4",
      date: "2025-08-15",
      anoLetivo: 2025,
      bimestre: 3,
      conceitoGeral: "Regular",
      leitura: "Adequada",
      escrita: "Em desenvolvimento",
      matematica: "Em desenvolvimento",
      atencao: "Adequada",
      comportamento: "Adequado",
      dificuldadePercebida: false,
    },
    {
      id: "a-p5",
      date: "2025-10-05",
      anoLetivo: 2025,
      bimestre: 4,
      conceitoGeral: "Bom",
      leitura: "Adequada",
      escrita: "Adequada",
      matematica: "Em desenvolvimento",
      atencao: "Adequada",
      comportamento: "Adequado",
      dificuldadePercebida: false,
    },
    {
      id: "a-p6",
      date: "2025-11-28",
      anoLetivo: 2025,
      bimestre: 4,
      conceitoGeral: "Excelente",
      leitura: "Adequada",
      escrita: "Adequada",
      matematica: "Adequada",
      atencao: "Adequada",
      comportamento: "Adequado",
      dificuldadePercebida: false,
      observacaoProfessor: "Incrível recuperação ao longo do ano. Respondeu super bem ao tratamento psicopedagógico em Matemática.",
    }
  ];
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
