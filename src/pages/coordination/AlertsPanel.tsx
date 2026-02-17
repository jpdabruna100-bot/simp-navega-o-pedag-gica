import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { turmas, RiskLevel } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AlertsPanel() {
  const { students } = useApp();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  const atRisk = students
    .filter((s) => s.riskLevel !== "low")
    .filter((s) => turmaFilter === "all" || s.turmaId === turmaFilter)
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .sort((a, b) => (a.riskLevel === "high" ? -1 : 1));

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
          <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="high">🔴 Alto risco</SelectItem>
              <SelectItem value="medium">🟡 Médio risco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {atRisk.map((student) => {
            const turma = turmas.find((t) => t.id === student.turmaId);
            return (
              <div key={student.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{turma?.name} • Mat: {student.matricula}</p>
                </div>
                <div className="flex items-center gap-2">
                  {student.psychReferral && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Psico</span>}
                  <RiskBadge level={student.riskLevel} />
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
