import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ClipboardList, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, FileText } from "lucide-react";

export default function CoordStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === studentId);
  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

  // Determine alert reasons
  const alertReasons: string[] = [];
  if (student.riskLevel === "high") alertReasons.push("Alto risco");
  if (student.riskLevel === "medium") alertReasons.push("Médio risco");
  if (lastAssessment?.dificuldadePercebida) alertReasons.push("Dificuldade percebida pelo professor");
  const defFields = [lastAssessment?.leitura, lastAssessment?.escrita, lastAssessment?.matematica].filter((v) => v === "Defasada");
  if (defFields.length > 0) alertReasons.push(`Defasagem em ${defFields.length} área(s)`);

  // Evolution comparison
  const getEvolution = () => {
    if (student.assessments.length < 2) return null;
    const prev = student.assessments[student.assessments.length - 2];
    const curr = student.assessments[student.assessments.length - 1];
    const fields = ["leitura", "escrita", "matematica", "atencao"] as const;
    const levels: Record<string, number> = { "Defasada": 0, "Defasado": 0, "Em desenvolvimento": 1, "Adequada": 2, "Adequado": 2 };

    return fields.map((f) => {
      const prevVal = prev[f];
      const currVal = curr[f];
      const prevLvl = levels[prevVal] ?? 1;
      const currLvl = levels[currVal] ?? 1;
      const trend = currLvl > prevLvl ? "up" : currLvl < prevLvl ? "down" : "stable";
      return { field: f, prev: prevVal, curr: currVal, trend };
    });
  };

  const evolution = getEvolution();

  const handleReferPsych = () => {
    if (student.psychReferral) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              psychReferral: true,
              timeline: [
                ...s.timeline,
                {
                  id: `tl-ref-${Date.now()}`,
                  date: new Date().toISOString().split("T")[0],
                  type: "referral" as const,
                  description: "Encaminhado para avaliação psicopedagógica pela Coordenação",
                },
              ],
            }
          : s
      )
    );
  };

  const statusColor = (s: string) => {
    if (s === "Concluída") return "bg-risk-low/10 text-risk-low border-risk-low/20";
    if (s === "Em andamento") return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
    return "bg-muted text-muted-foreground";
  };

  const fieldLabel: Record<string, string> = { leitura: "Leitura", escrita: "Escrita", matematica: "Matemática", atencao: "Atenção" };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">
              {turma?.name} • Mat: {student.matricula}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={student.riskLevel} />
            <Button size="sm" onClick={() => navigate(`/coordenacao/intervencoes?aluno=${student.id}`)}>
              <ClipboardList className="h-4 w-4 mr-1" /> Atribuir Intervenção
            </Button>
            <Button
              size="sm"
              variant={student.psychReferral ? "secondary" : "destructive"}
              onClick={handleReferPsych}
              disabled={student.psychReferral}
            >
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
                      <span key={i} className="text-xs bg-risk-medium/10 text-risk-medium px-2 py-0.5 rounded-full border border-risk-medium/20">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Última Avaliação Pedagógica com observações do professor */}
        {lastAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última Avaliação Pedagógica</CardTitle>
              <p className="text-xs text-muted-foreground">{lastAssessment.date}</p>
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
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Observação do Professor
                  </p>
                  <p className="text-sm">{lastAssessment.observacaoProfessor}</p>
                </div>
              )}

              {(lastAssessment.principalDificuldade || lastAssessment.recorrenteOuRecente || lastAssessment.estrategiaEmSala) && (
                <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">Detalhamento do professor</p>
                  {lastAssessment.principalDificuldade && (
                    <div><span className="text-muted-foreground">Principal dificuldade:</span> {lastAssessment.principalDificuldade}</div>
                  )}
                  {lastAssessment.recorrenteOuRecente && (
                    <div><span className="text-muted-foreground">Recorrência:</span> {lastAssessment.recorrenteOuRecente}</div>
                  )}
                  {lastAssessment.estrategiaEmSala && (
                    <div><span className="text-muted-foreground">Estratégia em sala:</span> {lastAssessment.estrategiaEmSala}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Evolução do Aluno */}
        {evolution ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Evolução do Aluno
              </CardTitle>
              <p className="text-xs text-muted-foreground">Comparação entre as duas últimas avaliações</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {evolution.map((e) => (
                  <div key={e.field} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
                    <span className="text-sm font-medium w-24">{fieldLabel[e.field]}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{e.prev}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{e.curr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon trend={e.trend} />
                      <span className={`text-xs font-medium ${trendColor(e.trend)}`}>{trendLabel(e.trend)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {(() => {
                const ups = evolution.filter((e) => e.trend === "up").length;
                const downs = evolution.filter((e) => e.trend === "down").length;
                const overall = ups > downs ? "Melhorou" : downs > ups ? "Piorou" : "Estável";
                const overallColor = ups > downs ? "text-risk-low" : downs > ups ? "text-risk-high" : "text-muted-foreground";
                return (
                  <div className={`mt-3 text-center text-sm font-semibold ${overallColor}`}>
                    Situação geral: {overall}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Evolução do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Necessário ao menos 2 avaliações para comparar evolução.
              </p>
            </CardContent>
          </Card>
        )}

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
                    {lastPsych.observacao && (
                      <div><span className="text-muted-foreground">Observação:</span> <p className="mt-1">{lastPsych.observacao}</p></div>
                    )}
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
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(intervention.status)}`}>
                    {intervention.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Linha do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.timeline
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((event) => {
                  const dotColor =
                    event.type === "referral" ? "bg-risk-high" :
                    event.type === "intervention" ? "bg-risk-medium" :
                    event.type === "psych" ? "bg-accent" : "bg-primary";
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
