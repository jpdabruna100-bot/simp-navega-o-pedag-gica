/**
 * Dados mínimos para seed inicial do Supabase.
 * Usado exclusivamente pelo scripts/seed-supabase.ts.
 * O app em produção utiliza dados reais do Supabase.
 */
import type { User, Turma, Student } from "../src/data/mockData";

export const users: User[] = [
  { id: "u1", name: "Larissa Souza", email: "larissa@escola.edu.br", role: "professor" },
  { id: "u2", name: "Marcos Lima", email: "marcos@escola.edu.br", role: "coordenacao" },
  { id: "u3", name: "Dra. Fernanda Costa", email: "fernanda@escola.edu.br", role: "psicologia" },
  { id: "u4", name: "Dra. Beatriz Souza", email: "beatriz@escola.edu.br", role: "psicopedagogia" },
  { id: "u5", name: "Admin Sistema", email: "admin@escola.edu.br", role: "admin" },
];

export const turmas: Turma[] = [
  { id: "t1", name: "1º Ano A", turno: "Matutino", professorId: "u1" },
  { id: "t2", name: "1º Ano B", turno: "Matutino", professorId: "u1" },
  { id: "t3", name: "2º Ano A", turno: "Vespertino", professorId: "u1" },
];

export const seedStudents: Student[] = [
  {
    id: "s1",
    name: "Laura Barbosa",
    matricula: "20251001",
    turmaId: "t1",
    riskLevel: "high",
    lastAssessmentDate: "2025-01-15",
    psychReferral: true,
    criticalAlert: true,
    assessments: [
      {
        id: "a-s1-1",
        date: "2025-01-15",
        anoLetivo: 2025,
        bimestre: 1,
        conceitoGeral: "Insuficiente",
        leitura: "Defasada",
        escrita: "Defasada",
        matematica: "Defasada",
        atencao: "Defasada",
        comportamento: "Defasado",
        dificuldadePercebida: true,
        observacaoProfessor: "Aluna apresenta dificuldades recorrentes.",
        sintomasIdentificados: ["Dificuldade em decodificar", "Troca de letras"],
        acoesIniciais: ["Fiz sondagens diagnósticas", "Adaptei atividades"],
      },
    ],
    psychAssessments: [
      {
        id: "pa-s1",
        date: "2025-02-01",
        tipo: "Inicial",
        classificacao: "Neurodivergente",
        necessitaAcompanhamento: true,
        observacao: "Aluno requer intervenções pontuais na escola.",
        possuiPEI: "Em elaboração",
        responsavel: "Dra. Fernanda Costa",
      },
    ],
    interventions: [
      {
        id: "int-s1",
        date: "2025-01-20",
        actionCategory: "Acionar Psicologia",
        actionTool: "Avaliação Inicial",
        objetivo: "Melhorar desempenho acadêmico e comportamental",
        responsavel: "Coord. Marcos Lima",
        status: "Em_Acompanhamento",
        pendingUntil: "2025-04-15",
        acceptedBy: "Dra. Fernanda (Psicologia)",
      },
    ],
    timeline: [
      { id: "tl1-s1", date: "2025-01-15", type: "assessment", description: "Avaliação pedagógica realizada" },
      { id: "tl2-s1", date: "2025-01-18", type: "referral", description: "Encaminhado para avaliação psicopedagógica" },
      { id: "tl3-s1", date: "2025-02-01", type: "psych", description: "Avaliação psicopedagógica realizada" },
    ],
    familyContact: {
      id: "fc-s1",
      studentId: "s1",
      tentativa1: { done: true, date: "2025-02-05" },
      tentativa2: { done: false, date: null },
      tentativa3: { done: false, date: null },
      houveRetorno: null,
      observacao: "",
    },
    documents: [
      { id: "doc-s1", name: "Laudo_Neuropsicologico.pdf", type: "pdf", date: "2025-02-15", responsavel: "Dra. Fernanda Costa", url: "#", docCategory: "laudo" },
    ],
  },
  {
    id: "s2",
    name: "Pedro Santos",
    matricula: "20251002",
    turmaId: "t1",
    riskLevel: "medium",
    lastAssessmentDate: "2025-02-15",
    psychReferral: true,
    psychReferralReason: "Professor observou dificuldades em Matemática.",
    assessments: [
      {
        id: "a-s2-1",
        date: "2025-02-15",
        anoLetivo: 2025,
        bimestre: 1,
        conceitoGeral: "Regular",
        leitura: "Em desenvolvimento",
        escrita: "Em desenvolvimento",
        matematica: "Defasada",
        atencao: "Em desenvolvimento",
        comportamento: "Regular",
        dificuldadePercebida: true,
      },
    ],
    psychAssessments: [],
    interventions: [
      {
        id: "int-s2",
        date: "2025-02-20",
        actionCategory: "Acionar Psicopedagogia",
        actionTool: "Avaliação Cognitiva Básica",
        objetivo: "Investigar dificuldades de leitura e escrita.",
        responsavel: "Coord. Marcos Lima",
        status: "Em_Acompanhamento",
        pendingUntil: "2025-04-30",
        acceptedBy: "Dra. Beatriz (Psicopedagogia)",
      },
    ],
    timeline: [
      { id: "tl1-s2", date: "2025-02-15", type: "assessment", description: "Avaliação pedagógica realizada" },
      { id: "tl2-s2", date: "2025-02-20", type: "intervention", description: "Intervenção iniciada" },
    ],
    documents: [],
  },
  {
    id: "s3",
    name: "Ana Costa",
    matricula: "20251003",
    turmaId: "t1",
    riskLevel: "low",
    lastAssessmentDate: "2025-01-10",
    psychReferral: false,
    assessments: [
      {
        id: "a-s3-1",
        date: "2025-01-10",
        anoLetivo: 2025,
        bimestre: 1,
        conceitoGeral: "Bom",
        leitura: "Adequada",
        escrita: "Adequada",
        matematica: "Adequada",
        atencao: "Adequada",
        comportamento: "Adequado",
        dificuldadePercebida: false,
      },
    ],
    psychAssessments: [],
    interventions: [],
    timeline: [{ id: "tl1-s3", date: "2025-01-10", type: "assessment", description: "Avaliação pedagógica realizada" }],
    documents: [],
  },
];
