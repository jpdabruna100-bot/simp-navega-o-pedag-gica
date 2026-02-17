import { useApp } from "@/context/AppContext";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, TrendingUp, AlertTriangle } from "lucide-react";

export default function DirectoryDashboard() {
  const { students } = useApp();

  const turmaData = turmas.map((t) => {
    const ts = students.filter((s) => s.turmaId === t.id);
    return {
      turma: t.name,
      alto: ts.filter((s) => s.riskLevel === "high").length,
      medio: ts.filter((s) => s.riskLevel === "medium").length,
      baixo: ts.filter((s) => s.riskLevel === "low").length,
    };
  });

  const totalStudents = students.length;
  const highRisk = students.filter((s) => s.riskLevel === "high").length;
  const riskPercent = ((highRisk / totalStudents) * 100).toFixed(1);

  const allInterventions = students.flatMap((s) => s.interventions);
  const concluded = allInterventions.filter((i) => i.status === "Concluída").length;
  const concludedPercent = allInterventions.length > 0 ? ((concluded / allInterventions.length) * 100).toFixed(0) : "0";

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel da Diretoria</h1>
          <p className="text-muted-foreground text-sm">Visão institucional • Apenas visualização</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total de alunos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-risk-high" />
              <div>
                <p className="text-2xl font-bold">{riskPercent}%</p>
                <p className="text-xs text-muted-foreground">Índice de risco alto</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-risk-low" />
              <div>
                <p className="text-2xl font-bold">{concludedPercent}%</p>
                <p className="text-xs text-muted-foreground">Intervenções concluídas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Comparativo entre Turmas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={turmaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turma" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="alto" name="Alto risco" fill="hsl(0, 72%, 51%)" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medio" name="Médio risco" fill="hsl(45, 93%, 47%)" stackId="a" />
                <Bar dataKey="baixo" name="Baixo risco" fill="hsl(142, 71%, 45%)" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
