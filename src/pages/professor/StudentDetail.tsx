import { useApp } from "@/context/AppContext";
import { formatBRDate } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import { turmas, getRiskEmoji } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertTriangle, Send, ShieldAlert, CheckCircle2, MessageSquareHeart, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function StudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const navigate = useNavigate();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<string[]>([]);

  // Mock State para Ocorrência Ativa
  const [activeAlertState, setActiveAlertState] = useState<"novo" | "em_tratativa" | null>(null);

  // Mock State para Follow-up (Pós-Crise)
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  // PEI: elaborar/registrar quando recomendado pela equipe
  const [showPeiModal, setShowPeiModal] = useState(false);
  const [peiForm, setPeiForm] = useState<{ objetivos: string; estrategias: string; responsavel: string; dataRevisaoDate?: Date }>({ objetivos: "", estrategias: "", responsavel: "" });

  const student = students.find((s) => s.id === studentId);
  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

  const handleSendAlert = () => {
    if (alertType.length === 0) {
      toast({ title: "Selecione pelo menos uma categoria de ocorrência.", variant: "destructive" });
      return;
    }

    if (alertText.trim() === "") {
      toast({ title: "A descrição detalhada da ocorrência é obrigatória.", variant: "destructive" });
      return;
    }
    toast({
      title: "🚨 Alerta Crítico Enviado!",
      description: "A coordenação foi notificada imediatamente e o caso já consta na central deles.",
      variant: "destructive"
    });
    setIsAlertOpen(false);
    setAlertText("");
    setAlertType([]);
    setActiveAlertState("novo");

    // Simula a Coordenação Assumindo o Caso depois de 3 segundos
    setTimeout(() => {
      setActiveAlertState("em_tratativa");
      toast({ title: "Atualização de Status", description: "A coordenação assumiu a tratativa deste alerta.", className: "bg-blue-600 text-white border-blue-700" });
    }, 4500);
  };

  const toggleAlertType = (type: string) => {
    if (alertType.includes(type)) {
      setAlertType(alertType.filter(t => t !== type));
    } else {
      setAlertType([...alertType, type]);
    }
  };

  const peiRecomendadoPendente = !student.pei && !!student.peiRecomendado;

  const handleSavePei = () => {
    if (!peiForm.objetivos?.trim()) {
      toast({ title: "Preencha os objetivos do PEI", variant: "destructive" });
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const peiData = {
      objetivos: peiForm.objetivos.trim(),
      estrategias: peiForm.estrategias.trim() || "—",
      responsavel: peiForm.responsavel.trim() || "Professor regente",
      dataRevisao: peiForm.dataRevisaoDate ? format(peiForm.dataRevisaoDate, "yyyy-MM-dd") : today,
      dataRegistro: today,
    };
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          pei: peiData,
          peiRecomendado: undefined,
          timeline: [
            ...s.timeline,
            { id: `tl_pei_${Date.now()}`, date: today, type: "pei_atualizado", description: `PEI registrado em ${today}` },
          ],
        };
      })
    );
    toast({ title: "PEI registrado com sucesso!", className: "bg-emerald-600 text-white" });
    setShowPeiModal(false);
    setPeiForm({ objetivos: "", estrategias: "", responsavel: "" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">
              {turma?.name} • Mat: {student.matricula}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={student.riskLevel} />
            <Button onClick={() => navigate(`/professor/aluno/${student.id}/avaliacao`)}>
              <FileText className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        {lastAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última Avaliação Pedagógica</CardTitle>
              <p className="text-xs text-muted-foreground">{formatBRDate(lastAssessment.date)}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Conceito:</span> <strong>{lastAssessment.conceitoGeral}</strong></div>
                <div><span className="text-muted-foreground">Leitura:</span> <strong>{lastAssessment.leitura}</strong></div>
                <div><span className="text-muted-foreground">Escrita:</span> <strong>{lastAssessment.escrita}</strong></div>
                <div><span className="text-muted-foreground">Matemática:</span> <strong>{lastAssessment.matematica}</strong></div>
                <div><span className="text-muted-foreground">Atenção:</span> <strong>{lastAssessment.atencao}</strong></div>
                <div><span className="text-muted-foreground">Comportamento:</span> <strong>{lastAssessment.comportamento}</strong></div>
              </div>
              {lastAssessment.dificuldadePercebida && (
                <p className="mt-2 text-sm text-risk-high font-medium">⚠ Dificuldade percebida</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* PEI recomendado — aguardando elaboração pelo professor */}
        {peiRecomendadoPendente && student.peiRecomendado && (
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                <ClipboardList className="h-5 w-5 text-amber-600" />
                PEI recomendado pela equipe multidisciplinar
              </CardTitle>
              <CardDescription className="text-amber-800/80">
                Recomendado em {formatBRDate(student.peiRecomendado.dataRecomendacao)}. Prazo: {formatBRDate(student.peiRecomendado.prazo)}. Áreas de atenção: {student.peiRecomendado.areasAtencao?.join(", ") || "—"}.
                {student.peiRecomendado.sugestoes && ` Sugestões: ${student.peiRecomendado.sugestoes}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowPeiModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Elaborar e registrar PEI
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal: elaborar/registrar PEI */}
        <Dialog open={showPeiModal} onOpenChange={setShowPeiModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar PEI</DialogTitle>
              <DialogDescription>
                Preencha o Plano Educacional Individualizado com base nas orientações da equipe multidisciplinar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {student.peiRecomendado && (
                <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="font-medium">Orientações da equipe:</p>
                  <p>Áreas: {student.peiRecomendado.areasAtencao?.join(", ")}.</p>
                  {student.peiRecomendado.sugestoes && <p>Sugestões: {student.peiRecomendado.sugestoes}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label>Objetivos de aprendizagem *</Label>
                <Input
                  value={peiForm.objetivos}
                  onChange={(e) => setPeiForm((f) => ({ ...f, objetivos: e.target.value }))}
                  placeholder="Ex.: Fortalecer atenção em leitura; organizar rotina de tarefas"
                />
              </div>
              <div className="space-y-2">
                <Label>Estratégias de mediação</Label>
                <Textarea
                  value={peiForm.estrategias}
                  onChange={(e) => setPeiForm((f) => ({ ...f, estrategias: e.target.value }))}
                  placeholder="Ex.: Leitura compartilhada; pausas entre tarefas"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input
                    value={peiForm.responsavel}
                    onChange={(e) => setPeiForm((f) => ({ ...f, responsavel: e.target.value }))}
                    placeholder="Ex.: Prof. regente + AEE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de revisão</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !peiForm.dataRevisaoDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {peiForm.dataRevisaoDate ? format(peiForm.dataRevisaoDate, "dd/MM/yyyy") : <span>Selecione uma data...</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={peiForm.dataRevisaoDate}
                        onSelect={(d) => setPeiForm((f) => ({ ...f, dataRevisaoDate: d }))}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPeiModal(false)}>Cancelar</Button>
              <Button onClick={handleSavePei} className="bg-amber-600 hover:bg-amber-700">Registrar PEI</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Follow-up / Acompanhamento Pós-Crise (Exclusivo para simulação de caso estabilizado) */}
        {studentId === "s1" && (
          <Card className={`border transition-all duration-500 shadow-sm ${followUpSubmitted ? 'border-emerald-200 bg-emerald-50/50' : 'border-blue-200 bg-blue-50/30'}`}>
            <CardHeader className="pb-3 border-b border-blue-100/50">
              <CardTitle className={`text-base flex items-center gap-2 ${followUpSubmitted ? 'text-emerald-800' : 'text-blue-800'}`}>
                {followUpSubmitted ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <MessageSquareHeart className="h-5 w-5 text-blue-600" />}
                Follow-up: Acompanhamento Pós-Crise
              </CardTitle>
              <CardDescription className={followUpSubmitted ? 'text-emerald-700/70' : 'text-blue-700/70'}>
                {followUpSubmitted
                  ? "Obrigado! Seu feedback foi anexado ao prontuário da aluna."
                  : "A Psicologia realizou a contenção desta aluna recentemente. Como está o comportamento dela em sala hoje?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {!followUpSubmitted ? (
                <div className="space-y-3">
                  <Textarea
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Ex: A aluna está mais calma hoje, interagiu um pouco com os colegas..."
                    className="min-h-[80px] bg-white border-blue-200"
                  />
                  <div className="flex justify-end">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      onClick={() => {
                        if (followUpNote.trim() === "") {
                          toast({ title: "Campo vazio", description: "Por favor, escreva como a aluna está interagindo em sala.", variant: "destructive" });
                          return;
                        }

                        // Registra o feedback na linha do tempo global para os outros papéis (Psicologia e Coordenação)
                        setStudents(prev => prev.map(s => {
                          if (s.id !== studentId) return s;
                          return {
                            ...s,
                            timeline: [
                              ...s.timeline,
                              {
                                id: `tl_fu_${Date.now()}`,
                                date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                                type: "intervention",
                                description: `Feedback Pós-Crise (Professora): "${followUpNote}"`
                              }
                            ]
                          };
                        }));

                        setFollowUpSubmitted(true);
                        toast({ title: "Feedback Enviado", description: "A Psicologia e a Coordenação receberam sua atualização.", className: "bg-emerald-600 text-white" });
                      }}
                    >
                      <Send className="w-4 h-4" />
                      Enviar Atualização
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-md border border-emerald-100 shadow-sm text-sm text-slate-700 italic">
                  "{followUpNote}"
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seção Redesenhada: Gerenciamento da Ocorrência Crítica */}
        {activeAlertState === null ? (
          <Card className="border-red-200 bg-red-50/10 shadow-sm transition-all">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-red-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sinalização de Ocorrência Crítica
                </h3>
                <p className="text-sm text-red-700/80">
                  Notou mudanças bruscas de comportamento? (Ex: apatia severa, agressividade, hematomas ou isolamento súbito).
                </p>
              </div>

              <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="shrink-0 font-semibold bg-red-600 hover:bg-red-700 shadow-sm border border-red-800">
                    ⚠️ Registrar Ocorrência Urgente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Registrar Ocorrência Crítica
                    </DialogTitle>
                    <DialogDescription>
                      Este alerta irá interromper o fluxo da coordenação para atendimento imediato. Relate apenas fatos graves.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">O que você observou de grave hoje?</Label>
                      <div className="flex flex-col gap-2 mt-2">
                        {[
                          "Sinais físicos (lesões corporais, falta de higiene grave, choro persistente)",
                          "Mudança brusca de humor (explosões de raiva, apatia extrema)",
                          "Isolamento severo social ou suspeita de Bullying/Assédio",
                          "Relato verbal preocupante (violência doméstica, automutilação)",
                          "Faltas consecutivas não justificadas (risco de evasão)",
                          "Outros (descrever detalhadamente abaixo)"
                        ].map(type => (
                          <label key={type} className="flex items-start gap-2 p-2 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                            <input
                              type="checkbox"
                              className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4 flex-shrink-0"
                              checked={alertType.includes(type)}
                              onChange={() => toggleAlertType(type)}
                            />
                            <span className="text-sm text-slate-700 leading-snug">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-semibold">Detalhe o ocorrido brevemente:</Label>
                      <Textarea
                        value={alertText}
                        onChange={(e) => setAlertText(e.target.value)}
                        placeholder="Ex: A aluna chegou chorando muito, recusou-se a falar com os colegas..."
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={() => setIsAlertOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleSendAlert} className="bg-red-600 gap-2">
                      <Send className="w-4 h-4" />
                      Enviar Alerta Vermelho
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <Card className={`border shadow-sm transition-all duration-500 ${activeAlertState === "novo" ? "border-red-300 bg-red-50/50" : "border-blue-300 bg-blue-50/50"}`}>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`h-5 w-5 ${activeAlertState === "novo" ? "text-red-600 animate-pulse" : "text-blue-600"}`} />
                  <h3 className={`font-bold ${activeAlertState === "novo" ? "text-red-800" : "text-blue-800"}`}>
                    Alerta de Proteção Acionado
                  </h3>
                </div>
                <p className={`text-sm ${activeAlertState === "novo" ? "text-red-900/80" : "text-blue-900/80"}`}>
                  Você registrou informações confidenciais de proteção para este aluno no dia de hoje.
                </p>
              </div>

              <div className="shrink-0 bg-white px-4 py-2.5 rounded-md shadow-sm border border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-0.5">Status na Coordenação:</span>
                <div className="flex items-center gap-2">
                  {activeAlertState === "novo" ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className="text-sm font-semibold text-red-700">Na Fila de Emergência</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      <span className="text-sm font-semibold text-blue-700">Em Tratativa (Coordenação)</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.timeline.map((event) => (
                <div key={event.id} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{formatBRDate(event.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
