import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ClipboardList, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DIMENSION_FIELDS = ["leitura", "escrita", "matematica", "atencao", "comportamento"] as const;
const FIELD_LABELS: Record<string, string> = {
  leitura: "Leitura", escrita: "Escrita", matematica: "Matemática",
  atencao: "Atenção", comportamento: "Comportamento",
};
const LEVEL_VALUES: Record<string, number> = {
  "Defasada": 0, "Defasado": 0, "Em desenvolvimento": 1, "Adequada": 2, "Adequado": 2,
};
const LEVEL_LABELS = ["Defasada", "Em desenv.", "Adequada"];
const DIMENSION_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(210, 70%, 50%)", "hsl(45, 80%, 50%)", "hsl(280, 60%, 50%)"];

export default function CoordStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const student = students.find((s) => s.id === studentId);

  // Available years from assessments
  const availableYears = useMemo(() => {
    if (!student) return [2026, 2025, 2024];
    const years = [...new Set(student.assessments.map((a) => a.anoLetivo))].sort((a, b) => b - a);
    const all = [...new Set([2026, 2025, 2024, ...years])].sort((a, b) => b - a);
    return all;
  }, [student?.assessments]);

  // Assessments for selected year, sorted by bimestre
  const yearAssessments = useMemo(
    () => student ? student.assessments.filter((a) => a.anoLetivo === selectedYear).sort((a, b) => a.bimestre - b.bimestre) : [],
    [student?.assessments, selectedYear]
  );

  // Chart data
  const chartData = useMemo(() =>
    yearAssessments.map((a) => ({
      name: `${a.bimestre}º Bim`,
      Leitura: LEVEL_VALUES[a.leitura] ?? 1,
      Escrita: LEVEL_VALUES[a.escrita] ?? 1,
      Matemática: LEVEL_VALUES[a.matematica] ?? 1,
      Atenção: LEVEL_VALUES[a.atencao] ?? 1,
      Comportamento: LEVEL_VALUES[a.comportamento] ?? 1,
    })),
    [yearAssessments]
  );

  // Evolution between consecutive assessments
  const evolutionPairs = useMemo(() => {
    if (yearAssessments.length < 2) return [];
    return yearAssessments.slice(1).map((curr, i) => {
      const prev = yearAssessments[i];
      return {
        from: `${prev.bimestre}º→${curr.bimestre}º Bim`,
        dimensions: DIMENSION_FIELDS.map((f) => {
          const prevLvl = LEVEL_VALUES[prev[f]] ?? 1;
          const currLvl = LEVEL_VALUES[curr[f]] ?? 1;
          const trend = currLvl > prevLvl ? "up" : currLvl < prevLvl ? "down" : "stable";
          return { field: f, prev: prev[f], curr: curr[f], trend };
        }),
      };
    });
  }, [yearAssessments]);

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

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-risk-low" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-risk-high" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const trendLabel = (t: string) => t === "up" ? "Melhorou" : t === "down" ? "Piorou" : "Estável";
  const trendColor = (t: string) => t === "up" ? "text-risk-low" : t === "down" ? "text-risk-high" : "text-muted-foreground";

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

        {/* Year Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Ano letivo:</span>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
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
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Evolução do Aluno — {selectedYear}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {yearAssessments.length} avaliação(ões) registrada(s) no ano letivo
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {yearAssessments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação registrada para {selectedYear}.</p>
            ) : (
              <>
                {/* Gráfico Comparativo */}
                {yearAssessments.length >= 2 && (
                  <div>
                    <p className="text-sm font-medium mb-3">Gráfico comparativo por bimestre</p>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis
                            domain={[0, 2]}
                            ticks={[0, 1, 2]}
                            tickFormatter={(v) => LEVEL_LABELS[v] || ""}
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            width={80}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                            formatter={(value: number) => LEVEL_LABELS[value] || value}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          {["Leitura", "Escrita", "Matemática", "Atenção", "Comportamento"].map((dim, idx) => (
                            <Line
                              key={dim}
                              type="monotone"
                              dataKey={dim}
                              stroke={DIMENSION_COLORS[idx]}
                              strokeWidth={2}
                              dot={{ r: 4, fill: DIMENSION_COLORS[idx] }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Linha do tempo de avaliações */}
                <div>
                  <p className="text-sm font-medium mb-3">Avaliações por bimestre</p>
                  <div className="space-y-3">
                    {yearAssessments.map((a) => (
                      <div key={a.id} className="p-3 bg-muted/40 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{a.bimestre}º Bimestre</span>
                          <span className="text-xs text-muted-foreground">{a.date}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {DIMENSION_FIELDS.map((f) => (
                            <div key={f}>
                              <span className="text-muted-foreground">{FIELD_LABELS[f]}:</span>{" "}
                              <strong>{a[f]}</strong>
                            </div>
                          ))}
                          <div>
                            <span className="text-muted-foreground">Conceito:</span>{" "}
                            <strong>{a.conceitoGeral}</strong>
                          </div>
                        </div>
                        {a.dificuldadePercebida && (
                          <span className="text-xs bg-risk-high/10 text-risk-high px-2 py-0.5 rounded-full border border-risk-high/20">
                            ⚠ Dificuldade percebida
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tendências entre bimestres */}
                {evolutionPairs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-3">Tendências entre bimestres</p>
                    {evolutionPairs.map((pair, pi) => (
                      <div key={pi} className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1.5">{pair.from}</p>
                        <div className="space-y-1.5">
                          {pair.dimensions.map((e) => (
                            <div key={e.field} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-xs font-medium w-28">{FIELD_LABELS[e.field]}</span>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-muted-foreground">{e.prev}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">{e.curr}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendIcon trend={e.trend} />
                                <span className={`text-xs ${trendColor(e.trend)}`}>{trendLabel(e.trend)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
