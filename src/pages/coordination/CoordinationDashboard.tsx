import { useApp } from "@/context/AppContext";
import { turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Activity, Brain, Users, ArrowRight, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function CoordinationDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();

  // Mock de Alerta Crítico não lido (Isso viria do Supabase)
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [activeAlert] = useState({
    aluno: "Laura Barbosa",
    turma: "1º Ano A",
    professor: "Profa. Larissa",
    data: new Date().toLocaleDateString('pt-BR'),
    sintomas: ["Mudança brusca de humor", "Isolamento severo social"],
    descricao: "A aluna chegou chorando muito e recusou-se a falar com os colegas. Notamos que ela estava evitando o contato e com sinais de medo excessivo durante o recreio livre."
  });

  useEffect(() => {
    // Simulando o pull do banco de dados na montagem
    const timer = setTimeout(() => {
      setShowCriticalAlert(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

        <Dialog open={showCriticalAlert} onOpenChange={setShowCriticalAlert}>
          <DialogContent className="sm:max-w-[550px] border-red-500 shadow-red-900/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-700 flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 animate-pulse text-red-600" />
                Alerta Crítico Interceptado
              </DialogTitle>
              <DialogDescription className="text-base text-red-950/70 font-medium pt-2">
                O fluxo normal foi interrompido porque um professor reportou uma Ocorrência Urgente de risco iminente ou proteção à criança.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 my-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-900/60 block font-medium">Aluno(a) em risco</span>
                  <span className="font-bold text-slate-800 text-base">{activeAlert.aluno} <span className="text-xs font-normal text-slate-500">({activeAlert.turma})</span></span>
                </div>
                <div>
                  <span className="text-red-900/60 block font-medium">Reportado por</span>
                  <span className="font-bold text-slate-800 text-base">{activeAlert.professor}</span>
                </div>
              </div>

              <div>
                <span className="text-red-900/60 block font-medium mb-1">Fatores Sinalizados</span>
                <div className="flex flex-wrap gap-2">
                  {activeAlert.sintomas.map(s => (
                    <span key={s} className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md font-semibold border border-red-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-red-900/60 block font-medium mb-1">Detalhamento do Professor</span>
                <p className="text-sm text-slate-700 bg-white p-3 rounded-md border border-red-100 shadow-sm italic leading-relaxed">
                  "{activeAlert.descricao}"
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-between mt-2 flex-col sm:flex-row gap-3">
              <Button variant="ghost" onClick={() => setShowCriticalAlert(false)} className="text-slate-500">
                Lerei depois
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowCriticalAlert(false);
                  navigate('/coordenacao/ocorrencias/OC-1');
                }}
                className="bg-red-600 hover:bg-red-700 font-bold gap-2"
              >
                Assumir Caso e Tratar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
