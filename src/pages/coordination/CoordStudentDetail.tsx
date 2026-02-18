import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ClipboardList, Brain } from "lucide-react";

export default function CoordStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === studentId);
  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

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
            <Button
              size="sm"
              onClick={() => navigate(`/coordenacao/intervencoes?aluno=${student.id}`)}
            >
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

        {lastAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última Avaliação Pedagógica</CardTitle>
              <p className="text-xs text-muted-foreground">{lastAssessment.date}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Conceito:</span> <strong>{lastAssessment.conceitoGeral}</strong></div>
                <div><span className="text-muted-foreground">Leitura:</span> <strong>{lastAssessment.leitura}</strong></div>
                <div><span className="text-muted-foreground">Escrita:</span> <strong>{lastAssessment.escrita}</strong></div>
                <div><span className="text-muted-foreground">Matemática:</span> <strong>{lastAssessment.matematica}</strong></div>
                <div><span className="text-muted-foreground">Atenção:</span> <strong>{lastAssessment.atencao}</strong></div>
                <div><span className="text-muted-foreground">Comportamento:</span> <strong>{lastAssessment.comportamento}</strong></div>
              </div>
              {lastAssessment.dificuldadePercebida && (
                <p className="mt-2 text-sm text-risk-high font-medium">⚠ Dificuldade percebida</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Registro Psicopedagógico - visível apenas para Coordenação e Psicologia */}
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
