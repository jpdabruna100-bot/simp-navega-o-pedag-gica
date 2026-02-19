import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskFilterButtons } from "@/components/RiskFilterButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { turmas, RiskLevel } from "@/data/mockData";
import { Brain } from "lucide-react";

export default function PsychologyDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [search, setSearch] = useState("");

  // Show referred students who still need follow-up
  // If psych marked "necessitaAcompanhamento = false" on latest assessment, remove from queue
  const referred = students.filter((s) => {
    if (!s.psychReferral) return false;
    const lastPsych = s.psychAssessments[s.psychAssessments.length - 1];
    if (lastPsych && lastPsych.necessitaAcompanhamento === false) return false;
    return true;
  });

  const filtered = referred
    .filter((s) => turmaFilter === "all" || s.turmaId === turmaFilter)
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .filter((s) => search === "" || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel Psicologia</h1>
          <p className="text-muted-foreground text-sm">Dra. Fernanda Costa</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56"
          />
          <Select value={turmaFilter} onValueChange={setTurmaFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Turma" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <RiskFilterButtons value={riskFilter} onChange={setRiskFilter} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" /> Alunos Encaminhados ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.map((student) => {
              const turma = turmas.find((t) => t.id === student.turmaId);
              return (
                <div
                  key={student.id}
                  onClick={() => navigate(`/psicologia/aluno/${student.id}`)}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{turma?.name} • Mat: {student.matricula}</p>
                  </div>
                  <RiskBadge level={student.riskLevel} />
                </div>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhum aluno na fila.</p>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
