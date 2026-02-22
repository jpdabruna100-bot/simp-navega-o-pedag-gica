import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ClipboardList, Brain, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line } from "recharts";

const AREA_LABELS = ["Leitura", "Escrita", "Matemática"] as const;
const AREA_Y_MAP: Record<string, number> = { Leitura: 3, Escrita: 2, Matemática: 1 };

const CONCEPT_RISK_COLOR: Record<string, string> = {
  "Defasada": "hsl(0, 72%, 51%)", "Defasado": "hsl(0, 72%, 51%)", "Insuficiente": "hsl(0, 72%, 51%)",
  "Em desenvolvimento": "hsl(45, 93%, 47%)", "Regular": "hsl(45, 93%, 47%)",
  "Adequada": "hsl(142, 71%, 45%)", "Adequado": "hsl(142, 71%, 45%)", "Bom": "hsl(142, 71%, 45%)",
  "Excelente": "hsl(142, 71%, 45%)",
};

export default function CoordStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const navigate = useNavigate();
  const [evolutionYear, setEvolutionYear] = useState<number>(2025);

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

  // Build scatter points: one per area per assessment date
  const scatterData = useMemo(() => {
    const points: { date: string; dateIdx: number; area: string; areaY: number; concept: string; color: string }[] = [];
    const dates = evolutionAssessments.map((a) => a.date);
    evolutionAssessments.forEach((a, idx) => {
      const fields = [
        { area: "Leitura", concept: a.leitura },
        { area: "Escrita", concept: a.escrita },
        { area: "Matemática", concept: a.matematica },
      ];
      fields.forEach(({ area, concept }) => {
        points.push({
          date: a.date,
          dateIdx: idx,
          area,
          areaY: AREA_Y_MAP[area],
          concept,
          color: CONCEPT_RISK_COLOR[concept] || "hsl(var(--muted-foreground))",
        });
      });
    });
    return { points, dates };
  }, [evolutionAssessments]);

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

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
    if (s === "Concluída") return "bg-risk-low/10 text-risk-low border-risk-low/20";
    if (s === "Em andamento") return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
    return "bg-muted text-muted-foreground";
  };

  const EvolutionTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-xl text-xs space-y-0.5">
        <p className="font-medium">{d.date}</p>
        <p className="text-muted-foreground">Área: <span className="font-medium text-foreground">{d.area}</span></p>
        <p className="text-muted-foreground">Conceito: <span className="font-medium text-foreground">{d.concept}</span></p>
      </div>
    );
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
            <Button size="sm" onClick={() => navigate(`/coordenacao/intervencoes?aluno=${student.id}`)}>
              <ClipboardList className="h-4 w-4 mr-1" /> Atribuir Intervenção
            </Button>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Conceito:</span> <strong>{lastAssessment.conceitoGeral}</strong></div>
                <div><span className="text-muted-foreground">Leitura:</span> <strong>{lastAssessment.leitura}</strong></div>
                <div><span className="text-muted-foreground">Escrita:</span> <strong>{lastAssessment.escrita}</strong></div>
                <div><span className="text-muted-foreground">Matemática:</span> <strong>{lastAssessment.matematica}</strong></div>
                <div><span className="text-muted-foreground">Atenção:</span> <strong>{lastAssessment.atencao}</strong></div>
                <div><span className="text-muted-foreground">Comportamento:</span> <strong>{lastAssessment.comportamento}</strong></div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Dificuldade percebida:</span>
                <strong className={lastAssessment.dificuldadePercebida ? "text-risk-high" : "text-risk-low"}>
                  {lastAssessment.dificuldadePercebida ? "Sim ⚠" : "Não"}
                </strong>
              </div>
              {lastAssessment.observacaoProfessor && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Observação do Professor</p>
                  <p className="text-sm">{lastAssessment.observacaoProfessor}</p>
                </div>
              )}
              {(lastAssessment.principalDificuldade || lastAssessment.recorrenteOuRecente || lastAssessment.estrategiaEmSala) && (
                <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">Detalhamento do professor</p>
                  {lastAssessment.principalDificuldade && <div><span className="text-muted-foreground">Principal dificuldade:</span> {lastAssessment.principalDificuldade}</div>}
                  {lastAssessment.recorrenteOuRecente && <div><span className="text-muted-foreground">Recorrência:</span> {lastAssessment.recorrenteOuRecente}</div>}
                  {lastAssessment.estrategiaEmSala && <div><span className="text-muted-foreground">Estratégia em sala:</span> {lastAssessment.estrategiaEmSala}</div>}
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
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        type="category"
                        dataKey="date"
                        allowDuplicatedCategory={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="areaY"
                        domain={[0.5, 3.5]}
                        ticks={[1, 2, 3]}
                        tickFormatter={(v: number) => {
                          if (v === 3) return "Leitura";
                          if (v === 2) return "Escrita";
                          if (v === 1) return "Matemática";
                          return "";
                        }}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip content={<EvolutionTooltip />} />
                      <Scatter data={scatterData.points} shape="circle">
                        {scatterData.points.map((p, i) => (
                          <Cell key={i} fill={p.color} r={8} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 72%, 51%)" }} /> Defasada</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} /> Em desenvolvimento</div>
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
                <ClipboardList className="h-4 w-4" /> Intervenções ({student.interventions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {student.interventions.map((intervention) => (
                <div key={intervention.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{intervention.tipo}</p>
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
    </Layout>
  );
}
