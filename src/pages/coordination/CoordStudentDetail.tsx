import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useParams } from "react-router-dom";
import { turmas, type Intervention } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContingencyPlanModal } from "@/components/ContingencyPlanModal";
import { Clock, ClipboardList, Brain, TrendingUp, AlertTriangle, FileText, Eye, CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { InterventionDetailView } from "@/components/InterventionDetailView";
import { toast } from "@/hooks/use-toast";

const mapConceptToValue = (concept: string) => {
  if (["Defasada", "Defasado", "Insuficiente"].includes(concept)) return 1;
  if (["Em desenvolvimento", "Regular"].includes(concept)) return 2;
  if (["Adequada", "Adequado", "Bom", "Excelente"].includes(concept)) return 3;
  return null;
};

const mapValueToConcept = (value: number) => {
  if (value === 1) return "Defasada";
  if (value === 2) return "Em dev.";
  if (value === 3) return "Adequada";
  return "";
};

const CustomValueDot = (props: any) => {
  const { cx, cy, payload, dataKeyConcept } = props;
  const concept = payload?.[dataKeyConcept];
  if (!concept) return null;
  const color = CONCEPT_RISK_COLOR[concept] || "#cbd5e1";
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={1.5} />;
};

const CONCEPT_RISK_COLOR: Record<string, string> = {
  "Defasada": "hsl(0, 72%, 51%)", "Defasado": "hsl(0, 72%, 51%)", "Insuficiente": "hsl(0, 72%, 51%)",
  "Em desenvolvimento": "hsl(45, 93%, 47%)", "Regular": "hsl(45, 93%, 47%)",
  "Adequada": "hsl(142, 71%, 45%)", "Adequado": "hsl(142, 71%, 45%)", "Bom": "hsl(142, 71%, 45%)",
  "Excelente": "hsl(142, 71%, 45%)",
};

export default function CoordStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const [evolutionYear, setEvolutionYear] = useState<number>(2025);
  const [openContingencyModal, setOpenContingencyModal] = useState(false);
  const [openViewPlanModal, setOpenViewPlanModal] = useState(false);
  const [interventionToView, setInterventionToView] = useState<Intervention | null>(null);

  const student = students.find((s) => s.id === studentId);

  // Available years for evolution section
  const availableYears = useMemo(() => {
    if (!student) return [2026, 2025, 2024];
    const years = [...new Set(student.assessments.map((a) => a.anoLetivo))].sort((a, b) => b - a);
    return [...new Set([2026, 2025, 2024, ...years])].sort((a, b) => b - a);
  }, [student?.assessments]);

  // Evolution chart data: all assessments for selected year, sorted by date
  const evolutionAssessments = useMemo(
    () => student ? student.assessments.filter((a) => a.anoLetivo === evolutionYear).sort((a, b) => a.date.localeCompare(b.date)) : [],
    [student?.assessments, evolutionYear]
  );

  // Build line chart data points (sobe e desce style)
  const evolutionData = useMemo(() => {
    return evolutionAssessments.map((a) => ({
      date: a.date,
      bimestreLabel: `Bim. ${a.bimestre || "-"}`,
      Leitura: mapConceptToValue(a.leitura),
      LeituraConcept: a.leitura,
      Escrita: mapConceptToValue(a.escrita),
      EscritaConcept: a.escrita,
      Matemática: mapConceptToValue(a.matematica),
      MatemáticaConcept: a.matematica,
      Atenção: mapConceptToValue(a.atencao),
      AtençãoConcept: a.atencao,
      Comportamento: mapConceptToValue(a.comportamento),
      ComportamentoConcept: a.comportamento,
    }));
  }, [evolutionAssessments]);

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];
  const interventionAguardando = student.interventions.find((i) => i.status === "Aguardando");
  const interventionComPlano = student.interventions.find(
    (i) => i.status === "Em_Acompanhamento" || i.status === "Concluído"
  );

  const handleOpenContingency = () => {
    if (interventionAguardando) setOpenContingencyModal(true);
    else toast({ title: "Nenhuma intervenção aguardando ação para este aluno.", variant: "destructive" });
  };

  const handleOpenViewPlan = () => {
    if (interventionComPlano) {
      setInterventionToView(interventionComPlano);
      setOpenViewPlanModal(true);
    }
  };

  const handleAddUpdate = (content: string, isFinalResolution: boolean = false) => {
    if (!interventionToView) return;

    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');

    const novoUpdate = {
      id: `up-${Date.now()}`,
      date: `${yyyy}-${mm}-${dd}`,
      time: `${HH}:${MM}`,
      author: "Coordenação",
      content
    };

    const updatedInterventions = student.interventions.map(i => {
      if (i.id === interventionToView.id) {
        let uInterv = { ...i, updates: [...(i.updates || []), novoUpdate] };

        if (isFinalResolution) {
          uInterv = { ...uInterv, status: "Concluído", resolutionAta: content };
        }

        setInterventionToView(uInterv); // Atualiza modal atual
        return uInterv;
      }
      return i;
    });

    const updatedStudent = { ...student, interventions: updatedInterventions };
    setStudents(students.map(s => s.id === student.id ? updatedStudent : s));

    toast({
      title: isFinalResolution ? "Ciclo encerrado com sucesso" : "Andamento Registrado",
      description: isFinalResolution ? "O caso foi fechado a partir da timeline." : "A nota foi adicionada à timeline com sucesso.",
      duration: 3000
    });
  };

  // Alert reasons
  const alertReasons: string[] = [];
  if (student.riskLevel === "high") alertReasons.push("Alto risco");
  if (student.riskLevel === "medium") alertReasons.push("Médio risco");
  if (lastAssessment?.dificuldadePercebida) alertReasons.push("Dificuldade percebida pelo professor");
  const defFields = [lastAssessment?.leitura, lastAssessment?.escrita, lastAssessment?.matematica].filter((v) => v === "Defasada");
  if (defFields.length > 0) alertReasons.push(`Defasagem em ${defFields.length} área(s)`);

  const handleReferPsych = () => {
    if (student.psychReferral) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? { ...s, psychReferral: true, timeline: [...s.timeline, { id: `tl-ref-${Date.now()}`, date: new Date().toISOString().split("T")[0], type: "referral" as const, description: "Encaminhado para avaliação psicopedagógica pela Coordenação" }] }
          : s
      )
    );
  };

  const statusColor = (s: string) => {
    if (s === "Concluída" || s === "Concluído") return "bg-risk-low/10 text-risk-low border-risk-low/20";
    if (s === "Em andamento" || s === "Em_Acompanhamento") return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
    if (s === "Aguardando") return "bg-risk-high/10 text-risk-high border-risk-high/20";
    return "bg-muted text-muted-foreground";
  };

  const EvolutionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-xl text-xs space-y-1 min-w-[150px]">
          <p className="font-bold border-b pb-1 mb-1">{data.date} {data.bimestreLabel ? `(${data.bimestreLabel})` : ""}</p>
          {payload.map((entry: any, index: number) => {
            const concept = data[`${entry.name}Concept`];
            if (!concept) return null;
            return (
              <p key={index} className="flex items-center gap-1.5 py-0.5" style={{ color: entry.color }}>
                <span className="font-medium w-20">{entry.name}:</span>
                <span className="font-bold flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: CONCEPT_RISK_COLOR[concept] || "#ccc" }} />
                  {concept}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">{turma?.name} • Mat: {student.matricula}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={student.riskLevel} />
            {interventionAguardando && (
              <Button size="sm" onClick={handleOpenContingency}>
                <ClipboardList className="h-4 w-4 mr-1" /> Iniciar Plano Estratégico
              </Button>
            )}
            {interventionComPlano && (
              <Button size="sm" variant="outline" onClick={handleOpenViewPlan}>
                <Eye className="h-4 w-4 mr-1" /> Ver plano estratégico
              </Button>
            )}
            <Button size="sm" variant={student.psychReferral ? "secondary" : "destructive"} onClick={handleReferPsych} disabled={student.psychReferral}>
              <Brain className="h-4 w-4 mr-1" />
              {student.psychReferral ? "Já encaminhado" : "Encaminhar Psicologia"}
            </Button>
          </div>
        </div>

        {/* Motivo do Alerta */}
        {alertReasons.length > 0 && (
          <Card className="border-risk-medium/30">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-risk-medium mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Motivo do alerta</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {alertReasons.map((r, i) => (
                      <span key={i} className="text-xs bg-risk-medium/10 text-risk-medium px-2 py-0.5 rounded-full border border-risk-medium/20">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Última Avaliação Pedagógica */}
        {lastAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última Avaliação Pedagógica</CardTitle>
              <p className="text-xs text-muted-foreground">{lastAssessment.date} • {lastAssessment.bimestre}º Bimestre / {lastAssessment.anoLetivo}</p>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Dificuldade percebida:</span>
                <strong className={lastAssessment.dificuldadePercebida ? "text-risk-high" : "text-risk-low"}>
                  {lastAssessment.dificuldadePercebida ? "Sim ⚠" : "Não"}
                </strong>
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
                  <p className="text-xs font-bold text-blue-800 flex items-center gap-1"><FileText className="h-3 w-3" /> Parecer Final do Professor</p>
                  <p className="text-sm italic text-slate-700">{lastAssessment.observacaoProfessor}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===== EVOLUÇÃO DO ALUNO ===== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Evolução do Aluno
              </CardTitle>
              <Select value={String(evolutionYear)} onValueChange={(v) => setEvolutionYear(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {evolutionAssessments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação registrada para {evolutionYear}.</p>
            ) : (
              <>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border/50" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      />
                      <YAxis
                        domain={[1, 3]}
                        ticks={[1, 2, 3]}
                        tickFormatter={mapValueToConcept}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        width={90}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip content={<EvolutionTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />

                      <Line type="monotone" dataKey="Leitura" name="Leitura" stroke="#60a5fa" strokeWidth={2.5} isAnimationActive={false} activeDot={{ r: 8, strokeWidth: 0 }} dot={(props) => <CustomValueDot {...props} dataKeyConcept="LeituraConcept" />} />
                      <Line type="monotone" dataKey="Escrita" name="Escrita" stroke="#c084fc" strokeWidth={2.5} isAnimationActive={false} activeDot={{ r: 8, strokeWidth: 0 }} dot={(props) => <CustomValueDot {...props} dataKeyConcept="EscritaConcept" />} />
                      <Line type="monotone" dataKey="Matemática" name="Matemática" stroke="#34d399" strokeWidth={2.5} isAnimationActive={false} activeDot={{ r: 8, strokeWidth: 0 }} dot={(props) => <CustomValueDot {...props} dataKeyConcept="MatemáticaConcept" />} />
                      <Line type="monotone" dataKey="Atenção" name="Atenção" stroke="#fbbf24" strokeWidth={2.5} isAnimationActive={false} activeDot={{ r: 8, strokeWidth: 0 }} dot={(props) => <CustomValueDot {...props} dataKeyConcept="AtençãoConcept" />} />
                      <Line type="monotone" dataKey="Comportamento" name="Comportamento" stroke="#f87171" strokeWidth={2.5} isAnimationActive={false} activeDot={{ r: 8, strokeWidth: 0 }} dot={(props) => <CustomValueDot {...props} dataKeyConcept="ComportamentoConcept" />} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border">
                  <span>Nota nos pontos:</span>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 72%, 51%)" }} /> Defasada</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} /> Em des.</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} /> Adequada</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Registro Psicopedagógico */}
        {student.psychAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4" /> Registro Psicopedagógico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(() => {
                const lastPsych = student.psychAssessments[student.psychAssessments.length - 1];
                return (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">Última avaliação: {lastPsych.date}</p>
                    <div><span className="text-muted-foreground">Tipo:</span> <strong>{lastPsych.tipo}</strong></div>
                    <div><span className="text-muted-foreground">Classificação:</span> <strong>{lastPsych.classificacao}</strong></div>
                    <div><span className="text-muted-foreground">Acompanhamento:</span> <strong>{lastPsych.necessitaAcompanhamento ? "Sim" : "Não"}</strong></div>
                    {lastPsych.observacao && <div><span className="text-muted-foreground">Observação:</span> <p className="mt-1">{lastPsych.observacao}</p></div>}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Intervenções */}
        {student.interventions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Acompanhamentos Registrados ({student.interventions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {student.interventions.map((intervention) => (
                <div key={intervention.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{intervention.actionCategory} • {intervention.actionTool}</p>
                    <p className="text-xs text-muted-foreground">Objetivo: {intervention.objetivo}</p>
                    <p className="text-xs text-muted-foreground">Responsável: {intervention.responsavel} • {intervention.date}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(intervention.status)}`}>{intervention.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Linha do Tempo Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.timeline.sort((a, b) => b.date.localeCompare(a.date)).map((event) => {
                const dotColor = event.type === "referral" ? "bg-risk-high" : event.type === "intervention" ? "bg-risk-medium" : event.type === "psych" ? "bg-accent" : "bg-primary";
                return (
                  <div key={event.id} className="flex gap-3 items-start">
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
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
      </div>

      <ContingencyPlanModal
        open={openContingencyModal}
        onOpenChange={setOpenContingencyModal}
        interventionId={interventionAguardando?.id ?? null}
      />

      <Dialog open={openViewPlanModal} onOpenChange={setOpenViewPlanModal}>
        <DialogContent className="sm:max-w-[600px] bg-slate-50/50 max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Acompanhamento Estratégico (Tratativa)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-2">
            {interventionToView && (
              <InterventionDetailView
                interventionToView={interventionToView}
                studentName={student.name}
                onAddUpdate={handleAddUpdate}
              />
            )}
          </div>
          <div className="px-6 py-3 border-t bg-white flex justify-end shrink-0">
            <Button variant="outline" onClick={() => setOpenViewPlanModal(false)}>Fechar Janela</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
