import { useApp } from "@/context/AppContext";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Activity, Brain, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function CoordinationDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();

  const highRisk = students.filter((s) => s.riskLevel === "high").length;
  const medRisk = students.filter((s) => s.riskLevel === "medium").length;
  const lowRisk = students.filter((s) => s.riskLevel === "low").length;
  const activeInterventions = students.flatMap((s) => s.interventions).filter((i) => i.status === "Em andamento").length;
  const pendingPsych = students.filter((s) => s.psychReferral && s.psychAssessments.length === 0).length;

  const areaData = [
    { area: "Leitura", insuficientes: students.filter((s) => s.assessments.some((a) => a.leitura === "Defasada")).length },
    { area: "Escrita", insuficientes: students.filter((s) => s.assessments.some((a) => a.escrita === "Defasada")).length },
    { area: "Matemática", insuficientes: students.filter((s) => s.assessments.some((a) => a.matematica === "Defasada")).length },
    { area: "Atenção", insuficientes: students.filter((s) => s.assessments.some((a) => a.atencao === "Defasada")).length },
  ];

  const pieData = [
    { name: "Baixo risco", value: lowRisk, color: "hsl(142, 71%, 45%)" },
    { name: "Médio risco", value: medRisk, color: "hsl(45, 93%, 47%)" },
    { name: "Alto risco", value: highRisk, color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Estratégico</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-risk-high">
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-risk-high" />
              <div>
                <p className="text-2xl font-bold">{highRisk}</p>
                <p className="text-xs text-muted-foreground">Prioridade Alta</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-accent">
            <CardContent className="pt-4 flex items-center gap-3">
              <Activity className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{activeInterventions}</p>
                <p className="text-xs text-muted-foreground">Intervenções Ativas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4 flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{pendingPsych}</p>
                <p className="text-xs text-muted-foreground">Encaminhamentos Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Defasagem por Área</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="insuficientes" fill="hsl(215, 70%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Distribuição de Prioridade</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Card className="flex-1 min-w-[200px] cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/coordenacao/alertas")}>
            <CardContent className="pt-4 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-risk-high" />
              <p className="font-medium text-sm">Painel de Alertas</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px] cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/coordenacao/intervencoes")}>
            <CardContent className="pt-4 text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="font-medium text-sm">Gestão de Intervenções</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
