import { useApp } from "@/context/AppContext";
import { formatBRDate } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PsychAssessment, DECISAO_EQUIPE_OPTIONS, AREAS_ATENCAO_PEI, FamilyContact, StudentDocument } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { insertPsychAssessment, updateStudent, insertTimelineEvent, updateIntervention, upsertFamilyContact } from "@/lib/supabase-mutations";
import { Clock, BookOpen, Brain, Phone, FileText, Upload, Eye, ShieldAlert, CheckCircle2, UserPlus, ArrowRight, ArrowLeft, MessageSquare, PhoneCall } from "lucide-react";

const CONCEPT_RISK_COLOR: Record<string, string> = {
  "Defasada": "hsl(0, 72%, 51%)", "Defasado": "hsl(0, 72%, 51%)", "Insuficiente": "hsl(0, 72%, 51%)",
  "Em desenvolvimento": "hsl(45, 93%, 47%)", "Regular": "hsl(45, 93%, 47%)",
  "Adequada": "hsl(142, 71%, 45%)", "Adequado": "hsl(142, 71%, 45%)", "Bom": "hsl(142, 71%, 45%)",
  "Excelente": "hsl(142, 71%, 45%)",
};

const hasMultiIntervention = (s: { interventions: { actionCategory: string }[] }) =>
  s.interventions.some(i => ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory));

