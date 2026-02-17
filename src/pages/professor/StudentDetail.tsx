import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { turmas, getRiskEmoji } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock } from "lucide-react";

export default function StudentDetail() {
  const { studentId } = useParams();
  const { students } = useApp();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === studentId);
  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

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
          <div className="flex items-center gap-3">
            <RiskBadge level={student.riskLevel} />
            <Button onClick={() => navigate(`/professor/aluno/${student.id}/avaliacao`)}>
              <FileText className="h-4 w-4 mr-2" />
              Nova Avaliação
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.timeline.map((event) => (
                <div key={event.id} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
