import { useState } from "react";
import { ClipboardList, Clock, CheckCircle2, CircleDashed, Plus, AlertCircle } from "lucide-react";
import type { Intervention } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export interface InterventionDetailViewProps {
    interventionToView: Intervention;
    studentName?: string;
    onAddUpdate?: (content: string, isFinalResolution: boolean) => void;
}

const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const pendingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para focar só no dia
    return pendingDate < today;
};

const formatBRDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
    return dateStr;
};

const statusColor = (s: string) => {
    if (s === "Concluída" || s === "Concluído") return "bg-risk-low/10 text-risk-low border-risk-low/20";
    if (s === "Em andamento" || s === "Em_Acompanhamento") return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
    if (s === "Aguardando") return "bg-risk-high/10 text-risk-high border-risk-high/20";
    return "bg-muted text-muted-foreground";
};

export function InterventionDetailView({ interventionToView, studentName, onAddUpdate }: InterventionDetailViewProps) {
    const [newUpdate, setNewUpdate] = useState("");
    const [isFinalResolution, setIsFinalResolution] = useState(false);

    if (!interventionToView) return null;

    const handleAdd = () => {
        if (!newUpdate.trim()) return;
        onAddUpdate?.(newUpdate, isFinalResolution);
        setNewUpdate("");
        setIsFinalResolution(false);
    }

    return (
        <div className="space-y-5 py-2">
            {/* Header Box */}
            <div className="bg-white border rounded-xl p-4 shadow-sm relative overflow-hidden flex-shrink-0">
                <div className={`absolute top-0 right-0 w-2 h-full ${statusColor(interventionToView.status).split(' ')[0]}`} />
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</span>
                        <p className="font-semibold text-slate-800 text-base">{interventionToView.actionCategory}</p>
                    </div>
                    <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(interventionToView.status)}`}>
                        {interventionToView.status === "Em_Acompanhamento" ? "Em Acompanhamento" : interventionToView.status}
                    </span>
                </div>
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estratégia Escolhida</span>
                    <p className="font-medium text-slate-700">{interventionToView.actionTool}</p>
                </div>
            </div>

            {/* Justificativa e Metadados */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="col-span-2 bg-white border rounded-xl p-4 shadow-sm border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Justificativa</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{interventionToView.objetivo}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-sm border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Responsável Inicial</span>
                    <p className="text-sm font-medium text-slate-700">{interventionToView.responsavel}</p>
                    <p className="text-xs text-slate-500 mt-1">Iniciado em: {formatBRDate(interventionToView.date)}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-sm border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Prazo de Resolução</span>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${interventionToView.status !== "Concluído" && isOverdue(interventionToView.pendingUntil)
                        ? "text-red-600 font-bold"
                        : "text-slate-700"
                        }`}>
                        {interventionToView.status !== "Concluído" && isOverdue(interventionToView.pendingUntil) ? (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                        )}
                        {formatBRDate(interventionToView.pendingUntil) || "Sem prazo definido"}
                        {interventionToView.status !== "Concluído" && isOverdue(interventionToView.pendingUntil) && (
                            <span className="ml-1 text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-widest font-bold">Em Atraso</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Tracking Steps e Gestão da Tratativa */}
            <div className="bg-white border rounded-xl p-5 shadow-sm border-slate-200 flex-shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-5">Acompanhamento e Registros (Timeline)</span>

                <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                    {/* Step 1: Início */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <ClipboardList className="w-3 h-3" />
                        </div>
                        <div className="bg-slate-50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                            <div className="flex justify-between items-start mb-1.5">
                                <strong className="text-slate-700">Ação Prescrita</strong>
                                <span className="text-[10px] text-slate-400">{formatBRDate(interventionToView.date)}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[13px]">Registrado no sistema por {interventionToView.responsavel}.</p>
                        </div>
                    </div>

                    {/* Step 2 Preditivo Dinâmico */}
                    {interventionToView.actionCategory === "Acionar Família" && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-amber-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CircleDashed className="w-3 h-3 animate-pulse" />
                            </div>
                            <div className="bg-amber-50/50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-amber-100 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <strong className="text-amber-800">Automação Externa (Sistêmica)</strong>
                                </div>
                                <p className="text-amber-700 leading-relaxed text-[13px]">Disparo pendente no Hub do WhatsApp para familiares via n8n.</p>
                            </div>
                        </div>
                    )}
                    {interventionToView.actionCategory === "Acionar Psicologia" && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-amber-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CircleDashed className="w-3 h-3 animate-pulse" />
                            </div>
                            <div className="bg-amber-50/50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-amber-100 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <strong className="text-amber-800">Psicóloga (Comportamental)</strong>
                                </div>
                                <p className="text-amber-700 leading-relaxed text-[13px]">Fila de Triagem em espera (Atendimentos: 1x semana). Aguardando agenda.</p>
                            </div>
                        </div>
                    )}
                    {interventionToView.actionCategory === "Acionar Psicopedagogia" && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-amber-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CircleDashed className="w-3 h-3 animate-pulse" />
                            </div>
                            <div className="bg-amber-50/50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-amber-100 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <strong className="text-amber-800">Psicopedagoga (Educacional)</strong>
                                </div>
                                <p className="text-amber-700 leading-relaxed text-[13px]">Encaminhado para avaliação cognitiva (Atendimentos: 3x semana). Aguardando agenda.</p>
                            </div>
                        </div>
                    )}
                    {interventionToView.actionCategory === "Ações Internas" && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-amber-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CircleDashed className="w-3 h-3 animate-pulse" />
                            </div>
                            <div className="bg-amber-50/50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-amber-100 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <strong className="text-amber-800">Execução do Corpo Docente</strong>
                                </div>
                                <p className="text-amber-700 leading-relaxed text-[13px]">Painel do professor notificado. Aguardando acompanhamento letivo.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3 Histórico Dinâmico (Updates manuais) */}
                    {interventionToView.updates && interventionToView.updates.map(update => (
                        <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <div className="bg-white w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <strong className="text-slate-700">{update.author}</strong>
                                    <span className="text-[10px] text-slate-400">{formatBRDate(update.date)} <span className="text-slate-300">|</span> {update.time}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-[13px]">{update.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Step Input (Inserir acompanhamento manual se estiver em progresso) */}
                    {interventionToView.status === "Em_Acompanhamento" && (
                        <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active pt-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mt-1">
                                <Plus className="w-3 h-3" />
                            </div>
                            <div className="bg-slate-50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-dashed border-slate-300 shadow-sm text-sm">
                                <p className="font-semibold text-slate-700 mb-2 text-xs flex items-center gap-1.5">
                                    Adicionar Andamento/Nota
                                </p>
                                <Textarea
                                    className="text-sm bg-white resize-none h-[72px] mb-3 text-slate-700 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                                    placeholder={isFinalResolution ? "Escreva a ata/resumo da resolução..." : "Ex: Tentei contato telefônico às 14h, mas caiu em caixa postal..."}
                                    value={newUpdate}
                                    onChange={e => setNewUpdate(e.target.value)}
                                />
                                <div className="flex flex-col gap-3 mt-2 pt-1">
                                    <div className="flex w-full">
                                        <Button size="sm" onClick={handleAdd} disabled={!newUpdate.trim()} className={`h-8 w-full text-xs font-medium px-4 text-white shadow-sm transition-all ${isFinalResolution ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                                            {isFinalResolution ? "Concluir e Salvar Ata" : "Salvar na Timeline"}
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2 px-1 border-t border-slate-200/60 pt-2.5">
                                        <Checkbox
                                            id="final-resolution"
                                            checked={isFinalResolution}
                                            onCheckedChange={(checked) => setIsFinalResolution(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="final-resolution"
                                            className="text-xs font-medium leading-none text-slate-600 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Esta nota finaliza a tratativa (Concluir caso)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step Final (Ata de Resolução - Only if Concluído) */}
                    {interventionToView.status === "Concluído" && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-slate-800 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <div className="bg-slate-50 w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <strong className="text-slate-800">Ciclo Concluído</strong>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-[13px]">A tratativa foi finalizada e anexada com ata de encerramento local.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {interventionToView.status === "Concluído" && interventionToView.resolutionAta && (
                <div className="border-t pt-4 space-y-2 flex-shrink-0">
                    <p className="font-medium text-sm text-muted-foreground">Ata de Resolução Final</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 whitespace-pre-wrap">
                        {interventionToView.resolutionAta}
                    </p>
                </div>
            )}
        </div>
    );
}