export default function PsychStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, setStudents, turmas, refetchStudents } = useApp();
  const student = students.find((s) => s.id === studentId);
  const [showForm, setShowForm] = useState(false);

  const isCriticalCase = Boolean(student?.criticalAlert);
  const [crisisResolved, setCrisisResolved] = useState(false);
  const [crisisNote, setCrisisNote] = useState("");
  const [crisisResolvedDate, setCrisisResolvedDate] = useState("");
  const [crisisArchived, setCrisisArchived] = useState(false);

  // Busca na linha do tempo se o professor já enviou o feedback de retorno
  const followUpEvent = student?.timeline.find(e => e.description.startsWith("Feedback Pós-Crise"));

  const [form, setForm] = useState({
    tipo: "",
    potencialidades: "",
    zdp: "",
    queixaDescritiva: "",
    decisaoEquipe: "",
    recomendaPEI: "",
    areasAtencaoPEI: [] as string[],
    sugestoesPEI: "",
    prazoPEI: "",
    peiObjetivos: "",
    peiEstrategias: "",
    peiResponsavel: "",
    peiDataRevisao: "",
    observacao: "",
  });
  const [openPedagogicalModal, setOpenPedagogicalModal] = useState(false);
  const [showFamilyContactModal, setShowFamilyContactModal] = useState(false);

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas?.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];
  const isReferred = student.psychReferral || hasMultiIntervention(student);

  const temPEI = !!student.pei;
  const peiRecomendadoPendente = !student.pei && !!student.peiRecomendado;

  const handleSave = async () => {
    if (!form.potencialidades?.trim()) {
      toast({ title: "Preencha as potencialidades (obrigatório)", variant: "destructive" });
      return;
    }
    if (!form.tipo || !form.decisaoEquipe) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (!temPEI && !peiRecomendadoPendente && form.recomendaPEI === "Sim" && (!form.prazoPEI || form.areasAtencaoPEI.length === 0)) {
      toast({ title: "Se recomenda PEI, informe as áreas de atenção e o prazo.", variant: "destructive" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const peiData = form.peiObjetivos?.trim() || form.peiEstrategias?.trim()
      ? { objetivos: form.peiObjetivos.trim(), estrategias: form.peiEstrategias.trim(), responsavel: form.peiResponsavel.trim() || "Equipe multidisciplinar", dataRevisao: form.peiDataRevisao || today, dataRegistro: today }
      : undefined;

    const recomendaPEI = !temPEI && !peiRecomendadoPendente && form.recomendaPEI === "Sim";

    const newPsych: PsychAssessment = {
      id: `pa${Date.now()}`,
      date: today,
      tipo: form.tipo as "Inicial" | "Reavaliação" | "Acompanhamento",
      classificacao: form.decisaoEquipe,
      necessitaAcompanhamento: form.decisaoEquipe !== "Não necessita acompanhamento",
      observacao: form.observacao,
      possuiPEI: peiData ? "Sim" : recomendaPEI ? "Em elaboração" : "Não",
      responsavel: "Dra. Fernanda Costa",
      potencialidades: form.potencialidades.trim(),
      zdp: form.zdp?.trim() || undefined,
      queixaDescritiva: form.queixaDescritiva?.trim() || undefined,
      pei: peiData,
      recomendaElaboracaoPEI: recomendaPEI || undefined,
      areasAtencaoPEI: recomendaPEI ? form.areasAtencaoPEI : undefined,
      sugestoesPEI: recomendaPEI ? form.sugestoesPEI?.trim() : undefined,
      prazoPEI: recomendaPEI ? form.prazoPEI : undefined,
    };

    try {
      await insertPsychAssessment(student!.id, {
        date: today,
        tipo: form.tipo as "Inicial" | "Reavaliação" | "Acompanhamento",
        classificacao: form.decisaoEquipe,
        necessita_acompanhamento: form.decisaoEquipe !== "Não necessita acompanhamento",
        observacao: form.observacao,
        possui_pei: peiData ? "Sim" : recomendaPEI ? "Em elaboração" : "Não",
        responsavel: "Dra. Fernanda Costa",
        potencialidades: form.potencialidades.trim(),
        zdp: form.zdp?.trim() || undefined,
        queixa_descritiva: form.queixaDescritiva?.trim() || undefined,
        pei: peiData ?? undefined,
        recomenda_elaboracao_pei: recomendaPEI || undefined,
        areas_atencao_pei: recomendaPEI ? form.areasAtencaoPEI : undefined,
        sugestoes_pei: recomendaPEI ? form.sugestoesPEI?.trim() : undefined,
        prazo_pei: recomendaPEI ? form.prazoPEI : undefined,
      });

      const studentUpdate: Parameters<typeof updateStudent>[1] = {
        potencialidades: form.potencialidades.trim(),
        zdp: form.zdp?.trim() || undefined,
      };
      if (peiData) {
        studentUpdate.pei = { ...(student!.pei as object || {}), ...peiData, dataRegistro: (student!.pei as { dataRegistro?: string })?.dataRegistro || today };
        studentUpdate.pei_recomendado = null;
      } else if (recomendaPEI) {
        studentUpdate.pei_recomendado = {
          dataRecomendacao: today,
          prazo: form.prazoPEI,
          areasAtencao: form.areasAtencaoPEI,
          sugestoes: form.sugestoesPEI?.trim(),
        };
      }
      await updateStudent(student!.id, studentUpdate);

      await insertTimelineEvent(student!.id, {
        date: today,
        type: "psych",
        description: `Avaliação psicopedagógica (${form.tipo}) realizada`,
      });
      if (peiData) {
        await insertTimelineEvent(student!.id, { date: today, type: "pei_atualizado", description: "PEI/Plano de desenvolvimento atualizado" });
      }
      if (recomendaPEI) {
        await insertTimelineEvent(student!.id, {
          date: today,
          type: "psych",
          description: `Recomendada elaboração de PEI pela equipe (prazo: ${formatBRDate(form.prazoPEI) || "—"})`,
        });
      }
      if (!student!.familyContact) {
        await upsertFamilyContact(student!.id, {
          tentativa1: { done: false, date: null },
          tentativa2: { done: false, date: null },
          tentativa3: { done: false, date: null },
        });
        await insertTimelineEvent(student!.id, {
          date: today,
          type: "family_contact",
          description: "Tarefa de contato com a família criada (WhatsApp, Ligação, Notificação Agenda)",
        });
      }

      await refetchStudents();
      toast({ title: "Avaliação psicopedagógica salva!" });
      setShowForm(false);
      setForm({ tipo: "", potencialidades: "", zdp: "", queixaDescritiva: "", decisaoEquipe: "", recomendaPEI: "", areasAtencaoPEI: [], sugestoesPEI: "", prazoPEI: "", peiObjetivos: "", peiEstrategias: "", peiResponsavel: "", peiDataRevisao: "", observacao: "" });
      setShowFamilyContactModal(true);
    } catch (e) {
      toast({ title: "Erro ao salvar avaliação", description: String(e), variant: "destructive" });
    }
  };

  const updateFamilyContact = async (updates: Partial<FamilyContact>) => {
    if (!student?.familyContact) return;
    try {
      const fc = student.familyContact;
      await upsertFamilyContact(student.id, {
        tentativa1: updates.tentativa1 ?? fc.tentativa1,
        tentativa2: updates.tentativa2 ?? fc.tentativa2,
        tentativa3: updates.tentativa3 ?? fc.tentativa3,
        houve_retorno: updates.houveRetorno ?? fc.houveRetorno,
        observacao: updates.observacao ?? fc.observacao,
      });
      await refetchStudents();
    } catch (e) {
      toast({ title: "Erro ao atualizar contato", description: String(e), variant: "destructive" });
    }
  };

  const handleAttemptToggle = async (attempt: "tentativa1" | "tentativa2" | "tentativa3", checked: boolean) => {
    if (!student) return;
    const fc = student.familyContact;
    if (!fc) {
      toast({ title: "Contato com família ainda não criado", variant: "destructive" });
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const canal = attempt === "tentativa1" ? "WhatsApp" : attempt === "tentativa2" ? "Ligação" : "Notificação Agenda";
    const next = { ...fc, [attempt]: { done: checked, date: checked ? today : null } };
    try {
      await upsertFamilyContact(student!.id, {
        tentativa1: next.tentativa1,
        tentativa2: next.tentativa2,
        tentativa3: next.tentativa3,
        houve_retorno: fc.houveRetorno,
        observacao: fc.observacao,
      });
      if (checked) {
        await insertTimelineEvent(student!.id, {
          date: today,
          type: "family_contact",
          description: `Contato com família: ${canal} realizado`,
        });
      }
      await refetchStudents();
    } catch (e) {
      toast({ title: "Erro ao registrar contato", description: String(e), variant: "destructive" });
    }
  };

  const handleDocUpload = () => {
    const newDoc: StudentDocument = {
      id: `doc${Date.now()}`,
      name: "Laudo.pdf",
      type: "pdf",
      date: new Date().toISOString().split("T")[0],
      responsavel: "Dra. Fernanda Costa",
      url: "#",
      docCategory: "laudo",
    };
    setStudents((prev) =>
      prev.map((s) => s.id === studentId ? { ...s, documents: [...s.documents, newDoc] } : s)
    );
    toast({ title: "Documento adicionado (simulação)!" });
  };

  const activeMultiInt = student.interventions.find(i =>
    ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory) && i.status !== "Concluído"
  );

  const handleAssumirCaso = async (responsavel: string) => {
    if (!activeMultiInt) return;
    try {
      await updateIntervention(activeMultiInt.id, {
        accepted_by: responsavel,
        status: "Em_Acompanhamento",
      });
      await insertTimelineEvent(student!.id, {
        date: new Date().toISOString().split("T")[0],
        type: "intervention",
        description: `Caso assumido por ${responsavel}`,
      });
      await refetchStudents();
      toast({ title: "Caso Assumido", description: `O caso foi atribuído à ${responsavel}` });
    } catch (e) {
      toast({ title: "Erro ao assumir caso", description: String(e), variant: "destructive" });
    }
  };

  const updateMedicacaoExterno = (updates: { medicacao?: string; acompanhamentoExterno?: string }) => {
    setStudents((prev) =>
      prev.map((s) => (s.id !== studentId ? s : { ...s, ...updates }))
    );
  };

  const isInTriage = activeMultiInt && !activeMultiInt.acceptedBy;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/psicologia")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground text-sm">{turma?.name} • Mat: {student.matricula}</p>
            </div>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>

        {!isReferred && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Este aluno não consta na fila de encaminhamentos da equipe multidisciplinar.</p>
            <p className="text-amber-700/90 mt-1">Você pode consultar as avaliações pedagógicas e a linha do tempo em modo leitura.</p>
          </div>
        )}

        {lastAssessment && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Relato do professor para a equipe
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{formatBRDate(lastAssessment.date)}</p>
                </div>
                <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => setOpenPedagogicalModal(true)}>
                  <Eye className="h-3.5 w-3.5" /> Ver avaliação pedagógica
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {lastAssessment.observacaoProfessor && (
                <p className="text-slate-700 italic">&quot;{lastAssessment.observacaoProfessor}&quot;</p>
              )}
              <p><span className="text-muted-foreground">Dificuldade percebida:</span>{" "}
                <Badge variant={lastAssessment.dificuldadePercebida ? "destructive" : "secondary"} className="text-xs">
                  {lastAssessment.dificuldadePercebida ? "Sim" : "Não"}
                </Badge>
              </p>
              {lastAssessment.sintomasIdentificados && lastAssessment.sintomasIdentificados.length > 0 && (
                <p className="text-slate-600">
                  <span className="font-medium text-slate-700">Sintomas citados:</span>{" "}
                  {lastAssessment.sintomasIdentificados.slice(0, 3).join("; ")}
                  {lastAssessment.sintomasIdentificados.length > 3 && " …"}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal: Avaliação Pedagógica completa */}
        <Dialog open={openPedagogicalModal} onOpenChange={setOpenPedagogicalModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="p-6 pb-4 border-b shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Avaliação Pedagógica
              </DialogTitle>
              {lastAssessment && <p className="text-xs text-muted-foreground">{formatBRDate(lastAssessment.date)}</p>}
            </DialogHeader>
            <div className="overflow-y-auto p-6 space-y-3 text-sm">
              {lastAssessment ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 p-3 border rounded-lg bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Conceito Geral</span>
                        <span className="w-fit font-bold rounded px-2 py-0.5 text-xs bg-slate-200 text-slate-700">{lastAssessment.conceitoGeral}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/60 p-2 rounded border border-slate-100">Avalie o aluno globalmente na comunidade escolar: assiduidade, capricho/organização (mochila, caderno, farda), disciplina geral e interação com colegas/professor.</p>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 border rounded-lg bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Leitura</span>
                        <span className={`w-fit font-bold rounded px-2 py-0.5 text-xs ${CONCEPT_RISK_COLOR[lastAssessment.leitura] === "hsl(0, 72%, 51%)" ? "bg-red-50 text-red-600" : CONCEPT_RISK_COLOR[lastAssessment.leitura] === "hsl(45, 93%, 47%)" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{lastAssessment.leitura}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/60 p-2 rounded border border-slate-100">Lê enunciados com autonomia pro ano escolar? A velocidade e fluência estão de acordo com o esperado (7-11 anos) ou há silabação excessiva?</p>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 border rounded-lg bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Escrita</span>
                        <span className={`w-fit font-bold rounded px-2 py-0.5 text-xs ${CONCEPT_RISK_COLOR[lastAssessment.escrita] === "hsl(0, 72%, 51%)" ? "bg-red-50 text-red-600" : CONCEPT_RISK_COLOR[lastAssessment.escrita] === "hsl(45, 93%, 47%)" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{lastAssessment.escrita}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/60 p-2 rounded border border-slate-100">Consegue formular frases e copiá-las do quadro no tempo hábil? Avalie erros ortográficos graves (trocas p/b, f/v não esperadas para a idade).</p>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 border rounded-lg bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Matemática</span>
                        <span className={`w-fit font-bold rounded px-2 py-0.5 text-xs ${CONCEPT_RISK_COLOR[lastAssessment.matematica] === "hsl(0, 72%, 51%)" ? "bg-red-50 text-red-600" : CONCEPT_RISK_COLOR[lastAssessment.matematica] === "hsl(45, 93%, 47%)" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{lastAssessment.matematica}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/60 p-2 rounded border border-slate-100">O aluno compreende o raciocínio das 4 operações adequadas à sua idade? Possui dificuldade extrema em montar/armar contas simples?</p>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 border rounded-lg bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Atenção</span>
                        <span className={`w-fit font-bold rounded px-2 py-0.5 text-xs ${CONCEPT_RISK_COLOR[lastAssessment.atencao] === "hsl(0, 72%, 51%)" ? "bg-red-50 text-red-600" : CONCEPT_RISK_COLOR[lastAssessment.atencao] === "hsl(45, 93%, 47%)" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{lastAssessment.atencao}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/60 p-2 rounded border border-slate-100">Foco em atividades da lousa ou silenciosas: O aluno dispersa muito rápido? Esquece instruções de 5 min atrás sistematicamente?</p>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 border rounded-lg bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Comportamento</span>
                        <span className={`w-fit font-bold rounded px-2 py-0.5 text-xs ${CONCEPT_RISK_COLOR[lastAssessment.comportamento] === "hsl(0, 72%, 51%)" ? "bg-red-50 text-red-600" : CONCEPT_RISK_COLOR[lastAssessment.comportamento] === "hsl(45, 93%, 47%)" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{lastAssessment.comportamento}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/60 p-2 rounded border border-slate-100">Apresenta impulsividade recorrente, agressividade (física/verbal), ou resistência forte a mudar rotinas e a ser contrariado?</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dificuldade percebida:</span>{" "}
                    <Badge variant={lastAssessment.dificuldadePercebida ? "destructive" : "secondary"} className="text-xs">
                      {lastAssessment.dificuldadePercebida ? "Sim" : "Não"}
                    </Badge>
                  </div>
                  {lastAssessment.sintomasIdentificados && lastAssessment.sintomasIdentificados.length > 0 && (
                    <div className="bg-red-50/50 rounded-lg p-3 space-y-3 text-sm border border-red-100">
                      <div>
                        <p className="text-xs font-bold text-red-800 bg-red-100/50 inline-block px-2 py-0.5 rounded">Manifestações e Sintomas Detectados</p>
                        <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-700">
                          {lastAssessment.sintomasIdentificados.map(s => <li key={s}>{s}</li>)}
                          {lastAssessment.outrosSintomas && <li>Outros: {lastAssessment.outrosSintomas}</li>}
                        </ul>
                      </div>
                      {lastAssessment.frequenciaPorArea && Object.keys(lastAssessment.frequenciaPorArea).length > 0 && (
                        <div className="pt-2 border-t border-red-100/60">
                          <p className="text-xs font-bold text-red-800 mb-1">Frequência por Área Defasada</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(lastAssessment.frequenciaPorArea).map(([k, v]) => (
                              <span key={k} className="text-xs bg-white border border-red-100 px-2 py-0.5 rounded text-slate-600">
                                <strong>{k}:</strong> {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {lastAssessment.acoesIniciais && lastAssessment.acoesIniciais.length > 0 && (
                    <div className="bg-orange-50/50 rounded-lg p-3 space-y-2 text-sm border border-orange-100">
                      <p className="text-xs font-bold text-orange-800 bg-orange-100/50 inline-block px-2 py-0.5 rounded">Plano de Ação em Execução (Professor)</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-700">
                        {lastAssessment.acoesIniciais.map(a => <li key={a}>{a}</li>)}
                        {lastAssessment.outraAcao && <li>Outras ações: {lastAssessment.outraAcao}</li>}
                      </ul>
                    </div>
                  )}
                  {lastAssessment.observacaoProfessor && (
                    <div className="bg-blue-50/50 rounded-lg p-3 space-y-1 border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Parecer Final do Professor</p>
                      <p className="text-sm italic text-slate-700">{lastAssessment.observacaoProfessor}</p>
                    </div>
                  )}
                  {(student.riskLevel !== "low" || lastAssessment.dificuldadePercebida) && (
                    <div className="bg-destructive/10 p-3 rounded-lg">
                      <p className="text-xs font-medium text-destructive mb-1">Motivo do Alerta</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.riskLevel === "high" && <Badge variant="destructive" className="text-xs">Alto risco</Badge>}
                        {student.riskLevel === "medium" && <Badge variant="default" className="text-xs">Médio risco</Badge>}
                        {lastAssessment.dificuldadePercebida && <Badge variant="outline" className="text-xs">Dificuldade percebida</Badge>}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma avaliação pedagógica registrada.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {activeMultiInt && (
          <div className={`p-4 rounded-xl border-l-4 shadow-sm mb-6 ${activeMultiInt.acceptedBy ? 'bg-indigo-50/50 border-indigo-400' : 'bg-amber-50 border-amber-400'}`}>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start">
              <div className="space-y-2 flex-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${activeMultiInt.acceptedBy ? 'text-indigo-800' : 'text-amber-800'}`}>
                  {activeMultiInt.acceptedBy ? <Brain className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {activeMultiInt.acceptedBy ? 'Acompanhamento Multidisciplinar' : 'Triagem Pendente (Fila Geral)'}
                </h3>
                <p className="text-xs text-slate-600">
                  Encaminhado em <strong>{formatBRDate(activeMultiInt.date)}</strong>
                  {activeMultiInt.pendingUntil && (
                    <> · Prazo: <strong>{formatBRDate(activeMultiInt.pendingUntil)}</strong> (48h úteis para primeira escuta)</>
                  )}
                </p>
                <p className="text-sm text-slate-700 bg-white/80 p-3 rounded border border-slate-100 italic leading-relaxed">
                  &quot;{activeMultiInt.objetivo || student.psychReferralReason || "Solicitação de acompanhamento."}&quot;
                </p>
                {activeMultiInt.updates && activeMultiInt.updates.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Andamento (coordenação)</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {activeMultiInt.updates.map((u) => (
                        <li key={u.id} className="flex gap-2 bg-white/80 p-2 rounded border border-slate-100">
                          <span className="text-xs text-muted-foreground shrink-0">{formatBRDate(u.date)} {u.time}</span>
                          <span className="text-xs text-slate-500 shrink-0">{u.author}:</span>
                          <span className="flex-1">{u.content}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="sm:min-w-[200px] flex flex-col gap-2 bg-white p-3 rounded border shadow-sm self-stretch justify-center items-center text-center">
                <p className="text-xs font-semibold text-slate-500 mb-1">{activeMultiInt.acceptedBy ? "Encarregado Atual" : "Atribuir Responsabilidade"}</p>
                {activeMultiInt.acceptedBy ? (
                  <div className="text-sm font-bold text-indigo-700 break-words w-full">
                    {activeMultiInt.acceptedBy}
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Nenhum profissional assumiu</span>
                )}
                <Select onValueChange={handleAssumirCaso}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={activeMultiInt.acceptedBy ? "Transferir Caso..." : "Assumir Caso"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dra. Fernanda (Psicologia)">Dra. Fernanda (Psicologia)</SelectItem>
                    <SelectItem value="Dra. Beatriz (Psicopedagogia)">Dra. Beatriz (Psicopedagogia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO DE GESTÃO DE RISCO (CRÍTICO) */}
        {!isInTriage && isCriticalCase && !crisisArchived && (
          <Card className={`border-red-500 transition-opacity duration-500 ${crisisResolved ? 'opacity-70 border-emerald-500' : 'shadow-red-900/10 shadow-lg'}`}>
            <CardHeader className={`${crisisResolved ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} border-b pb-4`}>
              <CardTitle className={`${crisisResolved ? 'text-emerald-800' : 'text-red-700'} flex items-center justify-between text-lg`}>
                <div className="flex items-center gap-2">
                  {crisisResolved ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5 animate-pulse" />}
                  Gestão de Risco / Ocorrência Crítica
                </div>
                {crisisResolved && <Badge className="bg-emerald-500 text-white border-0 hover:bg-emerald-600">Risco Mitigado</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relato Original (Prof. Larissa)</h4>
                  <p className={`text-sm bg-white p-3 rounded-md border italic leading-relaxed ${crisisResolved ? 'border-slate-200 text-slate-600' : 'border-red-100 text-red-950/80 shadow-sm'}`}>
                    "A aluna chegou chorando muito e recusou-se a falar com os colegas. Notamos que ela estava evitando o contato e com sinais de medo excessivo durante o recreio livre."
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${crisisResolved ? 'text-slate-500' : 'text-red-800'}`}>Nota da Coordenação</h4>
                  <p className={`text-sm p-3 rounded-md border italic leading-relaxed ${crisisResolved ? 'bg-white border-slate-200 text-slate-600' : 'bg-red-100/50 border-red-200 text-red-900 shadow-sm'}`}>
                    "O aluno apresentou choro constante e isolamento durante o recreio. Solicito avaliação urgente dos sintomas observados."
                  </p>
                </div>
              </div>

              {!crisisResolved ? (
                <div className="pt-4 border-t border-red-100 space-y-3">
                  <Label className="font-bold text-slate-800 text-sm">Ação Imediata (Atendimento Psicológico)</Label>
                  <p className="text-xs text-muted-foreground">Registre os protocolos adotados para conter a crise e estabilizar o(a) aluno(a).</p>
                  <Textarea
                    value={crisisNote}
                    onChange={(e) => setCrisisNote(e.target.value)}
                    placeholder="Ex: Realizada escuta ativa e exercícios de respiração. Aluna estabilizada. Acionada família para buscar na escola e encaminhamento para rede de saúde mental..."
                    className="min-h-[100px] bg-white border-slate-300"
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                      Encaminhar p/ Rede Hospitalar
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => {
                      if (crisisNote.trim() === "") {
                        toast({ title: "Atenção", description: "Registre a conduta antes de baixar o risco.", variant: "destructive" });
                        return;
                      }
                      setCrisisResolved(true);
                      setCrisisResolvedDate(new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }));
                      toast({ title: "Crise Mitigada", description: "O Risco foi baixado e o Coordenador foi notificado da estabilização.", className: "bg-emerald-600 text-white" });
                    }}>
                      Registrar Contenção e Baixar Risco
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-emerald-100 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-emerald-800 text-sm">Conduta Realizada pela Psicologia</Label>
                      <span className="text-xs text-emerald-600/80 font-medium">{crisisResolvedDate}</span>
                    </div>
                    <p className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded border border-emerald-100 italic">
                      {crisisNote}
                    </p>
                  </div>

                  {/* Mostra o feedback do professor se ele já gravou na timeline global */}
                  {followUpEvent ? (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold text-blue-800 text-sm flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          Retorno do Professor (Pós-Crise)
                        </Label>
                        <span className="text-xs text-blue-600/80 font-medium">{formatBRDate(followUpEvent.date)}</span>
                      </div>
                      <p className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded border border-blue-100 italic shadow-sm">
                        {followUpEvent.description}
                      </p>

                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCrisisArchived(true);
                            toast({ title: "Protocolo Encerrado", description: "Módulo de Gestão de Risco arquivado. Acesso agora apenas pelo histórico." });
                          }}
                          className="border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Arquivar Protocolo de Crise
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500 italic">
                      <Clock className="w-4 h-4 animate-spin-slow opacity-50" />
                      Aguardando professor(a) enviar o acompanhamento pós-crise no painel dele(a)...
                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Acompanhamento externo e medicação */}
        {!isInTriage && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4" /> Acompanhamento externo e medicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Medicação em uso</Label>
                <Input
                  placeholder="Ex.: Metilfenidato 10mg; nenhuma; em avaliação..."
                  value={student.medicacao ?? ""}
                  onChange={(e) => updateMedicacaoExterno({ medicacao: e.target.value || undefined })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Acompanhamento clínico/terapêutico externo</Label>
                <Textarea
                  placeholder="Ex.: CAPS Infantil 2x/semana; terapia particular; nenhum..."
                  value={student.acompanhamentoExterno ?? ""}
                  onChange={(e) => updateMedicacaoExterno({ acompanhamentoExterno: e.target.value || undefined })}
                  rows={2}
                  className="bg-white"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        {!isInTriage && (
          <Tabs defaultValue="psicologica" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="psicologica" className="text-xs sm:text-sm gap-1">
                <Brain className="h-3.5 w-3.5 hidden sm:inline" /> Av. Psicopedagógicas
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm gap-1">
                <Clock className="h-3.5 w-3.5 hidden sm:inline" /> Linha do Tempo
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Psych Assessments */}
            <TabsContent value="psicologica">
              <div className="space-y-4">
                {student.psychAssessments.length > 0 ? (
                  student.psychAssessments
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((pa) => (
                      <Card key={pa.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{pa.tipo}</CardTitle>
                            <span className="text-xs text-muted-foreground">{formatBRDate(pa.date)}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {pa.potencialidades && (
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-emerald-800 mb-1">Potencialidades (ZDR)</p>
                              <p className="text-slate-700">{pa.potencialidades}</p>
                            </div>
                          )}
                          {pa.zdp && (
                            <div><span className="text-muted-foreground">Objetivos (ZDP):</span> {pa.zdp}</div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Decisão da Equipe Multidisciplinar:</span>{" "}
                            <strong>{pa.classificacao}</strong>
                          </div>
                          {(pa.recomendaElaboracaoPEI || pa.possuiPEI) && (
                            <div>
                              <span className="text-muted-foreground">PEI:</span>{" "}
                              {pa.recomendaElaboracaoPEI ? (
                                <span className="text-amber-700 text-sm">Recomendada elaboração (prazo: {formatBRDate(pa.prazoPEI) || "—"})</span>
                              ) : (
                                <strong>{pa.possuiPEI || "N/A"}</strong>
                              )}
                              {pa.areasAtencaoPEI && pa.areasAtencaoPEI.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5">Áreas: {pa.areasAtencaoPEI.join(", ")}</p>
                              )}
                            </div>
                          )}
                          {pa.queixaDescritiva && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-800 mb-1">Queixa / Situação</p>
                              <p className="text-slate-700 italic">&quot;{pa.queixaDescritiva}&quot;</p>
                            </div>
                          )}
                          {pa.pei && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                              <p className="text-xs font-semibold text-slate-700 mb-1">PEI / Plano de desenvolvimento</p>
                              <p><span className="text-muted-foreground">Objetivos:</span> {pa.pei.objetivos}</p>
                              <p><span className="text-muted-foreground">Estratégias:</span> {pa.pei.estrategias}</p>
                              <p><span className="text-muted-foreground">Responsável:</span> {pa.pei.responsavel} · Revisão: {formatBRDate(pa.pei.dataRevisao)}</p>
                            </div>
                          )}
                          {pa.responsavel && <div><span className="text-muted-foreground">Responsável:</span> {pa.responsavel}</div>}
                          {pa.observacao && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground font-medium mb-1">Observação Técnica</p>
                              <p className="text-sm">{pa.observacao}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <Card><CardContent className="py-6 text-center text-muted-foreground">Nenhuma avaliação psicopedagógica registrada.</CardContent></Card>
                )}

                {/* New Assessment Form (Modal) */}
                <Button onClick={() => setShowForm(true)} className="w-full">Nova Avaliação Psicopedagógica</Button>

                <Dialog open={showForm} onOpenChange={setShowForm}>
                  <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Avaliação Psicopedagógica</DialogTitle>
                      <p className="text-xs text-muted-foreground">OQE e Psicologia Escolar Crítica — foco em potencialidades e linguagem descritiva.</p>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* 1. Potencialidades (obrigatório) — ZDR */}
                      <div className="space-y-1.5">
                        <Label>Potencialidades (ZDR) *</Label>
                        <Textarea
                          placeholder="O que esse aluno já faz bem? (em sala, no intervalo, em casa)"
                          value={form.potencialidades}
                          onChange={(e) => setForm((f) => ({ ...f, potencialidades: e.target.value }))}
                          rows={2}
                          className="bg-emerald-50/50 border-emerald-200"
                        />
                        <p className="text-[11px] text-muted-foreground">Registre primeiro o que o aluno já consegue para planejar os próximos passos (ZDP).</p>
                      </div>

                      {/* 2. Objetivos de desenvolvimento (ZDP) */}
                      <div className="space-y-1.5">
                        <Label>Objetivos de desenvolvimento (ZDP)</Label>
                        <Textarea
                          placeholder="Próximos passos que a rede pode apoiar"
                          value={form.zdp}
                          onChange={(e) => setForm((f) => ({ ...f, zdp: e.target.value }))}
                          rows={1}
                        />
                      </div>

                      {/* 3. Tipo */}
                      <div className="space-y-1.5">
                        <Label>Tipo *</Label>
                        <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            {["Inicial", "Reavaliação", "Acompanhamento"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 4. Queixa / Situação (linguagem descritiva) */}
                      <div className="space-y-1.5">
                        <Label>Queixa / Situação (linguagem descritiva)</Label>
                        <Textarea
                          placeholder="Descreva a situação (evite rótulos; ex.: 'demonstra necessidade de apoio para manter a atenção em tarefas de leitura')."
                          value={form.queixaDescritiva}
                          onChange={(e) => setForm((f) => ({ ...f, queixaDescritiva: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      {/* 5. Decisão da Equipe Multidisciplinar */}
                      <div className="space-y-1.5">
                        <Label>Decisão da Equipe Multidisciplinar *</Label>
                        <p className="text-[11px] text-muted-foreground">Escolha em que ponto o caso está e se seguirá ou não em acompanhamento pela equipe.</p>
                        <Select value={form.decisaoEquipe} onValueChange={(v) => setForm((f) => ({ ...f, decisaoEquipe: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            {DECISAO_EQUIPE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 6. PEI — contexto por estado (não tem / tem / recomendado pendente) */}
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">PEI / Plano de Desenvolvimento</h4>

                        {temPEI && (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                            <p className="text-sm text-slate-700">
                              PEI registrado em <strong>{formatBRDate(student.pei?.dataRegistro) || "—"}</strong>. Objetivos: {student.pei?.objetivos ? `${student.pei.objetivos.slice(0, 80)}${student.pei.objetivos.length > 80 ? "…" : ""}` : "—"}
                            </p>
                            <Button type="button" variant="link" className="h-auto p-0 text-emerald-700" onClick={() => setShowForm(false)}>
                              Ver PEI na ficha
                            </Button>
                            <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                              <p className="text-xs font-medium text-slate-600">Atualizar PEI nesta avaliação (opcional)</p>
                              <div className="grid gap-2">
                                <Input value={form.peiObjetivos} onChange={(e) => setForm((f) => ({ ...f, peiObjetivos: e.target.value }))} placeholder="Objetivos de aprendizagem" className="text-sm" />
                                <Textarea value={form.peiEstrategias} onChange={(e) => setForm((f) => ({ ...f, peiEstrategias: e.target.value }))} placeholder="Estratégias de mediação" rows={2} className="text-sm" />
                                <div className="flex gap-2 flex-wrap">
                                  <Input value={form.peiResponsavel} onChange={(e) => setForm((f) => ({ ...f, peiResponsavel: e.target.value }))} placeholder="Responsável" className="flex-1 min-w-[120px] text-sm" />
                                  <Input type="date" value={form.peiDataRevisao} onChange={(e) => setForm((f) => ({ ...f, peiDataRevisao: e.target.value }))} className="w-[140px] text-sm" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {peiRecomendadoPendente && student.peiRecomendado && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-slate-700">
                            PEI recomendado pela equipe em <strong>{formatBRDate(student.peiRecomendado.dataRecomendacao)}</strong>. Prazo: <strong>{formatBRDate(student.peiRecomendado.prazo)}</strong>. Aguardando conclusão pelo professor.
                          </div>
                        )}

                        {!temPEI && !peiRecomendadoPendente && (
                          <>
                            <div className="space-y-1.5">
                              <Label>Recomenda elaboração de PEI?</Label>
                              <Select value={form.recomendaPEI} onValueChange={(v) => setForm((f) => ({ ...f, recomendaPEI: v }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sim">Sim</SelectItem>
                                  <SelectItem value="Não">Não</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {form.recomendaPEI === "Sim" && (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-xs">Áreas de atenção para o professor</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {AREAS_ATENCAO_PEI.map((area) => (
                                      <label key={area} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <Checkbox
                                          checked={form.areasAtencaoPEI.includes(area)}
                                          onCheckedChange={(c) =>
                                            setForm((f) => ({
                                              ...f,
                                              areasAtencaoPEI: c ? [...f.areasAtencaoPEI, area] : f.areasAtencaoPEI.filter((a) => a !== area),
                                            }))
                                          }
                                        />
                                        {area}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Sugestões para o professor</Label>
                                  <Textarea value={form.sugestoesPEI} onChange={(e) => setForm((f) => ({ ...f, sugestoesPEI: e.target.value }))} placeholder="Ex.: Priorizar objetivos curtos em leitura; uso de material com apoio visual" rows={2} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Prazo para conclusão do PEI *</Label>
                                  <Input type="date" value={form.prazoPEI} onChange={(e) => setForm((f) => ({ ...f, prazoPEI: e.target.value }))} />
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      {/* 9. Observação Técnica */}
                      <div className="space-y-1.5">
                        <Label>Observação Técnica</Label>
                        <p className="text-[11px] text-muted-foreground">
                          Registre o que observou no atendimento com a criança: como reagiu, contexto da sessão ou impressões que não cabem nos outros campos.
                        </p>
                        <p className="text-[11px] text-muted-foreground italic">
                          Ex.: Durante a leitura compartilhada manteve atenção; relatou que em casa gosta de desenhar.
                        </p>
                        <Textarea
                          value={form.observacao}
                          onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                          placeholder="Ex.: Demonstrou dificuldade em falar sobre a escola; combinado retomar no próximo encontro."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="flex-1">Salvar</Button>
                        <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Modal Contato com Família (abre após salvar avaliação — estilo OC-1) */}
                <Dialog open={showFamilyContactModal} onOpenChange={setShowFamilyContactModal}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-emerald-600" /> Contato com a Família
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Registre as tentativas de comunicação (mesmos critérios do coordenador).
                      </p>
                    </DialogHeader>
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-600">Canais de Contato</p>
                      <div className="grid gap-2">
                        <Button
                          variant="outline"
                          className="justify-start gap-3 h-auto py-3 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => {
                            handleAttemptToggle("tentativa1", true);
                            toast({ title: "Registro salvo", description: "Envio (WhatsApp) registrado na timeline." });
                          }}
                        >
                          <MessageSquare className="h-4 w-4 text-emerald-600" />
                          <div className="text-left">
                            <span className="font-medium">Registrar Envio (WhatsApp)</span>
                            <p className="text-[10px] text-muted-foreground font-normal">Registra disparo na timeline.</p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start gap-3 h-auto py-3 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => {
                            handleAttemptToggle("tentativa2", true);
                            toast({ title: "Registro salvo", description: "Ligação registrada na timeline." });
                          }}
                        >
                          <PhoneCall className="h-4 w-4 text-blue-600" />
                          <div className="text-left">
                            <span className="font-medium">Registrar Ligação</span>
                            <p className="text-[10px] text-muted-foreground font-normal">Registra a tentativa na timeline.</p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start gap-3 h-auto py-3 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => {
                            handleAttemptToggle("tentativa3", true);
                            toast({ title: "Registro salvo", description: "Recado via Agenda registrado na timeline." });
                          }}
                        >
                          <FileText className="h-4 w-4 text-amber-600" />
                          <div className="text-left">
                            <span className="font-medium">Registrar Recado via Agenda</span>
                            <p className="text-[10px] text-muted-foreground font-normal">Registra envio na timeline.</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="outline" onClick={() => setShowFamilyContactModal(false)}>Fechar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* TAB 2: Timeline */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Linha do Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.timeline
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((event) => {
                        const iconColor = {
                          assessment: "bg-blue-500",
                          psych: "bg-purple-500",
                          intervention: "bg-amber-500",
                          referral: "bg-red-500",
                          family_contact: "bg-green-500",
                          potencialidades_registradas: "bg-emerald-500",
                          pei_atualizado: "bg-indigo-500",
                        }[event.type] || "bg-primary";

                        return (
                          <div key={event.id} className="flex gap-3 items-start">
                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${iconColor} flex-shrink-0`} />
                            <div>
                              <p className="text-sm">{event.description}</p>
                              <p className="text-xs text-muted-foreground">{formatBRDate(event.date)}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Documents Section */}
        {!isInTriage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documentos do Aluno (laudo, etc.)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.documents.length > 0 ? (
                student.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{doc.name}</p>
                          {doc.docCategory && (
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {doc.docCategory === "laudo" ? "Laudo" : doc.docCategory === "pei" ? "PEI" : "Outro"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatBRDate(doc.date)} • {doc.responsavel}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-2">Nenhum documento registrado.</p>
              )}
              <p className="text-[11px] text-muted-foreground pt-1">O PEI é elaborado e registrado no sistema (avaliação psicopedagógica), não por upload.</p>
              <div className="pt-2">
                <Button variant="outline" className="gap-2" onClick={handleDocUpload}>
                  <Upload className="h-4 w-4" /> Upload Laudo (Simulado)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
