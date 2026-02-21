import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskFilterButtons } from "@/components/RiskFilterButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { turmas, RiskLevel, getPsychStatus, getPsychStatusLabel, getFamilyContactStatusLabel } from "@/data/mockData";
import { Brain, Clock, CheckCircle, AlertCircle, Phone } from "lucide-react";

type StatusFilter = "all" | "pendente" | "em_acompanhamento" | "avaliado";

export default function PsychologyDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const referred = students.filter((s) => {
    if (!s.psychReferral) return false;
    const lastPsych = s.psychAssessments[s.psychAssessments.length - 1];
    if (lastPsych && lastPsych.necessitaAcompanhamento === false) return false;
    return true;
  });

  const filtered = referred
    .filter((s) => turmaFilter === "all" || s.turmaId === turmaFilter)
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .filter((s) => statusFilter === "all" || getPsychStatus(s) === statusFilter)
    .filter((s) => search === "" || s.name.toLowerCase().includes(search.toLowerCase()));

  const statusIcon = (status: string) => {
    switch (status) {
      case "pendente": return <AlertCircle className="h-3.5 w-3.5" />;
      case "em_acompanhamento": return <Clock className="h-3.5 w-3.5" />;
      case "avaliado": return <CheckCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const statusVariant = (status: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (status) {
      case "pendente": return "destructive";
      case "em_acompanhamento": return "default";
      case "avaliado": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel Psicologia</h1>
          <p className="text-muted-foreground text-sm">Dra. Fernanda Costa</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="em_acompanhamento">Em acompanhamento</SelectItem>
              <SelectItem value="avaliado">Concluídos</SelectItem>
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
              const status = getPsychStatus(student);
              const familyStatus = getFamilyContactStatusLabel(student.familyContact);
              return (
                <div
                  key={student.id}
                  onClick={() => navigate(`/psicologia/aluno/${student.id}`)}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{turma?.name} • Mat: {student.matricula}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant={statusVariant(status)} className="text-[10px] gap-1 px-1.5 py-0.5">
                        {statusIcon(status)}
                        {getPsychStatusLabel(status)}
                      </Badge>
                      {student.familyContact && (
                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0.5">
                          <Phone className="h-3 w-3" />
                          {familyStatus}
                        </Badge>
                      )}
                    </div>
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
