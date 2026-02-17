import { useApp } from "@/context/AppContext";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Building2, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";

export default function DirectoryDashboard() {
  const { students } = useApp();

  // === KPIs básicos ===
  const totalStudents = students.length;
  const highRisk = students.filter((s) => s.riskLevel === "high").length;
  const mediumRisk = students.filter((s) => s.riskLevel === "medium").length;
  const riskPercent = ((highRisk / totalStudents) * 100).toFixed(1);

  const allInterventions = students.flatMap((s) => s.interventions);
  const concluded = allInterventions.filter((i) => i.status === "Concluída").length;
  const inProgress = allInterventions.filter((i) => i.status === "Em andamento").length;
  const planned = allInterventions.filter((i) => i.status === "Planejada").length;
  const concludedPercent = allInterventions.length > 0 ? ((concluded / allInterventions.length) * 100).toFixed(0) : "0";

  // Alunos alto risco sem intervenção ativa
  const highRiskNoIntervention = students.filter(
    (s) => s.riskLevel === "high" && !s.interventions.some((i) => i.status === "Em andamento" || i.status === "Planejada")
  ).length;

  // === Turmas mais críticas ===
  const turmaRanking = turmas
    .map((t) => {
      const ts = students.filter((s) => s.turmaId === t.id);
      const high = ts.filter((s) => s.riskLevel === "high").length;
      return { turma: t.name, highCount: high, total: ts.length, pct: ts.length > 0 ? Math.round((high / ts.length) * 100) : 0 };
    })
    .sort((a, b) => b.pct - a.pct);

  // === Comparativo entre turmas ===
  const turmaData = turmas.map((t) => {
    const ts = students.filter((s) => s.turmaId === t.id);
    return {
      turma: t.name,
      alto: ts.filter((s) => s.riskLevel === "high").length,
      medio: ts.filter((s) => s.riskLevel === "medium").length,
      baixo: ts.filter((s) => s.riskLevel === "low").length,
    };
  });

  // === Risco por série ===
  const seriesMap: Record<string, { high: number; medium: number; low: number }> = {};
  turmas.forEach((t) => {
    const serie = t.name.split(" ")[0] + " " + t.name.split(" ")[1]; // "1º Ano", etc.
    if (!seriesMap[serie]) seriesMap[serie] = { high: 0, medium: 0, low: 0 };
    students.filter((s) => s.turmaId === t.id).forEach((s) => {
      seriesMap[serie][s.riskLevel]++;
    });
  });
  const riskBySeries = Object.entries(seriesMap).map(([serie, counts]) => ({
    serie,
    alto: counts.high,
    medio: counts.medium,
    baixo: counts.low,
  }));

  // === Eficácia das intervenções (pie) ===
  const concludedWithImprovement = Math.round(concluded * 0.6); // simulado
  const concludedWithout = concluded - concludedWithImprovement;
  const efficacyData = [
    { name: "Com melhora", value: concludedWithImprovement },
    { name: "Sem melhora", value: concludedWithout },
    { name: "Em andamento", value: inProgress },
    { name: "Planejada", value: planned },
  ].filter((d) => d.value > 0);
  const EFFICACY_COLORS = ["hsl(142,71%,45%)", "hsl(0,72%,51%)", "hsl(45,93%,47%)", "hsl(215,14%,70%)"];

  // === KPI aprendizagem ===
  const allAssessments = students.map((s) => s.assessments[s.assessments.length - 1]).filter(Boolean);
  const leitura = { adequada: 0, desenvolvimento: 0, defasada: 0 };
  const escrita = { adequada: 0, desenvolvimento: 0, defasada: 0 };
  const matematica = { adequada: 0, desenvolvimento: 0, defasada: 0 };
  allAssessments.forEach((a) => {
    const count = (field: string, target: typeof leitura) => {
      if (field === "Adequada") target.adequada++;
      else if (field === "Em desenvolvimento") target.desenvolvimento++;
      else target.defasada++;
    };
    count(a.leitura, leitura);
    count(a.escrita, escrita);
    count(a.matematica, matematica);
  });
  const learningData = [
    { area: "Leitura", adequado: leitura.adequada, desenvolvimento: leitura.desenvolvimento, defasado: leitura.defasada },
    { area: "Escrita", adequado: escrita.adequada, desenvolvimento: escrita.desenvolvimento, defasado: escrita.defasada },
    { area: "Matemática", adequado: matematica.adequada, desenvolvimento: matematica.desenvolvimento, defasado: matematica.defasada },
  ];

  // === Insights simulados ===
  const mostCriticalTurma = turmaRanking[0];
  const encaminhados = students.filter((s) => s.psychReferral).length;
  const insights = [
    mostCriticalTurma && mostCriticalTurma.pct > 20
      ? `Turma ${mostCriticalTurma.turma} precisa de plano emergencial — ${mostCriticalTurma.pct}% de alunos em alto risco.`
      : null,
    `Encaminhamentos psicológicos atingiram ${encaminhados} alunos (${((encaminhados / totalStudents) * 100).toFixed(0)}% do total).`,
    highRiskNoIntervention > 0
      ? `${highRiskNoIntervention} aluno(s) em alto risco ainda sem intervenção ativa — ação necessária.`
      : "Todos os alunos em alto risco possuem intervenção ativa. ✓",
    leitura.defasada > leitura.adequada
      ? "Defasagem em leitura superou o nível adequado — considerar reforço institucional."
      : "Leitura com mais alunos adequados do que defasados. ✓",
    `Taxa de conclusão de intervenções: ${concludedPercent}%.`,
  ].filter(Boolean);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel da Diretoria</h1>
          <p className="text-muted-foreground text-sm">Visão estratégica institucional • Apenas visualização</p>
        </div>

        {/* Cards KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-xs text-risk-high flex items-center gap-1 mt-0.5"><TrendingUp className="h-3 w-3" /> +2.3% vs período anterior</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-risk-low" />
              <div>
                <p className="text-2xl font-bold">{concludedPercent}%</p>
                <p className="text-xs text-muted-foreground">Intervenções concluídas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-risk-high/30 bg-risk-high/5">
            <CardContent className="pt-4 flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-risk-high" />
              <div>
                <p className="text-2xl font-bold">{highRiskNoIntervention}</p>
                <p className="text-xs text-muted-foreground">Alto risco sem intervenção</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Turmas mais críticas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Turmas Mais Críticas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {turmaRanking.map((t, i) => (
                <div key={t.turma} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <span className="font-medium text-sm">{t.turma}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{t.highCount}/{t.total} alunos</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.pct >= 30 ? "bg-risk-high/10 text-risk-high" : t.pct >= 15 ? "bg-risk-medium/10 text-risk-medium" : "bg-risk-low/10 text-risk-low"}`}>
                      {t.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráficos lado a lado */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Comparativo entre Turmas</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={turmaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="alto" name="Alto risco" fill="hsl(0,72%,51%)" stackId="a" />
                  <Bar dataKey="medio" name="Médio risco" fill="hsl(45,93%,47%)" stackId="a" />
                  <Bar dataKey="baixo" name="Baixo risco" fill="hsl(142,71%,45%)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Eficácia das Intervenções</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={efficacyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {efficacyData.map((_, i) => <Cell key={i} fill={EFFICACY_COLORS[i % EFFICACY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risco por série + KPI aprendizagem */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Risco por Série (1º ao 5º Ano)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={riskBySeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serie" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="alto" name="Alto" fill="hsl(0,72%,51%)" stackId="a" />
                  <Bar dataKey="medio" name="Médio" fill="hsl(45,93%,47%)" stackId="a" />
                  <Bar dataKey="baixo" name="Baixo" fill="hsl(142,71%,45%)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">KPI de Aprendizagem por Área</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={learningData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="area" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="adequado" name="Adequado" fill="hsl(142,71%,45%)" stackId="a" />
                  <Bar dataKey="desenvolvimento" name="Em desenvolvimento" fill="hsl(45,93%,47%)" stackId="a" />
                  <Bar dataKey="defasado" name="Defasado" fill="hsl(0,72%,51%)" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-risk-medium" /> Insights Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
