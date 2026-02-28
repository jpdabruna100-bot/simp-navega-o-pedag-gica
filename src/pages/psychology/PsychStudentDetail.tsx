import { useApp } from "@/context/AppContext";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { turmas, PsychAssessment, PSYCH_CLASSIFICATIONS, PEI_OPTIONS, getFamilyContactStatusLabel, FamilyContact, StudentDocument } from "@/data/mockData";
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
import { toast } from "@/hooks/use-toast";
import { Clock, BookOpen, Brain, Phone, FileText, Upload, Eye, ShieldAlert, CheckCircle2, UserPlus, ArrowRight } from "lucide-react";

const CONCEPT_RISK_COLOR: Record<string, string> = {
  "Defasada": "hsl(0, 72%, 51%)", "Defasado": "hsl(0, 72%, 51%)", "Insuficiente": "hsl(0, 72%, 51%)",
  "Em desenvolvimento": "hsl(45, 93%, 47%)", "Regular": "hsl(45, 93%, 47%)",
  "Adequada": "hsl(142, 71%, 45%)", "Adequado": "hsl(142, 71%, 45%)", "Bom": "hsl(142, 71%, 45%)",
  "Excelente": "hsl(142, 71%, 45%)",
};

export default function PsychStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const student = students.find((s) => s.id === studentId);
  const [showForm, setShowForm] = useState(false);

  const isCriticalCase = studentId === "s1";
  const [crisisResolved, setCrisisResolved] = useState(false);
  const [crisisNote, setCrisisNote] = useState("");
  const [crisisResolvedDate, setCrisisResolvedDate] = useState("");
  const [crisisArchived, setCrisisArchived] = useState(false);

  // Busca na linha do tempo se o professor já enviou o feedback de retorno
  const followUpEvent = student?.timeline.find(e => e.description.startsWith("Feedback Pós-Crise"));

  const [form, setForm] = useState({
    tipo: "",
    classificacao: "",
    necessitaAcompanhamento: "",
    observacao: "",
    possuiPEI: "",
  });

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

  const handleSave = () => {
    if (!form.tipo || !form.classificacao || !form.necessitaAcompanhamento || !form.possuiPEI) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const newPsych: PsychAssessment = {
      id: `pa${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      tipo: form.tipo as any,
      classificacao: form.classificacao,
      necessitaAcompanhamento: form.necessitaAcompanhamento === "Sim",
      observacao: form.observacao,
      possuiPEI: form.possuiPEI as any,
      responsavel: "Dra. Fernanda Costa",
    };

    const isInitial = form.tipo === "Inicial";

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const newTimeline = [
          ...s.timeline,
          { id: `tl${Date.now()}`, date: newPsych.date, type: "psych" as const, description: `Avaliação psicopedagógica (${form.tipo}) realizada` },
        ];

        // Auto-create family contact task on Initial assessment
        let familyContact = s.familyContact;
        if (isInitial && !familyContact) {
          familyContact = {
            id: `fc${Date.now()}`,
            studentId: s.id,
            tentativa1: { done: false, date: null },
            tentativa2: { done: false, date: null },
            tentativa3: { done: false, date: null },
            houveRetorno: null,
            observacao: "",
          };
          newTimeline.push({
            id: `tl${Date.now() + 1}`,
            date: newPsych.date,
            type: "family_contact" as const,
            description: "Tarefa de contato com a família criada automaticamente",
          });
        }

        return {
          ...s,
          psychAssessments: [...s.psychAssessments, newPsych],
          timeline: newTimeline,
          familyContact,
        };
      })
    );

    toast({ title: "Avaliação psicopedagógica salva!" });
    setShowForm(false);
    setForm({ tipo: "", classificacao: "", necessitaAcompanhamento: "", observacao: "", possuiPEI: "" });
  };

  const updateFamilyContact = (updates: Partial<FamilyContact>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId || !s.familyContact) return s;
        return { ...s, familyContact: { ...s.familyContact, ...updates } };
      })
    );
  };

  const handleAttemptToggle = (attempt: "tentativa1" | "tentativa2" | "tentativa3", checked: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    updateFamilyContact({
      [attempt]: { done: checked, date: checked ? today : null },
    });
    if (checked) {
      const num = attempt === "tentativa1" ? "1ª" : attempt === "tentativa2" ? "2ª" : "3ª";
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          return {
            ...s,
            timeline: [...s.timeline, {
              id: `tl${Date.now()}`,
              date: today,
              type: "family_contact" as const,
              description: `${num} tentativa de contato com a família`,
            }],
          };
        })
      );
    }
  };

  const handleDocUpload = () => {
    const newDoc: StudentDocument = {
      id: `doc${Date.now()}`,
      name: `Documento_${Date.now()}.pdf`,
      type: "pdf",
      date: new Date().toISOString().split("T")[0],
      responsavel: "Dra. Fernanda Costa",
      url: "#",
    };
    setStudents((prev) =>
      prev.map((s) => s.id === studentId ? { ...s, documents: [...s.documents, newDoc] } : s)
    );
    toast({ title: "Documento adicionado (simulação)!" });
  };

  const activeMultiInt = student.interventions.find(i =>
    ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory) && i.status !== "Concluído"
  );

  const handleAssumirCaso = (responsavel: string) => {
    if (!activeMultiInt) return;
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        interventions: s.interventions.map(i => i.id === activeMultiInt.id ? { ...i, acceptedBy: responsavel, status: "Em_Acompanhamento" } : i),
        timeline: [
          ...s.timeline,
          { id: `tl${Date.now()}`, date: new Date().toISOString().split("T")[0], type: "intervention" as const, description: `Caso assumido por ${responsavel}` }
        ]
      };
    }));
    toast({ title: "Caso Assumido", description: `O caso foi atribuído à ${responsavel}` });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">{turma?.name} • Mat: {student.matricula}</p>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>

        {activeMultiInt && (
          <div className={`p-4 rounded-xl border-l-4 shadow-sm mb-6 ${activeMultiInt.acceptedBy ? 'bg-indigo-50/50 border-indigo-400' : 'bg-amber-50 border-amber-400'}`}>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start">
              <div className="space-y-2 flex-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${activeMultiInt.acceptedBy ? 'text-indigo-800' : 'text-amber-800'}`}>
                  {activeMultiInt.acceptedBy ? <Brain className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {activeMultiInt.acceptedBy ? 'Acompanhamento Multidisciplinar' : 'Triagem Pendente (Fila Geral)'}
                </h3>
                <p className="text-sm text-slate-700 bg-white/80 p-3 rounded border border-slate-100 italic leading-relaxed">
                  "{activeMultiInt.objetivo || student.psychReferralReason || "Solicitação de acompanhamento."}"
                </p>
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
        {isCriticalCase && !crisisArchived && (
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
                        <span className="text-xs text-blue-600/80 font-medium">{followUpEvent.date}</span>
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

        {/* Family Contact Summary */}
        {student.familyContact && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contato com a Família
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className="text-xs">
                {getFamilyContactStatusLabel(student.familyContact)}
              </Badge>
              <div className="space-y-2">
                {(["tentativa1", "tentativa2", "tentativa3"] as const).map((key, i) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      checked={student.familyContact![key].done}
                      onCheckedChange={(c) => handleAttemptToggle(key, !!c)}
                      disabled={i > 0 && !student.familyContact![`tentativa${i}` as "tentativa1" | "tentativa2" | "tentativa3"].done}
                    />
                    <span className="text-sm">Tentativa {i + 1}</span>
                    {student.familyContact![key].date && (
                      <span className="text-xs text-muted-foreground">{student.familyContact![key].date}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Houve retorno?</Label>
                <Select
                  value={student.familyContact.houveRetorno === true ? "Sim" : student.familyContact.houveRetorno === false ? "Não" : ""}
                  onValueChange={(v) => updateFamilyContact({ houveRetorno: v === "Sim" ? true : v === "Não" ? false : null })}
                >
                  <SelectTrigger className="w-40"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Observação do contato</Label>
                <Textarea
                  value={student.familyContact.observacao}
                  onChange={(e) => updateFamilyContact({ observacao: e.target.value })}
                  rows={2}
                  placeholder="Registre observações sobre o contato..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="pedagogica" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pedagogica" className="text-xs sm:text-sm gap-1">
              <BookOpen className="h-3.5 w-3.5 hidden sm:inline" /> Av. Pedagógica
            </TabsTrigger>
            <TabsTrigger value="psicologica" className="text-xs sm:text-sm gap-1">
              <Brain className="h-3.5 w-3.5 hidden sm:inline" /> Av. Psicopedagógicas
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm gap-1">
              <Clock className="h-3.5 w-3.5 hidden sm:inline" /> Linha do Tempo
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Pedagogical Assessment */}
          <TabsContent value="pedagogica">
            {lastAssessment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Avaliação Pedagógica</CardTitle>
                  <p className="text-xs text-muted-foreground">{lastAssessment.date}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 mb-6">

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
                    <div className="bg-red-50/50 rounded-lg p-3 space-y-3 text-sm border border-red-100 mt-2">
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
                  {/* Alert reason */}
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
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="py-6 text-center text-muted-foreground">Nenhuma avaliação pedagógica registrada.</CardContent></Card>
            )}
          </TabsContent>

          {/* TAB 2: Psych Assessments */}
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
                          <span className="text-xs text-muted-foreground">{pa.date}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Classificação:</span> <strong>{pa.classificacao}</strong></div>
                        <div><span className="text-muted-foreground">Acompanhamento:</span>{" "}
                          <Badge variant={pa.necessitaAcompanhamento ? "default" : "secondary"} className="text-xs">
                            {pa.necessitaAcompanhamento ? "Sim" : "Não"}
                          </Badge>
                        </div>
                        <div><span className="text-muted-foreground">PEI:</span> <strong>{pa.possuiPEI || "N/A"}</strong></div>
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

              {/* New Assessment Form */}
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} className="w-full">Nova Avaliação Psicopedagógica</Button>
              ) : (
                <Card>
                  <CardHeader><CardTitle className="text-base">Nova Avaliação Psicopedagógica</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Tipo *</Label>
                      <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {["Inicial", "Reavaliação", "Acompanhamento"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Classificação *</Label>
                      <Select value={form.classificacao} onValueChange={(v) => setForm((f) => ({ ...f, classificacao: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {PSYCH_CLASSIFICATIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Necessita Acompanhamento *</Label>
                      <Select value={form.necessitaAcompanhamento} onValueChange={(v) => setForm((f) => ({ ...f, necessitaAcompanhamento: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {["Sim", "Não"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Possui PEI? *</Label>
                      <Select value={form.possuiPEI} onValueChange={(v) => setForm((f) => ({ ...f, possuiPEI: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {PEI_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Observação Técnica</Label>
                      <Textarea value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1">Salvar</Button>
                      <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: Timeline */}
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
                      }[event.type] || "bg-primary";

                      return (
                        <div key={event.id} className="flex gap-3 items-start">
                          <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${iconColor} flex-shrink-0`} />
                          <div>
                            <p className="text-sm">{event.description}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documentos do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.documents.length > 0 ? (
              student.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date} • {doc.responsavel}</p>
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
            <Button variant="outline" className="w-full gap-2" onClick={handleDocUpload}>
              <Upload className="h-4 w-4" /> Upload de Documento (Simulado)
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
