import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { turmas } from "@/data/mockData";
import { Brain } from "lucide-react";

export default function PsychologyDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();

  const referred = students.filter((s) => s.psychReferral);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel Psicologia</h1>
          <p className="text-muted-foreground text-sm">Dra. Fernanda Costa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" /> Alunos Encaminhados ({referred.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {referred.map((student) => {
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
