import { useApp } from "@/context/AppContext";
import { useState, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useCriticalOccurrencesAll } from "@/hooks/useSupabaseData";
import type { CriticalOccurrence } from "@/lib/supabase-queries";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContingencyPlanModal } from "@/components/ContingencyPlanModal";
import { toast } from "@/hooks/use-toast";
import { Clock, NotebookPen, FileText, CheckCircle2, Eye, ClipboardList, AlertCircle, ShieldAlert } from "lucide-react";
import { InterventionDetailView } from "@/components/InterventionDetailView";
import { Textarea } from "@/components/ui/textarea";
import { formatBRDate } from "@/lib/utils";
import { updateIntervention, insertInterventionUpdate } from "@/lib/supabase-mutations";

const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const pendingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para focar só no dia
    return pendingDate < today;
};

export default function InterventionManagement() {
    const { students, refetchStudents, turmas } = useApp();
    const { data: criticalOccurrences = [] } = useCriticalOccurrencesAll();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const preSelectedStudentId = searchParams.get("aluno");

    // Local state for modals
    const [activeModal, setActiveModal] = useState<"none" | "contingency" | "resolution" | "viewResolution">("none");
    const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);

    // Forms
    const [ataFinalText, setAtaFinalText] = useState("");

    const filtroNavegacao = searchParams.get("filtro");

    const allInterventions = useMemo(() => {
        let interventions = students.flatMap(s => s.interventions.map(i => ({
            ...i,
            studentName: s.name,
            studentId: s.id,
            isPsychReferral: !!s.psychReferral,
            riskLevel: s.riskLevel
        })));

        // Aplica o filtro vindo da URL (Cards da Dashboard) ou da Barra
        if (filtroNavegacao === "psicologia") {
            interventions = interventions.filter(i => (i.actionCategory === "Acionar Psicologia" || i.actionCategory === "Acionar Psicopedagogia" || i.actionCategory === "Equipe Multidisciplinar") && i.status !== "Aguardando");
        } else if (filtroNavegacao === "urgentes") {
            interventions = interventions.filter(i => (i.riskLevel === "high" || isOverdue(i.pendingUntil)) && i.status !== "Concluído");
        } else if (filtroNavegacao === "concluidos") {
            interventions = interventions.filter(i => i.status === "Concluído");
        } else if (filtroNavegacao === "atrasados") {
            interventions = interventions.filter(i => isOverdue(i.pendingUntil) && i.status === "Em_Acompanhamento");
        } else if (filtroNavegacao === "familia") {
            interventions = interventions.filter(i => i.actionCategory === "Acionar Família" && i.status !== "Aguardando");
        }

        return interventions;
    }, [students, filtroNavegacao]);

    // Ocorrências Críticas (quando filtro=ocorrencias)
    const occurrenceStages = useMemo(() => ({
        emTratativa: criticalOccurrences.filter((o) => o.status === "Em Tratativa"),
        resolvido: criticalOccurrences.filter((o) => o.status === "Resolvido"),
    }), [criticalOccurrences]);

    const getStudentName = (studentId: string) => students.find((s) => s.id === studentId)?.name ?? "Aluno";
    const getTurmaName = (studentId: string) => {
        const s = students.find((st) => st.id === studentId);
        return turmas?.find((t) => t.id === s?.turmaId)?.name ?? "—";
    };

    // Kanban Columns Data
    const kanbanStages = {
        agindo: allInterventions.filter(i => i.status === "Aguardando"),
        acompanhamento: allInterventions.filter(i => i.status === "Em_Acompanhamento"),
        concluido: allInterventions.filter(i => i.status === "Concluído"),
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Aguardando": return "bg-risk-high/10 text-risk-high border-risk-high/30";
            case "Em_Acompanhamento": return "bg-risk-medium/10 text-risk-medium border-risk-medium/30";
            case "Concluído": return "bg-risk-low/10 text-risk-low border-risk-low/30";
            default: return "bg-muted";
        }
    };

    const handleOpenContingency = (intvId: string) => {
        setSelectedInterventionId(intvId);
        setActiveModal("contingency");
    };

    const handleOpenResolution = (intvId: string) => {
        setSelectedInterventionId(intvId);
        setAtaFinalText("");
        setActiveModal("resolution");
    };

    const handleViewResolution = (intvId: string) => {
        setSelectedInterventionId(intvId);
        setActiveModal("viewResolution");
    };

    const handleConfirmResolution = async () => {
        if (!ataFinalText.trim() || !selectedInterventionId) {
            toast({ title: "A Ata de Resolução Final é obrigatória", variant: "destructive", duration: 3000 });
            return;
        }

        try {
            await updateIntervention(selectedInterventionId, {
                status: "Concluído",
                resolution_ata: ataFinalText,
            });
            await refetchStudents();
            toast({ title: "Ciclo encerrado com sucesso", description: "O caso foi fechado.", duration: 3000 });
            setActiveModal("none");
        } catch (e) {
            toast({ title: "Erro ao encerrar ciclo", description: String(e), variant: "destructive" });
        }
    };

    const handleAddUpdate = async (interventionId: string, content: string, isFinalResolution: boolean = false) => {
        const student = students.find(s => s.interventions.some(i => i.id === interventionId));
        if (!student) return;

        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const HH = String(date.getHours()).padStart(2, '0');
        const MM = String(date.getMinutes()).padStart(2, '0');

        try {
            await insertInterventionUpdate(interventionId, {
                date: `${yyyy}-${mm}-${dd}`,
                time: `${HH}:${MM}`,
                author: "Coordenação",
                content,
            });
            if (isFinalResolution) {
                await updateIntervention(interventionId, {
                    status: "Concluído",
                    resolution_ata: content,
                });
            }
            await refetchStudents();
            toast({
                title: isFinalResolution ? "Ciclo encerrado com sucesso" : "Andamento Registrado",
                description: isFinalResolution ? "O caso foi fechado a partir da timeline." : "A nota foi adicionada à timeline com sucesso.",
                duration: 3000
            });
        } catch (e) {
            toast({ title: "Erro ao registrar andamento", description: String(e), variant: "destructive" });
        }
    };

    // Render Occurrence Card (para filtro=ocorrencias)
    const OccurrenceCard = ({ occurrence }: { occurrence: CriticalOccurrence }) => (
        <Card
            className="mb-3 hover:shadow-md transition-all cursor-pointer border-rose-200 bg-rose-50/30"
            onClick={() => navigate(`/coordenacao/ocorrencias/${occurrence.id}`)}
        >
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm leading-tight text-rose-900">
                        {getStudentName(occurrence.studentId)}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-rose-300 bg-rose-100 text-rose-800">
                        {occurrence.status === "Em Tratativa" ? "Em Tratativa" : "Resolvido"}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{getTurmaName(occurrence.studentId)}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {occurrence.categories.slice(0, 3).map((c) => (
                        <span key={c} className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                            {c}
                        </span>
                    ))}
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{occurrence.description}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                    {occurrence.reportedBy ?? "Professor"} · {occurrence.reportedAt ? formatBRDate(occurrence.reportedAt.split("T")[0]) : "—"}
                </p>
                <Button size="sm" className="w-full text-xs h-7 mt-2 bg-rose-600 hover:bg-rose-700" variant="default"
                    onClick={(e) => { e.stopPropagation(); navigate(`/coordenacao/ocorrencias/${occurrence.id}`); }}
                >
                    <ShieldAlert className="h-3 w-3 mr-1" /> Abrir Dossiê
                </Button>
            </CardContent>
        </Card>
    );

    // Render Kanban Card
    const KanbanCard = ({ intervention }: { intervention: typeof allInterventions[0] }) => (
        <Card className="mb-3 hover:shadow-md transition-all">
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <Link to={`/coordenacao/aluno/${intervention.studentId}`} className="font-semibold text-sm leading-tight hover:underline hover:text-primary">
                        {intervention.studentName}
                    </Link>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${isOverdue(intervention.pendingUntil) && intervention.status === "Em_Acompanhamento" ? "bg-red-50 text-red-600 border-red-200" : getStatusColor(intervention.status)}`}>
                        {intervention.status === "Em_Acompanhamento" ? (isOverdue(intervention.pendingUntil) ? "Atrasado" : "Em Acomp.") : intervention.status}
                    </Badge>
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                    {intervention.status === "Aguardando" && (
                        <p className="flex items-center gap-1 font-medium text-slate-500"><NotebookPen className="h-3 w-3" /> Recebido (Pendente de Análise)</p>
                    )}
                    {intervention.status !== "Aguardando" && (
                        <>
                            {!(intervention.actionCategory === "Acionar Psicologia" || intervention.actionCategory === "Acionar Psicopedagogia" || intervention.actionCategory === "Equipe Multidisciplinar") && (
                                <p className="flex items-center gap-1"><NotebookPen className="h-3 w-3" /> {intervention.actionCategory}</p>
                            )}
                            {(intervention.actionCategory === "Acionar Psicologia" || intervention.actionCategory === "Acionar Psicopedagogia" || intervention.actionCategory === "Equipe Multidisciplinar") && (
                                <div className={`mt-1.5 flex flex-col gap-1 border border-l-2 p-1.5 rounded bg-white shadow-sm ${intervention.acceptedBy ? 'border-indigo-100 border-l-indigo-400' : 'border-slate-100 border-l-slate-300'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${intervention.acceptedBy ? 'text-indigo-800' : 'text-slate-500'}`}>
                                        {intervention.acceptedBy ? intervention.actionCategory.replace("Acionar ", "") : "Equipe Multidisciplinar"}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1">
                                        {intervention.acceptedBy ? (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                Responsável: <span className="text-slate-800 font-semibold">{intervention.acceptedBy}</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                Aguardando Triagem/Aceite
                                            </>
                                        )}
                                    </span>
                                </div>
                            )}
                            <p className="mt-1.5 font-medium truncate text-slate-700">{intervention.actionTool}</p>
                        </>
                    )}
                </div>

                {intervention.objetivo && intervention.status !== "Aguardando" && (
                    <div className="mt-1.5 text-[11px] text-slate-500 bg-white/50 border border-slate-100 rounded p-1.5 line-clamp-2" title={intervention.objetivo}>
                        <span className="font-semibold text-slate-400">Estratégia:</span> {intervention.objetivo}
                    </div>
                )}

                {intervention.pendingUntil && intervention.status === "Em_Acompanhamento" && (
                    <div className={`mt-2 border rounded p-1.5 text-[10px] flex items-center gap-1.5 ${isOverdue(intervention.pendingUntil) ? "bg-red-50/50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                        {isOverdue(intervention.pendingUntil) ? <AlertCircle className="h-3 w-3 text-red-500" /> : <Clock className="h-3 w-3 text-risk-medium" />}
                        <span>Pendência até: <strong className={isOverdue(intervention.pendingUntil) ? "text-red-700 font-bold" : "text-slate-700"}>{formatBRDate(intervention.pendingUntil)}</strong></span>
                    </div>
                )}

                <div className="mt-3 flex gap-2">
                    {intervention.status === "Aguardando" && (
                        <Button size="sm" className="w-full text-xs h-7" variant="outline"
                            onClick={() => handleOpenContingency(intervention.id)}
                        >
                            Iniciar Plano Estratégico
                        </Button>
                    )}
                    {intervention.status === "Em_Acompanhamento" && (
                        <>
                            <Button size="sm" className="w-1/2 text-xs h-7 text-muted-foreground hover:text-slate-700 bg-slate-50 border-slate-200 px-1" variant="outline"
                                onClick={() => handleViewResolution(intervention.id)}
                            >
                                <Eye className="h-3 w-3 mr-1" /> Andamento
                            </Button>
                            <Button size="sm" className="w-1/2 text-xs h-7 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 px-1" variant="outline"
                                onClick={() => handleOpenResolution(intervention.id)}
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                            </Button>
                        </>
                    )}
                    {intervention.status === "Concluído" && (
                        <Button size="sm" className="w-full text-xs h-7 text-muted-foreground hover:text-slate-700 bg-slate-50 border-slate-200" variant="outline"
                            onClick={() => handleViewResolution(intervention.id)}
                        >
                            <FileText className="h-3 w-3 mr-1" /> Histórico
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Planos de Acompanhamento
                            {filtroNavegacao && (
                                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                    Modo Triagem
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground text-sm">Gestão de Tratativas e Acompanhamento Pedagógico</p>
                    </div>
                </div>

                {/* Barra de Filtros Rápida */}
                <div className="flex flex-wrap items-center gap-2 mb-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="text-sm font-medium text-slate-600 mr-2 flex items-center gap-1.5 hidden sm:flex">
                        Filtrar visualização:
                    </span>
                    <Button
                        variant={!filtroNavegacao ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${!filtroNavegacao ? "bg-slate-700 hover:bg-slate-800" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({})}
                    >
                        Todos os Casos
                    </Button>
                    <Button
                        variant={filtroNavegacao === "urgentes" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${filtroNavegacao === "urgentes" ? "bg-red-600 hover:bg-red-700" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({ filtro: "urgentes" })}
                    >
                        Prioridade Alta
                    </Button>
                    <Button
                        variant={filtroNavegacao === "ocorrencias" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${filtroNavegacao === "ocorrencias" ? "bg-rose-600 hover:bg-rose-700" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({ filtro: "ocorrencias" })}
                    >
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Ocorrências Críticas
                    </Button>
                    <Button
                        variant={filtroNavegacao === "psicologia" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${filtroNavegacao === "psicologia" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({ filtro: "psicologia" })}
                    >
                        Equipe Multidisciplinar
                    </Button>
                    <Button
                        variant={filtroNavegacao === "familia" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${filtroNavegacao === "familia" ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({ filtro: "familia" })}
                    >
                        Esfera Familiar
                    </Button>
                    <Button
                        variant={filtroNavegacao === "atrasados" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${filtroNavegacao === "atrasados" ? "bg-red-500 hover:bg-red-600 text-white" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({ filtro: "atrasados" })}
                    >
                        Somente Atrasados
                    </Button>
                    <Button
                        variant={filtroNavegacao === "concluidos" ? "default" : "outline"}
                        size="sm"
                        className={`h-8 rounded-full px-4 text-xs ${filtroNavegacao === "concluidos" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-slate-600 border-slate-200 bg-white"}`}
                        onClick={() => setSearchParams({ filtro: "concluidos" })}
                    >
                        Apenas Concluídos
                    </Button>
                </div>

                {/* Kanban Board ou Lista de Ocorrências Críticas */}
                <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">

                    {filtroNavegacao === "ocorrencias" ? (
                        <>
                            {/* Modo Ocorrências: Em Tratativa */}
                            <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-200 flex flex-col min-h-[400px] h-[calc(100vh-180px)] min-w-[300px] flex-1">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-200">
                                    <h2 className="font-semibold text-rose-800 flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                                        Em Tratativa
                                    </h2>
                                    <Badge variant="secondary" className="bg-rose-100 text-rose-800">{occurrenceStages.emTratativa.length}</Badge>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1">
                                    {occurrenceStages.emTratativa.map((o) => <OccurrenceCard key={o.id} occurrence={o} />)}
                                    {occurrenceStages.emTratativa.length === 0 && <p className="text-xs text-center text-muted-foreground py-10">Nenhuma ocorrência em tratativa.</p>}
                                </div>
                            </div>
                            {/* Modo Ocorrências: Resolvidas */}
                            <div className="bg-slate-50/50 rounded-xl p-4 border flex flex-col min-h-[400px] h-[calc(100vh-180px)] min-w-[300px] flex-1">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-risk-low"></div>
                                        Resolvidas
                                    </h2>
                                    <Badge variant="secondary">{occurrenceStages.resolvido.length}</Badge>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1">
                                    {occurrenceStages.resolvido.map((o) => <OccurrenceCard key={o.id} occurrence={o} />)}
                                    {occurrenceStages.resolvido.length === 0 && <p className="text-xs text-center text-muted-foreground py-10">Nenhuma ocorrência resolvida.</p>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                    {/* Column 1: Aguardando Ação */}
                    <div className="bg-slate-50/50 rounded-xl p-4 border flex flex-col min-h-[400px] h-[calc(100vh-180px)] min-w-[300px] flex-1">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-risk-high"></div>
                                Aguardando Ação
                            </h2>
                            <Badge variant="secondary">{kanbanStages.agindo.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {kanbanStages.agindo.map(i => <KanbanCard key={i.id} intervention={i} />)}
                            {kanbanStages.agindo.length === 0 && <p className="text-xs text-center text-muted-foreground py-10">Tudo limpo por aqui.</p>}
                        </div>
                    </div>

                    {/* Column 2: Em Acompanhamento */}
                    <div className="bg-slate-50/50 rounded-xl p-4 border flex flex-col min-h-[400px] h-[calc(100vh-180px)] min-w-[300px] flex-1">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-risk-medium"></div>
                                Em Acompanhamento
                            </h2>
                            <Badge variant="secondary">{kanbanStages.acompanhamento.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {kanbanStages.acompanhamento.map(i => <KanbanCard key={i.id} intervention={i} />)}
                        </div>
                    </div>

                    {/* Column 3: Concluído */}
                    <div className="bg-slate-50/50 rounded-xl p-4 border flex flex-col min-h-[400px] h-[calc(100vh-180px)] min-w-[300px] flex-1">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-risk-low"></div>
                                Concluídos (Recentes)
                            </h2>
                            <Badge variant="secondary">{kanbanStages.concluido.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {kanbanStages.concluido.map(i => <KanbanCard key={i.id} intervention={i} />)}
                        </div>
                    </div>
                        </>
                    )}

                </div>
            </div>

            {/* MODAL: Plano de Contingência */}
            <ContingencyPlanModal
                open={activeModal === "contingency"}
                onOpenChange={(open) => !open && setActiveModal("none")}
                interventionId={selectedInterventionId}
                onConfirm={() => setActiveModal("none")}
            />

            {/* MODAL: Resolução Final */}
            <Dialog open={activeModal === "resolution"} onOpenChange={(open) => !open && setActiveModal("none")}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-risk-low" />
                            Ata de Resolução Final
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Descreva os detalhes e a conclusão da tratativa final para poder encerrar este alerta e limpar a pendência do aluno.
                        </p>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Ação foi realizada com sucesso. O resultado obtido foi..."
                                className="min-h-[150px] resize-none"
                                value={ataFinalText}
                                onChange={(e) => setAtaFinalText(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleConfirmResolution} className="w-full">Assinar e Cerrar Ciclo</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL: Visualizar Ata Final / Progresso da Ação */}
            <Dialog open={activeModal === "viewResolution"} onOpenChange={(open) => !open && setActiveModal("none")}>
                <DialogContent className="sm:max-w-[600px] bg-slate-50/50 max-h-[90vh] flex flex-col overflow-hidden p-0">
                    <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-indigo-600" />
                            Acompanhamento Estratégico (Tratativa)
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 pb-2 pt-4">
                        {allInterventions.find(i => i.id === selectedInterventionId) && (
                            <InterventionDetailView
                                interventionToView={allInterventions.find(i => i.id === selectedInterventionId)!}
                                studentName={allInterventions.find(i => i.id === selectedInterventionId)?.studentName}
                                onAddUpdate={(content, isFinal) => handleAddUpdate(selectedInterventionId!, content, isFinal)}
                            />
                        )}
                    </div>
                    <div className="px-6 py-3 border-t bg-white flex justify-end shrink-0">
                        <Button variant="outline" onClick={() => setActiveModal("none")}>Fechar Janela</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </Layout>
    );
}
