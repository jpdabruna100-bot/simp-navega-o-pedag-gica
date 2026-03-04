/**
 * Queries e transformadores para buscar dados do Supabase
 * e mapear para os tipos de domínio (Student, Turma, User).
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  Student,
  Turma,
  User,
  Assessment,
  PsychAssessment,
  Intervention,
  InterventionUpdate,
  FamilyContact,
  StudentDocument,
  TimelineEvent,
} from "@/data/mockData";

export async function fetchProfiles(): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
  }));
}

export type ProfileInsert = { name: string; email: string; role: User["role"] };

export async function insertProfile(profile: ProfileInsert): Promise<User> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ name: profile.name, email: profile.email.trim(), role: profile.role })
    .select("id, name, email, role")
    .single();
  if (error) throw error;
  const r = data as { id: string; name: string; email: string; role: string };
  return { id: r.id, name: r.name, email: r.email, role: r.role as User["role"] };
}

export async function fetchTurmas(): Promise<Turma[]> {
  const { data, error } = await supabase.from("turmas").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    turno: r.turno,
    professorId: r.professor_id ?? "",
  }));
}

export async function fetchStudents(): Promise<Student[]> {
  const { data: studentsData, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .order("name");
  if (studentsError) throw studentsError;
  if (!studentsData?.length) return [];

  const studentIds = studentsData.map((s) => s.id);

  const [assessmentsRes, psychRes, interventionsRes, familyRes, docsRes, timelineRes] = await Promise.all([
    supabase.from("assessments").select("*").in("student_id", studentIds),
    supabase.from("psych_assessments").select("*").in("student_id", studentIds),
    supabase.from("interventions").select("*").in("student_id", studentIds),
    supabase.from("family_contacts").select("*").in("student_id", studentIds),
    supabase.from("student_documents").select("*").in("student_id", studentIds),
    supabase.from("timeline_events").select("*").in("student_id", studentIds).order("date", { ascending: false }),
  ]);

  const interventionIds = (interventionsRes.data ?? []).map((i) => i.id);
  const updatesRes =
    interventionIds.length > 0
      ? await supabase.from("intervention_updates").select("*").in("intervention_id", interventionIds)
      : { data: [] };

  const assessmentsByStudent = new Map<string, Assessment[]>();
  for (const a of assessmentsRes.data ?? []) {
    const list = assessmentsByStudent.get(a.student_id) ?? [];
    list.push(mapAssessment(a));
    assessmentsByStudent.set(a.student_id, list);
  }

  const psychByStudent = new Map<string, PsychAssessment[]>();
  for (const p of psychRes.data ?? []) {
    const list = psychByStudent.get(p.student_id) ?? [];
    list.push(mapPsychAssessment(p));
    psychByStudent.set(p.student_id, list);
  }

  const updatesByIntervention = new Map<string, InterventionUpdate[]>();
  for (const u of updatesRes.data ?? []) {
    const list = updatesByIntervention.get(u.intervention_id) ?? [];
    list.push({
      id: u.id,
      date: u.date,
      time: u.time,
      author: u.author,
      content: u.content,
    });
    updatesByIntervention.set(u.intervention_id, list);
  }

  const interventionsByStudent = new Map<string, Intervention[]>();
  for (const i of interventionsRes.data ?? []) {
    const list = interventionsByStudent.get(i.student_id) ?? [];
    list.push(mapIntervention(i, updatesByIntervention.get(i.id) ?? []));
    interventionsByStudent.set(i.student_id, list);
  }

  const familyByStudent = new Map<string, FamilyContact>();
  for (const f of familyRes.data ?? []) {
    familyByStudent.set(f.student_id, mapFamilyContact(f));
  }

  const docsByStudent = new Map<string, StudentDocument[]>();
  for (const d of docsRes.data ?? []) {
    const list = docsByStudent.get(d.student_id) ?? [];
    list.push(mapStudentDocument(d));
    docsByStudent.set(d.student_id, list);
  }

  const timelineByStudent = new Map<string, TimelineEvent[]>();
  for (const t of timelineRes.data ?? []) {
    const list = timelineByStudent.get(t.student_id) ?? [];
    list.push({ id: t.id, date: t.date, type: t.type, description: t.description });
    timelineByStudent.set(t.student_id, list);
  }
  timelineByStudent.forEach((list) => list.sort((a, b) => b.date.localeCompare(a.date)));

  return studentsData.map((s) => mapStudent(s, {
    assessments: assessmentsByStudent.get(s.id) ?? [],
    psychAssessments: psychByStudent.get(s.id) ?? [],
    interventions: interventionsByStudent.get(s.id) ?? [],
    familyContact: familyByStudent.get(s.id),
    documents: docsByStudent.get(s.id) ?? [],
    timeline: timelineByStudent.get(s.id) ?? [],
  }));
}

function mapStudent(
  r: { id: string; name: string; matricula: string; turma_id: string; risk_level: string; last_assessment_date: string | null; psych_referral: boolean; psych_referral_reason: string | null; critical_alert: boolean | null; medicacao: string | null; acompanhamento_externo: string | null; potencialidades: string | null; zdp: string | null; pei: unknown; pei_recomendado: unknown },
  extra: { assessments: Assessment[]; psychAssessments: PsychAssessment[]; interventions: Intervention[]; familyContact?: FamilyContact; documents: StudentDocument[]; timeline: TimelineEvent[] }
): Student {
  const pei = r.pei as Student["pei"];
  const peiRec = r.pei_recomendado as Student["peiRecomendado"];
  return {
    id: r.id,
    name: r.name,
    matricula: r.matricula,
    turmaId: r.turma_id,
    riskLevel: r.risk_level as Student["riskLevel"],
    lastAssessmentDate: r.last_assessment_date ?? "",
    psychReferral: r.psych_referral,
    psychReferralReason: r.psych_referral_reason ?? undefined,
    criticalAlert: r.critical_alert ?? undefined,
    medicacao: r.medicacao ?? undefined,
    acompanhamentoExterno: r.acompanhamento_externo ?? undefined,
    potencialidades: r.potencialidades ?? undefined,
    zdp: r.zdp ?? undefined,
    pei: pei ?? undefined,
    peiRecomendado: peiRec ?? undefined,
    assessments: extra.assessments,
    psychAssessments: extra.psychAssessments,
    interventions: extra.interventions,
    familyContact: extra.familyContact,
    documents: extra.documents,
    timeline: extra.timeline,
  };
}

function mapAssessment(r: Record<string, unknown>): Assessment {
  return {
    id: r.id as string,
    date: r.date as string,
    anoLetivo: r.ano_letivo as number,
    bimestre: r.bimestre as number,
    conceitoGeral: r.conceito_geral as string,
    leitura: r.leitura as string,
    escrita: r.escrita as string,
    matematica: r.matematica as string,
    atencao: r.atencao as string,
    comportamento: r.comportamento as string,
    dificuldadePercebida: r.dificuldade_percebida as boolean,
    observacaoProfessor: (r.observacao_professor as string) ?? undefined,
    principalDificuldade: (r.principal_dificuldade as string) ?? undefined,
    recorrenteOuRecente: (r.recorrente_ou_recente as string) ?? undefined,
    estrategiaEmSala: (r.estrategia_em_sala as string) ?? undefined,
    sintomasIdentificados: (r.sintomas_identificados as string[]) ?? undefined,
    acoesIniciais: (r.acoes_iniciais as string[]) ?? undefined,
    outrosSintomas: (r.outros_sintomas as string) ?? undefined,
    outraAcao: (r.outra_acao as string) ?? undefined,
    frequenciaPorArea: (r.frequencia_por_area as Record<string, string>) ?? undefined,
  };
}

function mapPsychAssessment(r: Record<string, unknown>): PsychAssessment {
  return {
    id: r.id as string,
    date: r.date as string,
    tipo: r.tipo as PsychAssessment["tipo"],
    classificacao: r.classificacao as string,
    necessitaAcompanhamento: r.necessita_acompanhamento as boolean,
    observacao: (r.observacao as string) ?? "",
    possuiPEI: (r.possui_pei as PsychAssessment["possuiPEI"]) ?? undefined,
    responsavel: (r.responsavel as string) ?? undefined,
    potencialidades: (r.potencialidades as string) ?? undefined,
    zdp: (r.zdp as string) ?? undefined,
    queixaDescritiva: (r.queixa_descritiva as string) ?? undefined,
    pei: (r.pei as PsychAssessment["pei"]) ?? undefined,
    recomendaElaboracaoPEI: (r.recomenda_elaboracao_pei as boolean) ?? undefined,
    areasAtencaoPEI: (r.areas_atencao_pei as string[]) ?? undefined,
    sugestoesPEI: (r.sugestoes_pei as string) ?? undefined,
    prazoPEI: (r.prazo_pei as string) ?? undefined,
  };
}

function mapIntervention(r: Record<string, unknown>, updates: InterventionUpdate[]): Intervention {
  return {
    id: r.id as string,
    date: r.date as string,
    actionCategory: r.action_category as Intervention["actionCategory"],
    actionTool: r.action_tool as string,
    objetivo: r.objetivo as string,
    responsavel: r.responsavel as string,
    status: r.status as Intervention["status"],
    pendingUntil: (r.pending_until as string) ?? undefined,
    resolutionAta: (r.resolution_ata as string) ?? undefined,
    acceptedBy: (r.accepted_by as string) ?? undefined,
    updates: updates.length ? updates : undefined,
  };
}

function mapFamilyContact(r: Record<string, unknown>): FamilyContact {
  const t1 = (r.tentativa1 as { done?: boolean; date?: string | null }) ?? { done: false, date: null };
  const t2 = (r.tentativa2 as { done?: boolean; date?: string | null }) ?? { done: false, date: null };
  const t3 = (r.tentativa3 as { done?: boolean; date?: string | null }) ?? { done: false, date: null };
  return {
    id: r.id as string,
    studentId: r.student_id as string,
    tentativa1: { done: t1.done ?? false, date: t1.date ?? null },
    tentativa2: { done: t2.done ?? false, date: t2.date ?? null },
    tentativa3: { done: t3.done ?? false, date: t3.date ?? null },
    houveRetorno: (r.houve_retorno as boolean | null) ?? null,
    observacao: (r.observacao as string) ?? "",
  };
}

function mapStudentDocument(r: Record<string, unknown>): StudentDocument {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as StudentDocument["type"],
    date: r.date as string,
    responsavel: r.responsavel as string,
    url: r.url as string,
    docCategory: (r.doc_category as StudentDocument["docCategory"]) ?? undefined,
  };
}
