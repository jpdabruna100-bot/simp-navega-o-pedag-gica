import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { turmas, RiskLevel } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskFilterButtons } from "@/components/RiskFilterButtons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, ClipboardList, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AlertsPanel() {
  const { students, setStudents } = useApp();
  const navigate = useNavigate();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  // Helper: check if student has dificuldadePercebida in latest assessment
  const hasDificuldade = (s: typeof students[0]) => {
    const last = s.assessments[s.assessments.length - 1];
    return last?.dificuldadePercebida === true;
  };

  const atRisk = students
    .filter((s) => s.riskLevel !== "low" || hasDificuldade(s))
    .filter((s) => turmaFilter === "all" || s.turmaId === turmaFilter)
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .sort((a, b) => (a.riskLevel === "high" ? -1 : b.riskLevel === "high" ? 1 : 0));

  const handleReferPsych = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
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
    toast({ title: "Aluno encaminhado para Psicologia" });
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Painel de Alertas</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={turmaFilter} onValueChange={setTurmaFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Turma" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <RiskFilterButtons value={riskFilter} onChange={setRiskFilter} />
        </div>

        <div className="space-y-2">
          {atRisk.map((student) => {
            const turma = turmas.find((t) => t.id === student.turmaId);
            return (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-3">
                  <RiskBadge level={student.riskLevel} />
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{turma?.name} • Mat: {student.matricula}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {hasDificuldade(student) && (
                    <span className="text-xs bg-risk-medium/10 text-risk-medium px-2 py-0.5 rounded-full border border-risk-medium/20 font-medium">
                      ⚠ Dificuldade percebida
                    </span>
                  )}
                  {student.psychReferral && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Psico ✓</span>
                  )}
                  <Button size="sm" variant="outline" onClick={() => navigate(`/coordenacao/aluno/${student.id}`)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Ficha
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/coordenacao/intervencoes?aluno=${student.id}`)}>
                    <ClipboardList className="h-3.5 w-3.5 mr-1" /> Intervenção
                  </Button>
                  {!student.psychReferral && (
                    <Button size="sm" variant="outline" className="text-risk-high border-risk-high/30 hover:bg-risk-high/10" onClick={() => handleReferPsych(student.id)}>
                      <Brain className="h-3.5 w-3.5 mr-1" /> Psicologia
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {atRisk.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum aluno em risco encontrado.</p>}
        </div>
      </div>
    </Layout>
  );
}
