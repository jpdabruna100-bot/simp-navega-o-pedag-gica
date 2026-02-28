import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskFilterButtons } from "@/components/RiskFilterButtons";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { turmas, RiskLevel, getPsychStatus, Student } from "@/data/mockData";
import { Brain, ShieldAlert, ArrowRight, NotebookPen, Clock, CheckCircle2, UserPlus, FileSearch, HeartHandshake } from "lucide-react";

type MultidisciplinaryStage = "triage" | "assessment" | "followup" | "completed";

export default function PsychologyDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();
  const [turmaFilter, setTurmaFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [profissionalFilter, setProfissionalFilter] = useState("all");

  const hasMultiIntervention = (s: Student) => s.interventions.some(i =>
    ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory)
  );

  const referred = students.filter((s) => s.psychReferral || hasMultiIntervention(s));

  // Determine stage for Kanban
  const getStage = (s: Student): MultidisciplinaryStage => {
    // Has unaccepted Multi Intervention? (Aguardando Triagem)
    const hasUnacceptedMulti = s.interventions.some(i =>
      ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory) &&
      !i.acceptedBy &&
      i.status !== "Concluído"
    );
    if (hasUnacceptedMulti) return "triage";

    // Legacy referral with no assessments and no accepted intervention
    if (s.psychReferral && s.psychAssessments.length === 0) {
      const hasAcceptedInt = s.interventions.some(i =>
        ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory) && i.acceptedBy
      );
      if (!hasAcceptedInt) return "triage";
    }

    const pStatus = getPsychStatus(s);

    if (pStatus === "pendente") return "assessment";
    if (pStatus === "em_acompanhamento") return "followup";
    if (pStatus === "avaliado") return "completed";

    return "triage";
  };

  const filtered = referred
    .filter((s) => turmaFilter === "all" || s.turmaId === turmaFilter)
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .filter((s) => search === "" || s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      if (profissionalFilter === "all") return true;

      const stage = getStage(s);
      if (stage === "triage") return true; // Fila não assumida é pública para todos verem e coletarem

      const activeInt = s.interventions.find(i =>
        ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory) && i.status !== "Concluído"
      );

      if (!activeInt || !activeInt.acceptedBy) return true; // Fallback

      const assumed = activeInt.acceptedBy.toLowerCase();
      if (profissionalFilter === "psicologia") return assumed.includes("fernanda") || assumed.includes("psicol");
      if (profissionalFilter === "psicopedagogia") return assumed.includes("beatriz") || assumed.includes("psicopedagog");

      return true;
    });

  const triageStudents = filtered.filter(s => getStage(s) === "triage");
  const assessmentStudents = filtered.filter(s => getStage(s) === "assessment");
  const followUpStudents = filtered.filter(s => getStage(s) === "followup");
  const completedStudents = filtered.filter(s => getStage(s) === "completed");

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

  const getUrgentHighlight = (s: Student) => s.id === "s1" && getStage(s) !== "completed";

  const renderKanbanCard = (student: Student) => {
    const isUrgent = getUrgentHighlight(student);
    const turma = turmas.find((t) => t.id === student.turmaId);

    // Find active multi intervention if any
    const activeInt = student.interventions.find(i =>
      ["Equipe Multidisciplinar", "Acionar Psicologia", "Acionar Psicopedagogia"].includes(i.actionCategory) && i.status !== "Concluído"
    );

    return (
      <div
        key={student.id}
        onClick={() => navigate(`/psicologia/aluno/${student.id}`)}
        className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${isUrgent ? 'border-red-300 ring-1 ring-red-100 shadow-red-100' : 'border-slate-200'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`font-semibold ${isUrgent ? 'text-red-900' : 'text-slate-800'}`}>{student.name}</h3>
            <p className="text-xs text-muted-foreground">{turma?.name} • {student.matricula}</p>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>

        {isUrgent && (
          <div className="mb-2 w-fit">
            <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase gap-1 px-1.5 py-0.5 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Tratativa Crítica (Hoje)
            </Badge>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {activeInt && activeInt.objetivo && (
            <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded p-1.5 line-clamp-2">
              <span className="font-semibold text-slate-400">Contexto:</span> {activeInt.objetivo}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            {activeInt && activeInt.acceptedBy ? (
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">Responsável:</span>
                <span className="text-indigo-700 font-semibold truncate max-w-[120px]">{activeInt.acceptedBy}</span>
              </div>
            ) : (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <UserPlus className="w-3 h-3" /> Fila Geral
              </span>
            )}
            <Badge variant="outline" className="text-[10px] text-slate-500 font-normal shadow-sm">Ver Prontuário</Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel Multidisciplinar</h1>
          <p className="text-muted-foreground text-sm">Dashboard de Triagem e Intervenções Pontuais</p>
        </div>

        <Dialog open={showCriticalAlert} onOpenChange={setShowCriticalAlert}>
          <DialogContent className="sm:max-w-[550px] border-red-500 shadow-red-900/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-700 flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 animate-pulse text-red-600" />
                Encaminhamento Crítico
              </DialogTitle>
              <DialogDescription className="text-base text-red-950/70 font-medium pt-2">
                A coordenação repassou um caso de urgência para a Equipe Multidisciplinar.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 my-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-900/60 block font-medium">Aluno(a) em risco</span>
                  <span className="font-bold text-slate-800 text-base">{activeAlert.aluno} <span className="text-xs font-normal text-slate-500">({activeAlert.turma})</span></span>
                </div>
                <div>
                  <span className="text-red-900/60 block font-medium">Solicitante</span>
                  <span className="font-bold text-slate-800 text-base">{activeAlert.coordenador}</span>
                </div>
              </div>

              <div>
                <span className="text-red-900/60 block font-medium mb-1">Contexto / Justificativa</span>
                <p className="text-sm text-slate-700 bg-white p-3 rounded-md border border-red-100 shadow-sm italic leading-relaxed">
                  "{activeAlert.observacaoCoord}"
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-between mt-2 flex-col sm:flex-row gap-3">
              <Button variant="ghost" onClick={() => setShowCriticalAlert(false)} className="text-slate-500">
                Fechar Alerta
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowCriticalAlert(false);
                  navigate('/psicologia/aluno/s1');
                }}
                className="bg-red-600 hover:bg-red-700 font-bold gap-2"
              >
                Detalhes do Prontuário
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
            className="w-full sm:w-64 bg-white"
          />
          <Select value={turmaFilter} onValueChange={setTurmaFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white"><SelectValue placeholder="Turma" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={profissionalFilter} onValueChange={setProfissionalFilter}>
            <SelectTrigger className="w-full sm:w-64 bg-white"><SelectValue placeholder="Profissional" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Meus Casos + Fila Geral</SelectItem>
              <SelectItem value="psicologia">Dra. Fernanda (Psicologia)</SelectItem>
              <SelectItem value="psicopedagogia">Dra. Beatriz (Psicopedagogia)</SelectItem>
            </SelectContent>
          </Select>
          <RiskFilterButtons value={riskFilter} onChange={setRiskFilter} />
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start pt-2">

          {/* Col 1 */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-600" />
                <h2 className="font-semibold gap-2 text-amber-900 text-sm">Fila de Triagem</h2>
              </div>
              <Badge variant="secondary" className="bg-amber-200/50 text-amber-800">{triageStudents.length}</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {triageStudents.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-xl text-slate-400 text-sm">Nenhum caso na fila</div>
              ) : triageStudents.map(renderKanbanCard)}
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-indigo-600" />
                <h2 className="font-semibold gap-2 text-indigo-900 text-sm">Em Avaliação Inicial</h2>
              </div>
              <Badge variant="secondary" className="bg-indigo-200/50 text-indigo-800">{assessmentStudents.length}</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {assessmentStudents.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-xl text-slate-400 text-sm">Nenhum aluno em avaliação</div>
              ) : assessmentStudents.map(renderKanbanCard)}
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                <h2 className="font-semibold gap-2 text-emerald-900 text-sm">Intervenções Pontuais</h2>
              </div>
              <Badge variant="secondary" className="bg-emerald-200/50 text-emerald-800">{followUpStudents.length}</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {followUpStudents.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-xl text-slate-400 text-sm">Nenhuma intervenção atrativa</div>
              ) : followUpStudents.map(renderKanbanCard)}
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
                <h2 className="font-semibold gap-2 text-slate-700 text-sm">Concluídos (Alta/Laudo)</h2>
              </div>
              <Badge variant="secondary" className="bg-slate-200 text-slate-700">{completedStudents.length}</Badge>
            </div>
            <div className="flex flex-col gap-3 opacity-60 hover:opacity-100 transition-opacity">
              {completedStudents.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-xl text-slate-400 text-sm">Nenhum caso concluído</div>
              ) : completedStudents.slice(0, 5).map(renderKanbanCard)}
              {completedStudents.length > 5 && (
                <div className="text-center text-xs text-muted-foreground pt-2 font-medium">+{completedStudents.length - 5} casos ocultos</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
