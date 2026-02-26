import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, User, Calendar, MessageSquare, PhoneCall, Brain, Scale, CheckCircle2, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CriticalOccurrenceDetail() {
    const navigate = useNavigate();
    const { id } = useParams(); // No cenário real usaríamos para buscar do DB
    const [resolutionText, setResolutionText] = useState("");
    const [isResolved, setIsResolved] = useState(false);

    // Estado do Mock para Gerenciamento da Crise
    const [activeTasks, setActiveTasks] = useState<string[]>([]);
    const [logs, setLogs] = useState([
        { id: 1, time: "14:02", author: "Prof. Larissa", text: "Registrou Ocorrência Crítica no sistema." },
        { id: 2, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), author: "Coordenação", text: "Assumiu a tratativa do caso." }
    ]);

    // Modais e Estados Transitórios
    const [isPsychModalOpen, setIsPsychModalOpen] = useState(false);
    const [psychNote, setPsychNote] = useState("");

    // Mock Data (Vindo direto do alerta interceptado no Dashboard)
    const occurrence = {
        id: id || "OC-1",
        status: isResolved ? "Resolvido" : "Em Tratativa",
        student: "Laura Barbosa",
        turma: "1º Ano A",
        teacher: "Profa. Larissa",
        date: new Date().toLocaleDateString('pt-BR'),
        categories: ["Mudança brusca de humor", "Isolamento severo social"],
        description: "A aluna chegou chorando muito e recusou-se a falar com os colegas. Notamos que ela estava evitando o contato e com sinais de medo excessivo durante o recreio livre."
    };

    const handleAction = (actionName: string, taskDependency?: string) => {
        const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let newLogText = "";
        if (actionName === "whatsapp") {
            newLogText = "Disparou convocação automática via WhatsApp para a família. (n8n)";
            if (taskDependency) setActiveTasks(prev => [...prev, taskDependency]);
            toast({ title: "WhatsApp Enviado!", description: "Aguardando resposta do responsável." });
        } else if (actionName === "tutelar") {
            newLogText = "Registrou notificação ao Conselho Tutelar/Assistência.";
            toast({ title: "Proteção Acionada", description: "Notificação jurídica gerada.", variant: "destructive" });
        }

        setLogs(prev => [...prev, { id: Date.now(), time: timeNow, author: "Coordenação", text: newLogText }]);
    };

    const handlePsychAction = () => {
        const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLogs(prev => [...prev, {
            id: Date.now(),
            time: timeNow,
            author: "Coordenação",
            text: `Acionou a Psicologia. Nota: "${psychNote}"`
        }]);
        setActiveTasks(prev => [...prev, "Aguardando Parecer da Psicóloga"]);
        setIsPsychModalOpen(false);
        setPsychNote("");
        toast({ title: "Psicologia Acionada", description: "O caso foi enviado para a fila hospitalar/crise." });
    };

    const handleResolve = () => {
        if (activeTasks.length > 0) {
            toast({ title: "Ação Bloqueada", variant: "destructive", description: "Encerre as pendências ativas (Linha do Tempo) antes de gerar a ata de resolução." });
            return;
        }

        if (resolutionText.trim() === "") {
            toast({ title: "Ata Incompleta", variant: "destructive", description: "O parecer final do caso é obrigatório para arquivamento." });
            return;
        }
        setIsResolved(true);
        toast({ title: "Caso Encerrado", description: "Ata consolidada e anexada ao histórico permanente do aluno.", className: "bg-emerald-600 text-white" });
    };

    return (
        <Layout>
            <div className="space-y-6 max-w-5xl mx-auto pb-10">

                {/* Header do Dossiê */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 px-2 -ml-2 text-muted-foreground">
                                &larr; Voltar
                            </Button>
                        </div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                            <ShieldAlert className="h-6 w-6 text-red-600" />
                            Dossiê de Ocorrência Crítica
                            <span className="text-sm font-normal text-muted-foreground ml-2">#{occurrence.id}</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 border border-red-200 text-red-800 animate-pulse'}`}>
                            {isResolved ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-red-600" />}
                            STATUS: {occurrence.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LADO ESQUERDO: O FATO */}
                    <div className="space-y-6">
                        <Card className="border-red-100 shadow-sm bg-red-50/30">
                            <CardHeader className="pb-4 border-b border-red-100 bg-white">
                                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                    <FileText className="h-5 w-5 text-red-500" />
                                    Relato do Professor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-5">

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                        <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1 mb-1"><User className="w-3 h-3" /> Aluno Envolvido</span>
                                        <span className="font-bold text-slate-800 block leading-tight">{occurrence.student}</span>
                                        <span className="text-xs text-slate-500">{occurrence.turma}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                        <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Data e Relator</span>
                                        <span className="font-bold text-slate-800 block leading-tight">{occurrence.teacher}</span>
                                        <span className="text-xs text-slate-500">{occurrence.date}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Fatores ou Sintomas Sinalizados:</h4>
                                    <div className="flex flex-col gap-2">
                                        {occurrence.categories.map((cat, i) => (
                                            <div key={i} className="bg-red-100/50 text-red-900 px-3 py-2 rounded-md text-sm font-medium border border-red-200/50 flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span> {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Descrição Detalhada (Ata do Professor):</h4>
                                    <div className="bg-white p-4 rounded-md border border-red-100 shadow-inner text-sm text-slate-700 italic leading-relaxed">
                                        "{occurrence.description}"
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>

                    {/* LADO DIREITO: O PLANO DE AÇÃO */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-4 border-b bg-slate-50">
                                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                    <ShieldAlert className="h-5 w-5 text-slate-600" />
                                    Plano de Contingência (Tratativa)
                                </CardTitle>
                                <CardDescription>
                                    Central de ações imediatas da coordenação.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">1. Ferramentas de Ação Rápida</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Button variant="outline" className="justify-start gap-2 h-auto py-3 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleAction("whatsapp", "Aguardando Confirmação do Responsável")} disabled={isResolved || activeTasks.includes("Aguardando Confirmação do Responsável")}>
                                            <PhoneCall className="w-4 h-4 text-emerald-600" />
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-semibold">Convocar Família</span>
                                                <span className="text-xs font-normal opacity-80">WhatsApp / n8n</span>
                                            </div>
                                        </Button>

                                        <Button variant="outline" className="justify-start gap-2 h-auto py-3 border-blue-200 hover:bg-blue-50 hover:text-blue-700" onClick={() => setIsPsychModalOpen(true)} disabled={isResolved || activeTasks.includes("Aguardando Parecer da Psicóloga")}>
                                            <Brain className="w-4 h-4 text-blue-600" />
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-semibold">Acionar Psicóloga</span>
                                                <span className="text-xs font-normal opacity-80">Encaminhamento Crítico</span>
                                            </div>
                                        </Button>

                                        <Button variant="outline" className="justify-start gap-2 h-auto py-3 sm:col-span-2 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction("tutelar")} disabled={isResolved}>
                                            <Scale className="w-4 h-4 text-red-600" />
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-semibold">Acionar Conselho Tutelar / Jurídico</span>
                                                <span className="text-xs font-normal opacity-80">Gera ata formal de escola protegida.</span>
                                            </div>
                                        </Button>
                                    </div>
                                </div>

                                {/* LOG BOOK / LINHA DO TEMPO DA CRISE */}
                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <Label className="text-sm font-bold text-slate-700">2. Linha do Tempo e Pendências</Label>

                                    {activeTasks.length > 0 && (
                                        <div className="mb-4 space-y-2">
                                            {activeTasks.map(task => (
                                                <div key={task} className="flex items-center justify-between bg-orange-50/50 border border-orange-200 text-orange-800 text-xs px-3 py-2 rounded-md">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                        </span>
                                                        Pendência: {task}
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-orange-700 hover:bg-orange-100" onClick={() => setActiveTasks(prev => prev.filter(t => t !== task))}>
                                                        ✓ Marcar Recebido
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 pb-2">
                                        {logs.map((log) => (
                                            <div key={log.id} className="relative pl-4">
                                                <div className="absolute w-2 h-2 bg-slate-400 rounded-full border-2 border-white -left-[5px] top-1.5" />
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xs font-bold text-slate-500">[{log.time}]</span>
                                                    <span className="text-sm font-semibold text-slate-700">{log.author}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-0.5">{log.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`space-y-3 pt-4 border-t ${activeTasks.length > 0 ? "opacity-50 pointer-events-none" : ""}`}>
                                    <Label className="text-sm font-bold text-slate-700">3. Ata de Resolução Final *</Label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {activeTasks.length > 0
                                            ? "⚠️ Baixe as pendências acima para liberar a escrita da ata de fechamento."
                                            : "Descreva a conclusão da tratativa com a família e os encaminhamentos realizados para poder encerrar este alerta."}
                                    </p>
                                    <Textarea
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                        placeholder="Ex: A mãe compareceu e informou que a criança está passando por... Foi acordado que..."
                                        className="min-h-[120px] resize-none bg-slate-50 focus-visible:bg-white"
                                        disabled={isResolved || activeTasks.length > 0}
                                    />
                                </div>

                            </CardContent>
                            {!isResolved && (
                                <div className="p-4 border-t bg-slate-50 flex justify-end">
                                    <Button onClick={handleResolve} className="bg-slate-800 hover:bg-slate-900 text-white font-bold gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Arquivar Tratativa e Encerrar Alerta
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                </div>
            </div>

            {/* Modal para Acionar Psicologia */}
            <Dialog open={isPsychModalOpen} onOpenChange={setIsPsychModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-700">
                            <Brain className="w-5 h-5" />
                            Encaminhamento Psicológico Crítico
                        </DialogTitle>
                        <DialogDescription>
                            Ao confirmar, este caso pulará para o topo da fila da página da psicóloga escolar, com selo vermelho de urgência.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <Label>Adicione uma nota de encaminhamento (Coordenador p/ Psicóloga):</Label>
                        <Textarea
                            value={psychNote}
                            onChange={(e) => setPsychNote(e.target.value)}
                            placeholder="Ex: Enviei WhatsApp para a mãe e estou aguardando. Preciso que você avalie os sintomas narrados..."
                            className="resize-none h-24"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPsychModalOpen(false)}>Cancelar</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handlePsychAction}>Confirmar Encaminhamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Layout>
    );
}
