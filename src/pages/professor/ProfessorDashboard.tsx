import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { turmas } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle } from "lucide-react";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";

export default function ProfessorDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();

  // Professor sees turmas t1, t2, t5 (professorId u1)
  const myTurmas = turmas.filter((t) => t.professorId === "u1");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel do Professor</h1>
          <p className="text-muted-foreground text-sm">Profª. Carla Mendes</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myTurmas.map((turma) => {
            const turmaStudents = students.filter((s) => s.turmaId === turma.id);
            const highRisk = turmaStudents.filter((s) => s.riskLevel === "high").length;
            const mediumRisk = turmaStudents.filter((s) => s.riskLevel === "medium").length;

            return (
              <Card
                key={turma.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
                onClick={() => navigate(`/professor/turma/${turma.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{turma.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Turno: {turma.turno}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {turmaStudents.length} alunos
                  </div>
                  {(highRisk > 0 || mediumRisk > 0) && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-risk-high" />
                      <span className="font-medium">
                        {highRisk > 0 && <span className="text-risk-high">{highRisk} 🔴</span>}
                        {highRisk > 0 && mediumRisk > 0 && " · "}
                        {mediumRisk > 0 && <span className="text-risk-medium">{mediumRisk} 🟡</span>}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
