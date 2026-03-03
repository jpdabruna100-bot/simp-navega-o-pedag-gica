/**
 * Mutations para persistir alterações no Supabase.
 * Cada função retorna Promise e deve ser seguida de refetchStudents para atualizar a UI.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Assessment, Intervention, InterventionUpdate } from "@/data/mockData";

export async function insertAssessment(studentId: string, assessment: Assessment): Promise<void> {
  const { error } = await supabase.from("assessments").insert({
    student_id: studentId,
    date: assessment.date,
    ano_letivo: assessment.anoLetivo,
    bimestre: assessment.bimestre,
    conceito_geral: assessment.conceitoGeral,
    leitura: assessment.leitura,
    escrita: assessment.escrita,
    matematica: assessment.matematica,
    atencao: assessment.atencao,
    comportamento: assessment.comportamento,
    dificuldade_percebida: assessment.dificuldadePercebida,
    observacao_professor: assessment.observacaoProfessor ?? null,
    principal_dificuldade: assessment.principalDificuldade ?? null,
    recorrente_ou_recente: assessment.recorrenteOuRecente ?? null,
    estrategia_em_sala: assessment.estrategiaEmSala ?? null,
    sintomas_identificados: assessment.sintomasIdentificados ?? null,
    acoes_iniciais: assessment.acoesIniciais ?? null,
    outros_sintomas: assessment.outrosSintomas ?? null,
    outra_acao: assessment.outraAcao ?? null,
    frequencia_por_area: assessment.frequenciaPorArea ?? null,
  });
  if (error) throw error;
}

export async function updateStudent(studentId: string, data: {
  risk_level?: string;
  last_assessment_date?: string | null;
  pei?: object | null;
  pei_recomendado?: object | null;
  potencialidades?: string | null;
  zdp?: string | null;
  medicacao?: string | null;
  acompanhamento_externo?: string | null;
  psych_referral?: boolean;
  psych_referral_reason?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("students").update(data).eq("id", studentId);
  if (error) throw error;
}

export async function insertTimelineEvent(
  studentId: string,
  event: { date: string; type: string; description: string }
): Promise<void> {
  const { error } = await supabase.from("timeline_events").insert({
    student_id: studentId,
    date: event.date,
    type: event.type as "assessment" | "psych" | "intervention" | "referral" | "family_contact" | "potencialidades_registradas" | "pei_atualizado",
    description: event.description,
  });
  if (error) throw error;
}

export async function insertIntervention(
  studentId: string,
  intervention: Pick<Intervention, "date" | "actionCategory" | "actionTool" | "objetivo" | "responsavel" | "status" | "pendingUntil" | "acceptedBy">
): Promise<string> {
  const { data, error } = await supabase
    .from("interventions")
    .insert({
      student_id: studentId,
      date: intervention.date,
      action_category: intervention.actionCategory,
      action_tool: intervention.actionTool,
      objetivo: intervention.objetivo,
      responsavel: intervention.responsavel,
      status: intervention.status ?? "Aguardando",
      pending_until: intervention.pendingUntil ?? null,
      accepted_by: intervention.acceptedBy ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateIntervention(
  interventionId: string,
  data: {
    action_category?: string;
    action_tool?: string;
    objetivo?: string;
    status?: string;
    pending_until?: string | null;
    resolution_ata?: string | null;
    accepted_by?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("interventions").update(data).eq("id", interventionId);
  if (error) throw error;
}

export async function insertInterventionUpdate(
  interventionId: string,
  update: { date: string; time: string; author: string; content: string }
): Promise<void> {
  const { error } = await supabase.from("intervention_updates").insert({
    intervention_id: interventionId,
    date: update.date,
    time: update.time,
    author: update.author,
    content: update.content,
  });
  if (error) throw error;
}

export async function insertPsychAssessment(studentId: string, data: {
  date: string;
  tipo: "Inicial" | "Reavaliação" | "Acompanhamento";
  classificacao: string;
  necessita_acompanhamento: boolean;
  observacao: string;
  possui_pei?: string | null;
  responsavel?: string | null;
  potencialidades?: string | null;
  zdp?: string | null;
  pei?: object | null;
  queixa_descritiva?: string | null;
  recomenda_elaboracao_pei?: boolean | null;
  areas_atencao_pei?: string[] | null;
  sugestoes_pei?: string | null;
  prazo_pei?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("psych_assessments").insert({
    student_id: studentId,
    date: data.date,
    tipo: data.tipo,
    classificacao: data.classificacao,
    necessita_acompanhamento: data.necessita_acompanhamento,
    observacao: data.observacao,
    possui_pei: data.possui_pei ?? null,
    responsavel: data.responsavel ?? null,
    potencialidades: data.potencialidades ?? null,
    zdp: data.zdp ?? null,
    pei: data.pei ?? null,
    queixa_descritiva: data.queixa_descritiva ?? null,
    recomenda_elaboracao_pei: data.recomenda_elaboracao_pei ?? null,
    areas_atencao_pei: data.areas_atencao_pei ?? null,
    sugestoes_pei: data.sugestoes_pei ?? null,
    prazo_pei: data.prazo_pei ?? null,
  });
  if (error) throw error;
}

export async function updatePsychAssessment(
  psychAssessmentId: string,
  data: { classificacao?: string; observacao?: string; possui_pei?: string | null; pei?: object | null; potencialidades?: string | null; zdp?: string | null }
): Promise<void> {
  const { error } = await supabase.from("psych_assessments").update(data).eq("id", psychAssessmentId);
  if (error) throw error;
}

export async function upsertFamilyContact(studentId: string, data: {
  tentativa1: { done: boolean; date: string | null };
  tentativa2: { done: boolean; date: string | null };
  tentativa3: { done: boolean; date: string | null };
  houve_retorno?: boolean | null;
  observacao?: string;
}): Promise<void> {
  const { data: existing } = await supabase.from("family_contacts").select("id").eq("student_id", studentId).single();
  if (existing) {
    const { error } = await supabase.from("family_contacts").update(data).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("family_contacts").insert({
      student_id: studentId,
      tentativa1: data.tentativa1,
      tentativa2: data.tentativa2,
      tentativa3: data.tentativa3,
      houve_retorno: data.houve_retorno ?? null,
      observacao: data.observacao ?? "",
    });
    if (error) throw error;
  }
}

export async function insertStudentDocument(studentId: string, doc: {
  name: string; type: "pdf" | "image" | "doc"; date: string; responsavel: string; url: string; doc_category?: "laudo" | "pei" | "outro";
}): Promise<void> {
  const { error } = await supabase.from("student_documents").insert({
    student_id: studentId,
    name: doc.name,
    type: doc.type,
    date: doc.date,
    responsavel: doc.responsavel,
    url: doc.url,
    doc_category: doc.doc_category ?? null,
  });
  if (error) throw error;
}
