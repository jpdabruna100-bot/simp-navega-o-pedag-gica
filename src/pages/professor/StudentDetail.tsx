import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { turmas, getRiskEmoji } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertTriangle, Send, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function StudentDetail() {
  const { studentId } = useParams();
  const { students } = useApp();
  const navigate = useNavigate();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState<string[]>([]);

  // Mock State para Ocorrência Ativa
  const [activeAlertState, setActiveAlertState] = useState<"novo" | "em_tratativa" | null>(null);

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
              <p className="text-xs text-muted-foreground">{lastAssessment.date}</p>
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
                    <p className="text-xs text-muted-foreground">{event.date}</p>
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
