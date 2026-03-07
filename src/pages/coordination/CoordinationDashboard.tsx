import { useApp } from "@/context/AppContext";
import { useCriticalOccurrences, useCriticalOccurrencesRealtime } from "@/hooks/useSupabaseData";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Activity, Brain, Users, ArrowRight, ShieldAlert, TrendingUp, ClipboardList } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList, Legend } from "recharts";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef } from "react";

export default function CoordinationDashboard() {
  const { students, turmas, isLoading } = useApp();
  const { data: criticalOccurrences = [], refetch: refetchOccurrences } = useCriticalOccurrences();
  useCriticalOccurrencesRealtime();
  const navigate = useNavigate();
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const prevCountRef = useRef(0);

  // Refetch ao abrir o dashboard para pegar alertas recém-criados
  useEffect(() => {
    refetchOccurrences();
  }, [refetchOccurrences]);

  // Popup quando há ocorrências críticas (novas ou ao abrir)
  useEffect(() => {
    const n = criticalOccurrences.length;
    if (n > 0 && n > prevCountRef.current) {
      prevCountRef.current = n;
      setShowCriticalAlert(true);
    }
  }, [criticalOccurrences.length]);

  const highRisk = students.filter((s) => s.riskLevel === "high").length;
  const medRisk = students.filter((s) => s.riskLevel === "medium").length;
  const lowRisk = students.filter((s) => s.riskLevel === "low").length;
  const activeInterventions = students.flatMap((s) => s.interventions).filter((i) => i.status === "Em_Acompanhamento").length;
  const overdueInterventions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return students.flatMap((s) => s.interventions).filter((i) => {
      if (i.status !== "Em_Acompanhamento" || !i.pendingUntil) return false;
      const pending = new Date(i.pendingUntil);
      pending.setHours(0, 0, 0, 0);
      return pending < today;
    }).length;
  }, [students]);
  const pendingPsych = students.flatMap((s) => s.interventions).filter((i) => i.actionCategory === "Acionar Psicologia" && i.status !== "Concluído").length;

  const areaData = [
    { area: "Leitura", insuficientes: students.filter((s) => s.assessments.some((a) => a.leitura === "Defasada")).length },
    { area: "Escrita", insuficientes: students.filter((s) => s.assessments.some((a) => a.escrita === "Defasada")).length },
    { area: "Matemática", insuficientes: students.filter((s) => s.assessments.some((a) => a.matematica === "Defasada")).length },
    { area: "Atenção", insuficientes: students.filter((s) => s.assessments.some((a) => a.atencao === "Defasada")).length },
  ];

  const pieData = [
    { name: "Baixo risco", value: lowRisk, color: "#10b981" }, // emerald-500
    { name: "Médio risco", value: medRisk, color: "#f59e0b" }, // amber-500
    { name: "Alto risco", value: highRisk, color: "#ef4444" }, // red-500
  ];

  const studentsWithTeamActivity = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const isRecent = (d: string) => d === today || d === yesterday;
    const isTeamEvent = (e: { type: string; description?: string }) =>
      e.type === "psych" ||
      e.type === "pei_atualizado" ||
      (e.type === "intervention" && (e.description?.includes("assumido") || e.description?.includes("concluído")));
    return students
      .filter((s) => s.timeline?.some((e) => isRecent(e.date) && isTeamEvent(e)))
      .map((s) => {
        const lastEvent = s.timeline?.find((e) => isRecent(e.date) && isTeamEvent(e));
        return { student: s, lastEvent };
      })
      .sort((a, b) => (b.lastEvent?.date ?? "").localeCompare(a.lastEvent?.date ?? ""));
  }, [students]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  const firstOccurrence = criticalOccurrences[0];
  const firstStudent = firstOccurrence ? students.find((s) => s.id === firstOccurrence.studentId) : null;

  return (
    <Layout>
      {/* Popup: Alerta crítico aguardando ação */}
      {criticalOccurrences.length > 0 && (
        <Dialog open={showCriticalAlert} onOpenChange={setShowCriticalAlert}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-rose-700 flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 animate-pulse text-rose-600" />
                Alerta Crítico Recebido
              </DialogTitle>
              <DialogDescription className="text-base text-rose-950/70 font-medium pt-2">
                {criticalOccurrences.length === 1
                  ? "Um professor registrou um alerta de proteção que requer ação imediata."
                  : `${criticalOccurrences.length} alertas críticos aguardando ação da coordenação.`}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100 my-2 space-y-4">
              {firstStudent && firstOccurrence && (
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-rose-900/60 block font-medium">Aluno(a)</span>
                    <span className="font-bold text-slate-800 text-base">
                      {firstStudent.name}{" "}
                      <span className="text-xs font-normal text-slate-500">({turmas?.find((t) => t.id === firstStudent.turmaId)?.name ?? "—"})</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-900/60 block font-medium">Reportado por</span>
                    <span className="font-bold text-slate-800">{firstOccurrence.reportedBy ?? "Professor"}</span>
                  </div>
                  {firstOccurrence.description && (
                    <div>
                      <span className="text-rose-900/60 block font-medium mb-1">Descrição</span>
                      <p className="text-sm text-slate-700 bg-white p-3 rounded-md border border-rose-100 line-clamp-3">
                        {firstOccurrence.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowCriticalAlert(false)} className="text-slate-500">
                Fechar
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 font-bold gap-2"
                onClick={() => {
                  setShowCriticalAlert(false);
                  navigate("/coordenacao/intervencoes?filtro=ocorrencias");
                }}
              >
                Ver na Fila de Aguardando Ação
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-6">
        <div className="flex flex-col mb-2">
          <h1 className="text-2xl font-bold">Dashboard Estratégico</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão Analítica de Casos e Acompanhamentos Pedagógicos</p>
        </div>

        {/* Action / Filter Bar */}
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-2">
          <div className="space-y-1.5 w-full sm:w-auto flex-1 md:flex-none">
            <Label className="text-xs text-muted-foreground font-medium">Filtrar por Turma</Label>
            <div className="w-full md:w-[250px] border rounded-md px-3 py-2 text-sm bg-white flex justify-between items-center text-slate-700 shadow-sm">
              Todas as turmas <span className="text-muted-foreground text-xs">⌄</span>
            </div>
          </div>
          <div className="space-y-1.5 w-full sm:w-auto flex-1 md:flex-none">
            <Label className="text-xs text-muted-foreground font-medium">Filtrar por Periodo</Label>
            <div className="w-full md:w-[250px] border rounded-md px-3 py-2 text-sm bg-white flex justify-between items-center text-slate-700 shadow-sm">
              Todos os períodos <span className="text-muted-foreground text-xs">⌄</span>
            </div>
          </div>
          <div className="ml-auto w-full sm:w-auto text-sm text-slate-500 font-medium py-2">
            Total: {students.length} estudantes
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* Card 0: Alerta Urgente (Gestão de Risco) */}
          <Card
            className="border-l-[6px] border-l-rose-600 cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group bg-gradient-to-br from-rose-50 to-rose-100/50"
            onClick={() => navigate("/coordenacao/intervencoes?filtro=ocorrencias")}
          >
            <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-rose-900 font-bold text-sm">Alerta Urgente Ativo</h3>
                  <div className="relative inline-block mt-2">
                    {criticalOccurrences.length > 0 && (
                      <span className="animate-ping absolute top-1 -left-1 h-8 w-8 rounded-full bg-rose-400 opacity-40"></span>
                    )}
                    <p className="text-5xl font-black text-rose-700 relative">{criticalOccurrences.length}</p>
                  </div>
                </div>
                <div className="bg-rose-200/50 p-2 rounded-lg">
                  <ShieldAlert className="h-8 w-8 text-rose-600" />
                </div>
              </div>

              <div className="space-y-1 mt-2">
                <p className="text-xs font-semibold text-rose-800">Dossiê #OC-1</p>
                <p className="text-rose-600 font-medium text-xs leading-tight">Gestão de Risco Iminente requer ação imediata da coordenação.</p>
              </div>

              <div className="mt-4 pt-4 pb-1 border-t border-rose-200/60">
                <div className="flex items-center text-rose-700 text-xs font-bold gap-1 group-hover:gap-2 transition-all">
                  Assumir Caso Imediatamente <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 1: Prioridade Alta */}
          <Card
            className="border-l-[6px] border-l-red-500 cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group bg-gradient-to-br from-white to-red-50/20"
            onClick={() => navigate('/coordenacao/intervencoes?filtro=urgentes')}
          >
            <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-600 font-medium text-sm">Prioridade Alta</h3>
                  <p className="text-5xl font-bold text-red-600 mt-2">{highRisk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400 opacity-80" />
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Proporção do total</span>
                  <span className="text-red-600">{students.length ? Math.round((highRisk / students.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${students.length ? Math.round((highRisk / students.length) * 100) : 0}%` }}></div>
                </div>
              </div>

              <div
                className="mt-2 bg-red-600 hover:bg-red-700 transition-colors text-white py-2 rounded-md font-bold text-sm text-center shadow-md cursor-pointer relative z-10 w-full animate-pulse flex justify-center items-center gap-2"
                onClick={(e) => { e.stopPropagation(); navigate('/coordenacao/intervencoes?filtro=urgentes'); }}
              >
                Triar Alunos
                <ArrowRight className="h-4 w-4" />
              </div>

              <p className="text-xs text-slate-400 mt-1">Atuar sobre métricas de alto risco</p>
            </CardContent>
          </Card>

          {/* Card 2: Acompanhamentos Ativos */}
          <Card
            className="border-l-[6px] border-l-amber-400 cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group bg-gradient-to-br from-white to-amber-50/20"
            onClick={() => navigate('/coordenacao/intervencoes')}
          >
            <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-600 font-medium text-sm">Acompanhamentos Ativos</h3>
                  <p className="text-5xl font-bold text-amber-500 mt-2">{activeInterventions}</p>
                </div>
                <Activity className="h-8 w-8 text-amber-400 opacity-80" />
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Planos de Ação Criados</span>
                  <span className="text-amber-500">42%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all duration-1000 w-[42%]"></div>
                </div>
              </div>

              <div className="flex justify-between mt-2 pt-2 pb-1 border-t border-slate-100">
                <div className="text-center w-1/2 border-r border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">No Prazo</p>
                  <p className="text-emerald-600 font-bold">{activeInterventions - overdueInterventions}</p>
                </div>
                <div className="text-center w-1/2">
                  <p className="text-xs text-slate-500 font-medium">Atrasados</p>
                  <p className="text-red-500 font-bold animate-pulse">{overdueInterventions}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 pb-1 border-t border-slate-100">
                <div className="flex items-center text-amber-600 text-xs font-bold gap-1 group-hover:gap-2 transition-all">
                  Gerenciar Acompanhamentos <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Encaminhamentos Psicologia */}
          <Card
            className="border-l-[6px] border-l-blue-500 cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group bg-gradient-to-br from-white to-blue-50/20"
            onClick={() => navigate('/coordenacao/intervencoes?filtro=psicologia')}
          >
            <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-600 font-medium text-sm">Aguardando Psicologia</h3>
                  <p className="text-5xl font-bold text-blue-600 mt-2">{pendingPsych}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-400 opacity-80" />
              </div>

              <div className="space-y-1 mt-4">
                <p className="text-xs font-semibold text-slate-500">Prazo Regimental de Escuta</p>
                <p className="text-slate-700 font-bold text-sm mt-1">48hs Úteis</p>
              </div>

              <div className="mt-4 pt-4 pb-1 border-t border-slate-100">
                <div className="flex items-center text-blue-600 text-xs font-bold gap-1 group-hover:gap-2 transition-all">
                  Cobrar Parecer <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Gráfico 1: Defasagem */}
          <Card className="border shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#f8f9fc] border-b border-slate-100 px-6 py-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-slate-800 font-bold text-lg">Defasagem por Área</h3>
            </div>
            <CardContent className="pt-8 flex-1 pb-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={areaData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="area" tick={{ fontSize: 13, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 13, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="insuficientes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60}>
                    <LabelList dataKey="insuficientes" position="top" fill="#1d4ed8" fontSize={12} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico 2: Distribuição */}
          <Card className="border shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#f0fdf4] border-b border-emerald-50 px-6 py-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <h3 className="text-slate-800 font-bold text-lg">Distribuição de Prioridade</h3>
            </div>
            <CardContent className="flex justify-center flex-1 pt-8 pb-4">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={0}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                    label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                    className="text-white text-xs font-bold"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Card Atualizações da Equipe (4.2 C) */}
        <Card className="border border-amber-100 shadow-sm bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-amber-700" />
              Atualizações da Equipe
            </CardTitle>
            <p className="text-sm text-muted-foreground">Alunos com atividade recente da equipe multidisciplinar (últimas 24h)</p>
          </CardHeader>
          <CardContent>
            {studentsWithTeamActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhuma atualização nas últimas 24h.</p>
            ) : (
              <ul className="space-y-2">
                {studentsWithTeamActivity.slice(0, 8).map(({ student, lastEvent }) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/coordenacao/aluno/${student.id}`)}
                      className="w-full text-left flex items-center justify-between gap-2 py-2 px-3 rounded-md hover:bg-amber-100/80 transition-colors"
                    >
                      <span className="font-medium text-sm truncate">{student.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {lastEvent?.date ? new Date(lastEvent.date + "T12:00:00").toLocaleDateString("pt-BR") : ""}
                      </span>
                    </button>
                    {lastEvent?.description && (
                      <p className="text-xs text-muted-foreground pl-3 pb-1 truncate">{lastEvent.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {studentsWithTeamActivity.length > 8 && (
              <p className="text-xs text-muted-foreground mt-2">+{studentsWithTeamActivity.length - 8} outros</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bottom Action Card 1: Diretório de Alunos */}
          <Card
            className="border border-violet-100 shadow-sm bg-violet-50/50 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            onClick={() => console.log('Navegar para busca de alunos')}
          >
            <CardContent className="p-8 text-center space-y-4">
              <AlertTriangle className="h-10 w-10 text-violet-600 mx-auto group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-[#41128a] font-bold text-lg">Diretório Escolar</h3>
                <p className="text-violet-600/80 text-sm mt-1">Busque rapidamente por qualquer aluno ou turma</p>
              </div>
              <div className="bg-violet-600 group-hover:bg-violet-700 transition-colors text-white font-bold text-xs py-3 rounded-full w-full mt-4 flex justify-center items-center gap-2">
                Buscar Estudante
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Action Card 2: Relatórios */}
          <Card
            className="border border-cyan-100 shadow-sm bg-cyan-50/50 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            onClick={() => console.log('Abrir painel de relatórios')}
          >
            <CardContent className="p-8 text-center space-y-4">
              <Activity className="h-10 w-10 text-cyan-700 mx-auto group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-[#0e5c58] font-bold text-lg">Relatórios e Extratos</h3>
                <p className="text-cyan-700/80 text-sm mt-1">Exportar PDFs para Conselho de Classe e Auditorias</p>
              </div>
              <div className="bg-[#0e7490] group-hover:bg-[#164e63] transition-colors text-white font-bold text-xs py-3 rounded-full w-full mt-4 flex justify-center items-center gap-2">
                Gerar Relatórios
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </Layout>
  );
}
