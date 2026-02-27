import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskFilterButtons } from "@/components/RiskFilterButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { turmas, RiskLevel, getPsychStatus, getPsychStatusLabel, getFamilyContactStatusLabel } from "@/data/mockData";
import { Brain, Clock, CheckCircle, AlertCircle, Phone, ShieldAlert, ArrowRight } from "lucide-react";

type StatusFilter = "all" | "pendente" | "em_acompanhamento" | "avaliado" | "urgente";

export default function PsychologyDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const referred = students.filter((s) => s.psychReferral);

  const filtered = referred
    .filter((s) => statusFilter === "urgente" ? s.id === "s1" : true)
    .filter((s) => turmaFilter === "all" || s.turmaId === turmaFilter)
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .filter((s) => ["all", "urgente"].includes(statusFilter) || getPsychStatus(s) === statusFilter)
    .filter((s) => search === "" || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => { // Force urgent items (like s1) to the top of standard views
      if (a.id === "s1") return -1;
      if (b.id === "s1") return 1;
      return 0;
    });

  const statusIcon = (status: string, isUrgent: boolean = false) => {
    if (isUrgent) return <ShieldAlert className="h-3.5 w-3.5" />;
    switch (status) {
      case "pendente": return <AlertCircle className="h-3.5 w-3.5" />;
      case "em_acompanhamento": return <Clock className="h-3.5 w-3.5" />;
      case "avaliado": return <CheckCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const statusVariant = (status: string, isUrgent: boolean = false): "destructive" | "default" | "secondary" | "outline" => {
    if (isUrgent) return "destructive";
    switch (status) {
      case "pendente": return "destructive";
      case "em_acompanhamento": return "default";
      case "avaliado": return "secondary";
      default: return "outline";
    }
  };

  // Mock de Alerta Crítico não lido vindo da coordenação
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [activeAlert] = useState({
    aluno: "Laura Barbosa",
    turma: "1º Ano A",
    coordenador: "Coordenação",
    data: new Date().toLocaleDateString('pt-BR'),
    sintomas: ["Mudança brusca de humor", "Isolamento severo social"],
    observacaoCoord: "O aluno apresentou choro constante e isolamento durante o recreio. Solicito avaliação urgente dos sintomas observados."
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCriticalAlert(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel Psicologia</h1>
          <p className="text-muted-foreground text-sm">Dra. Fernanda Costa</p>
        </div>

        <Dialog open={showCriticalAlert} onOpenChange={setShowCriticalAlert}>
          <DialogContent className="sm:max-w-[550px] border-red-500 shadow-red-900/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-700 flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 animate-pulse text-red-600" />
                Encaminhamento Crítico Recebido
              </DialogTitle>
              <DialogDescription className="text-base text-red-950/70 font-medium pt-2">
                A coordenação repassou um caso de urgência que requer avaliação psicológica imediata.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 my-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-900/60 block font-medium">Aluno(a) em risco</span>
                  <span className="font-bold text-slate-800 text-base">{activeAlert.aluno} <span className="text-xs font-normal text-slate-500">({activeAlert.turma})</span></span>
                </div>
                <div>
                  <span className="text-red-900/60 block font-medium">Encaminhado por</span>
                  <span className="font-bold text-slate-800 text-base">{activeAlert.coordenador}</span>
                </div>
              </div>

              <div>
                <span className="text-red-900/60 block font-medium mb-1">Nota da Coordenação</span>
                <p className="text-sm text-slate-700 bg-white p-3 rounded-md border border-red-100 shadow-sm italic leading-relaxed">
                  "{activeAlert.observacaoCoord}"
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
                  navigate('/psicologia/aluno/s1');
                }}
                className="bg-red-600 hover:bg-red-700 font-bold gap-2"
              >
                Assumir Caso Imediatamente
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <SelectItem value="urgente" className="flex items-center gap-1.5 focus:bg-red-100 hover:bg-red-100! font-bold text-red-700!">🚨 Ocorrências Urgentes</SelectItem>
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
              const isUrgent = student.id === "s1";
              const familyStatus = getFamilyContactStatusLabel(student.familyContact);
              return (
                <div
                  key={student.id}
                  onClick={() => navigate(`/psicologia/aluno/${student.id}`)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors gap-3 ${isUrgent ? 'bg-red-50/80 hover:bg-red-100 border border-red-200' : 'bg-muted/50 hover:bg-muted'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isUrgent ? 'text-red-900' : ''}`}>{student.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{turma?.name} • Mat: {student.matricula}</p>
                      {isUrgent && <span className="text-xs font-semibold text-red-500">Hoje</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {isUrgent ? (
                        <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] gap-1 px-1.5 py-0.5 animate-pulse">
                          {statusIcon(status, true)} Tratativa Imediata
                        </Badge>
                      ) : (
                        <Badge variant={statusVariant(status, false)} className="text-[10px] gap-1 px-1.5 py-0.5">
                          {statusIcon(status, false)}
                          {getPsychStatusLabel(status)}
                        </Badge>
                      )}

                      {student.familyContact && !isUrgent && (
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
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-emerald-50 p-4 rounded-full mb-3">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Tudo sob controle!</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-1">
                  {statusFilter === "urgente"
                    ? "Nenhuma ocorrência crítica aguardando sua intervenção no momento."
                    : "Nenhum aluno encontrado para os filtros selecionados."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
