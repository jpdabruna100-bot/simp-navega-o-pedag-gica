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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const EVOLUTION_FIELDS = ["leitura", "escrita", "matematica"] as const;
const EVOLUTION_LABELS: Record<string, string> = {
  leitura: "Leitura", escrita: "Escrita", matematica: "Matemática",
};
const EVOLUTION_COLORS: Record<string, string> = {
  leitura: "hsl(var(--primary))", escrita: "hsl(var(--accent))", matematica: "hsl(210, 70%, 50%)",
};

const CONCEPT_TO_VALUE: Record<string, number> = {
  "Defasada": 1, "Defasado": 1, "Insuficiente": 1,
  "Em desenvolvimento": 2, "Regular": 2,
  "Adequada": 3, "Adequado": 3, "Bom": 3,
  "Excelente": 4,
};
const VALUE_TO_LABEL: Record<number, string> = {
  1: "Defasada", 2: "Em desenvolvimento", 3: "Adequada", 4: "Excelente",
};

const RISK_DOT_COLORS: Record<number, string> = {
  1: "hsl(0, 72%, 51%)",    // red
  2: "hsl(45, 93%, 47%)",   // yellow
  3: "hsl(142, 71%, 45%)",  // green
  4: "hsl(142, 71%, 45%)",  // green
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

  const evolutionChartData = useMemo(() =>
    evolutionAssessments.map((a) => ({
      date: a.date,
      Leitura: CONCEPT_TO_VALUE[a.leitura] ?? 1,
      Escrita: CONCEPT_TO_VALUE[a.escrita] ?? 1,
      Matemática: CONCEPT_TO_VALUE[a.matematica] ?? 1,
      leituraRaw: a.leitura,
      escritaRaw: a.escrita,
      matematicaRaw: a.matematica,
    })),
    [evolutionAssessments]
  );

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

  // Custom dot renderer for risk colors
  const renderRiskDot = (field: string) => (props: any) => {
    const { cx, cy, payload } = props;
    const value = payload[field === "leitura" ? "Leitura" : field === "escrita" ? "Escrita" : "Matemática"];
    const color = RISK_DOT_COLORS[value] || RISK_DOT_COLORS[1];
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="hsl(var(--background))" strokeWidth={2} />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-xl text-xs space-y-1">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any) => {
          const rawKey = entry.dataKey === "Leitura" ? "leituraRaw" : entry.dataKey === "Escrita" ? "escritaRaw" : "matematicaRaw";
          const concept = entry.payload[rawKey] || VALUE_TO_LABEL[entry.value] || "";
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
              <span className="font-medium">{concept}</span>
            </div>
          );
        })}
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
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0.5, 4.5]}
                      ticks={[1, 2, 3, 4]}
                      tickFormatter={(v) => VALUE_TO_LABEL[v] || ""}
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    {EVOLUTION_FIELDS.map((field) => (
                      <Line
                        key={field}
                        type="monotone"
                        dataKey={EVOLUTION_LABELS[field]}
                        stroke={EVOLUTION_COLORS[field]}
                        strokeWidth={2}
                        dot={renderRiskDot(field)}
                        activeDot={{ r: 7 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
