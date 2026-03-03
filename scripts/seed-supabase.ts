/**
 * Script para popular o Supabase SIMP com dados iniciais.
 * Usa SUPABASE_URL e SUPABASE_ANON_KEY (ou VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) do .env.
 *
 * Uso: npm run seed:supabase
 * Ou:  npx tsx scripts/seed-supabase.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types";
import { users, turmas, seedStudents } from "./seed-data";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Defina no .env:\n" +
      "  SUPABASE_URL (já existe)\n" +
      "  SUPABASE_ANON_KEY ou SUPABASE_PUBLISHABLE_KEY\n\n" +
      "Encontre a chave anon em: Supabase Dashboard → Project Settings → API → anon public"
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, key);

const userIdByEmail: Record<string, string> = {};
const turmaIdByName: Record<string, string> = {};
const studentIdByMockId: Record<string, string> = {};
const interventionIdByMockId: Record<string, string> = {};

async function main() {
  // 1. Inserir profiles (se não existirem)
  for (const u of users) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", u.email)
      .single();
    if (existing) {
      userIdByEmail[u.email] = existing.id;
      console.log(`Profile ${u.email} já existe`);
    } else {
      const { data: inserted, error } = await supabase
        .from("profiles")
        .insert({ name: u.name, email: u.email, role: u.role })
        .select("id")
        .single();
      if (error) throw error;
      if (inserted) userIdByEmail[u.email] = inserted.id;
      console.log(`Profile ${u.email} inserido`);
    }
  }

  const professorIdByMockId: Record<string, string> = {};
  for (const u of users) {
    professorIdByMockId[u.id] = userIdByEmail[u.email];
  }

  // 2. Inserir turmas (se não existirem)
  for (const t of turmas) {
    const profId = professorIdByMockId[t.professorId];
    const { data: existing } = await supabase
      .from("turmas")
      .select("id")
      .eq("name", t.name)
      .single();
    if (existing) {
      turmaIdByName[t.name] = existing.id;
      await supabase.from("turmas").update({ professor_id: profId }).eq("id", existing.id);
      console.log(`Turma ${t.name} já existe, professor_id atualizado`);
    } else {
      const { data: inserted, error } = await supabase
        .from("turmas")
        .insert({ name: t.name, turno: t.turno, professor_id: profId })
        .select("id")
        .single();
      if (error) throw error;
      if (inserted) turmaIdByName[t.name] = inserted.id;
      console.log(`Turma ${t.name} inserida`);
    }
  }

  // 3. Inserir students
  for (const s of seedStudents) {
    const turmaId = turmaIdByName[
      turmas.find((t) => t.id === s.turmaId)?.name ?? ""
    ];
    if (!turmaId) throw new Error(`Turma não encontrada para ${s.turmaId}`);

    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("matricula", s.matricula)
      .single();

    if (existing) {
      studentIdByMockId[s.id] = existing.id;
      console.log(`Aluno ${s.matricula} (${s.name}) já existe, ignorando inserção`);
    } else {
      const { data: inserted, error } = await supabase
        .from("students")
        .insert({
          name: s.name,
          matricula: s.matricula,
          turma_id: turmaId,
          risk_level: s.riskLevel,
          last_assessment_date: s.lastAssessmentDate || null,
          psych_referral: s.psychReferral,
          psych_referral_reason: s.psychReferralReason ?? null,
          critical_alert: s.criticalAlert ?? false,
          medicacao: s.medicacao ?? null,
          acompanhamento_externo: s.acompanhamentoExterno ?? null,
          potencialidades: s.potencialidades ?? null,
          zdp: s.zdp ?? null,
          pei: s.pei ?? null,
          pei_recomendado: s.peiRecomendado ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (inserted) studentIdByMockId[s.id] = inserted.id;
    }
  }
  console.log(`${seedStudents.length} alunos processados`);

  // 4. Inserir assessments
  for (const s of seedStudents) {
    const studentId = studentIdByMockId[s.id];
    if (!studentId) continue;
    for (const a of s.assessments) {
      await supabase.from("assessments").insert({
        student_id: studentId,
        date: a.date,
        ano_letivo: a.anoLetivo,
        bimestre: a.bimestre,
        conceito_geral: a.conceitoGeral,
        leitura: a.leitura,
        escrita: a.escrita,
        matematica: a.matematica,
        atencao: a.atencao,
        comportamento: a.comportamento,
        dificuldade_percebida: a.dificuldadePercebida,
        observacao_professor: a.observacaoProfessor ?? null,
        principal_dificuldade: a.principalDificuldade ?? null,
        recorrente_ou_recente: a.recorrenteOuRecente ?? null,
        estrategia_em_sala: a.estrategiaEmSala ?? null,
        sintomas_identificados: a.sintomasIdentificados ?? null,
        acoes_iniciais: a.acoesIniciais ?? null,
        outros_sintomas: a.outrosSintomas ?? null,
        outra_acao: a.outraAcao ?? null,
        frequencia_por_area: a.frequenciaPorArea ?? null,
      });
    }
  }
  console.log("Assessments inseridos");

  // 5. Inserir psych_assessments
  for (const s of seedStudents) {
    const studentId = studentIdByMockId[s.id];
    if (!studentId) continue;
    for (const pa of s.psychAssessments) {
      await supabase.from("psych_assessments").insert({
        student_id: studentId,
        date: pa.date,
        tipo: pa.tipo,
        classificacao: pa.classificacao,
        necessita_acompanhamento: pa.necessitaAcompanhamento,
        observacao: pa.observacao ?? "",
        possui_pei: pa.possuiPEI ?? null,
        responsavel: pa.responsavel ?? null,
        potencialidades: pa.potencialidades ?? null,
        zdp: pa.zdp ?? null,
        queixa_descritiva: pa.queixaDescritiva ?? null,
        pei: pa.pei ?? null,
        recomenda_elaboracao_pei: pa.recomendaElaboracaoPEI ?? null,
        areas_atencao_pei: pa.areasAtencaoPEI ?? null,
        sugestoes_pei: pa.sugestoesPEI ?? null,
        prazo_pei: pa.prazoPEI ?? null,
      });
    }
  }
  console.log("Psych assessments inseridos");

  // 6. Inserir interventions
  for (const s of seedStudents) {
    const studentId = studentIdByMockId[s.id];
    if (!studentId) continue;
    for (const i of s.interventions) {
      const { data: inserted, error } = await supabase
        .from("interventions")
        .insert({
          student_id: studentId,
          date: i.date,
          action_category: i.actionCategory,
          action_tool: i.actionTool,
          objetivo: i.objetivo,
          responsavel: i.responsavel,
          status: i.status,
          pending_until: i.pendingUntil ?? null,
          resolution_ata: i.resolutionAta ?? null,
          accepted_by: i.acceptedBy ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (inserted) interventionIdByMockId[i.id] = inserted.id;
    }
  }
  console.log("Interventions inseridas");

  // 7. Inserir intervention_updates
  for (const s of seedStudents) {
    for (const i of s.interventions) {
      const interventionId = interventionIdByMockId[i.id];
      if (!interventionId || !i.updates) continue;
      for (const u of i.updates) {
        await supabase.from("intervention_updates").insert({
          intervention_id: interventionId,
          date: u.date,
          time: u.time,
          author: u.author,
          content: u.content,
        });
      }
    }
  }
  console.log("Intervention updates inseridos");

  // 8. Inserir family_contacts
  for (const s of seedStudents) {
    if (!s.familyContact) continue;
    const studentId = studentIdByMockId[s.id];
    if (!studentId) continue;
    const fc = s.familyContact;
    await supabase.from("family_contacts").insert({
      student_id: studentId,
      tentativa1: fc.tentativa1,
      tentativa2: fc.tentativa2,
      tentativa3: fc.tentativa3,
      houve_retorno: fc.houveRetorno ?? null,
      observacao: fc.observacao ?? "",
    });
  }
  console.log("Family contacts inseridos");

  // 9. Inserir student_documents
  for (const s of seedStudents) {
    const studentId = studentIdByMockId[s.id];
    if (!studentId || !s.documents?.length) continue;
    for (const d of s.documents) {
      await supabase.from("student_documents").insert({
        student_id: studentId,
        name: d.name,
        type: d.type,
        date: d.date,
        responsavel: d.responsavel,
        url: d.url,
        doc_category: d.docCategory ?? null,
      });
    }
  }
  console.log("Student documents inseridos");

  // 10. Inserir timeline_events
  for (const s of seedStudents) {
    const studentId = studentIdByMockId[s.id];
    if (!studentId) continue;
    for (const te of s.timeline) {
      await supabase.from("timeline_events").insert({
        student_id: studentId,
        date: te.date,
        type: te.type,
        description: te.description,
      });
    }
  }
  console.log("Timeline events inseridos");

  // 11. Inserir critical_occurrences (s1 - Laura Barbosa)
  const s1 = seedStudents.find((s) => s.criticalAlert);
  if (s1) {
    const studentId = studentIdByMockId[s1.id];
    if (studentId) {
      const { data: occ } = await supabase
        .from("critical_occurrences")
        .insert({
          student_id: studentId,
          status: "Em Tratativa",
          categories: ["Mudança brusca de humor", "Isolamento severo social"],
          description:
            "A aluna chegou chorando muito e recusou-se a falar com os colegas. Notamos que ela estava evitando o contato e com sinais de medo excessivo durante o recreio livre.",
          reported_by: "Profa. Larissa",
        })
        .select("id")
        .single();
      if (occ) {
        await supabase.from("critical_occurrence_logs").insert([
          {
            occurrence_id: occ.id,
            time: "14:02",
            author: "Prof. Larissa",
            text: "Registrou Ocorrência Crítica no sistema.",
          },
          {
            occurrence_id: occ.id,
            time: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            author: "Coordenação",
            text: "Assumiu a tratativa do caso.",
          },
        ]);
        console.log("Critical occurrence (OC-1) inserida");
      }
    }
  }

  console.log("\n✅ Seed concluído com sucesso!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
