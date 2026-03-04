import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { updateIntervention } from "@/lib/supabase-mutations";
import { ShieldAlert, Sparkles, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ContingencyPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interventionId: string | null;
  onConfirm?: () => void;
}

export function ContingencyPlanModal({
  open,
  onOpenChange,
  interventionId,
  onConfirm,
}: ContingencyPlanModalProps) {
  const { students, refetchStudents } = useApp();
  const [newActionCategory, setNewActionCategory] = useState("Ações Internas");
  const [newActionTool, setNewActionTool] = useState("");
  const [newActionDeadline, setNewActionDeadline] = useState<Date | undefined>(undefined);
  const [newActionDescription, setNewActionDescription] = useState("");

  useEffect(() => {
    if (open) {
      setNewActionCategory("Ações Internas");
      setNewActionTool("");
      setNewActionDeadline(undefined);
      setNewActionDescription("");
    }
  }, [open, interventionId]);

  const student = students.find((s) => s.interventions.some((i) => i.id === interventionId));
  const latestAssessment = student?.assessments?.[student.assessments.length - 1];

  const aiSuggestion = (() => {
    if (!latestAssessment) return null;
    let areas = [];
    if (latestAssessment.leitura === "Defasada" || latestAssessment.escrita === "Defasada") {
      areas.push({
        title: "Área Cognitiva (Leitura/Escrita)",
        suggestion: "Adaptação Curricular ou Prova com Ledor."
      });
    }
    if (latestAssessment.atencao === "Defasada" || latestAssessment.comportamento === "Defasado") {
      areas.push({
        title: "Área Comportamental",
        suggestion: "Convite Reunião Presencial ou Acionar Psicologia para observação."
      });
    }

    let sintomas = [];
    if (latestAssessment.sintomasIdentificados && latestAssessment.sintomasIdentificados.length > 0) {
      sintomas = latestAssessment.sintomasIdentificados;
    }

    if (areas.length === 0 && sintomas.length === 0) return null;

    return { areas, sintomas };
  })();

  const handleConfirm = async () => {
    if (!interventionId) return;

    // Caminho direto para Equipe Multidisciplinar — sem validações extras
    if (newActionCategory === "Equipe Multidisciplinar") {
      try {
        await updateIntervention(interventionId, {
          action_category: "Equipe Multidisciplinar",
          action_tool: "Pendente de Avaliação Clínica/Triagem",
          objetivo: newActionDescription.trim() || "Encaminhamento para análise da Equipe Multidisciplinar (triagem interna).",
          pending_until: newActionDeadline ? format(newActionDeadline, "yyyy-MM-dd") : null,
          status: "Em_Acompanhamento",
        });
        refetchStudents();
        toast({ title: "Encaminhado! Aluno em acompanhamento pela equipe." });
        onOpenChange(false);
        onConfirm?.();
      } catch (e) {
        toast({ title: "Erro ao encaminhar", description: String(e), variant: "destructive" });
      }
      return;
    }

    if (!newActionTool) {
      toast({ title: "Selecione a ferramenta de ação rápida", variant: "destructive" });
      return;
    }
    if (!newActionDescription.trim()) {
      toast({ title: "A Justificativa Estratégica é obrigatória", variant: "destructive" });
      return;
    }

    try {
      await updateIntervention(interventionId, {
        action_category: newActionCategory as "Ações Internas" | "Acionar Família" | "Acionar Psicologia" | "Acionar Psicopedagogia" | "Equipe Multidisciplinar",
        action_tool: newActionTool,
        objetivo: newActionDescription.trim(),
        pending_until: newActionDeadline ? format(newActionDeadline, "yyyy-MM-dd") : null,
        status: "Em_Acompanhamento",
      });
      refetchStudents();
      toast({ title: "Plano de ação ativado. Aluno em acompanhamento!" });
      onOpenChange(false);
      onConfirm?.();
    } catch (e) {
      toast({ title: "Erro ao salvar plano", description: String(e), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-slate-50 border-slate-200">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldAlert className="h-6 w-6 text-slate-700" />
            Plano de Contingência (Tratativa)
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 text-left">
            Defina a ação estratégica para tratar a defasagem ou alerta do aluno.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {aiSuggestion && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
                <h4 className="text-base font-bold text-indigo-900">Diagnóstico & Sugestão SIMP</h4>
              </div>

              <div className="space-y-4 pl-7">
                {aiSuggestion.sintomas.length > 0 && (
                  <div>
                    <strong className="text-sm text-indigo-900 block mb-1">📋 Sintomas relatados pelo professor:</strong>
                    <ul className="list-disc list-inside text-sm text-indigo-800 space-y-0.5">
                      {aiSuggestion.sintomas.map((sintoma, idx) => (
                        <li key={idx}>{sintoma}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestion.areas.length > 0 && (
                  <div>
                    <strong className="text-sm text-indigo-900 block mb-1">🚨 Focos de Atenção Mapeados:</strong>
                    <ul className="space-y-1.5 list-disc list-inside text-sm text-indigo-800">
                      {aiSuggestion.areas.map((area, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{area.title}:</span> O sistema sugere {area.suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">1. Ferramentas de Ação Rápida</h3>
            <Tabs value={newActionCategory} onValueChange={setNewActionCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Ações Internas">Internas</TabsTrigger>
                <TabsTrigger value="Acionar Família">Família</TabsTrigger>
                <TabsTrigger value="Equipe Multidisciplinar">Equipe Multidisciplinar</TabsTrigger>
              </TabsList>

              <div className="mt-4 border rounded-lg p-4 bg-white">
                <h4 className="text-sm font-medium mb-3">
                  {newActionCategory === "Ações Internas" && "Selecione a Ação Interna"}
                  {newActionCategory === "Acionar Família" && "Canais de Contato"}
                  {newActionCategory === "Equipe Multidisciplinar" && "Encaminhamento Automático"}
                </h4>

                {newActionCategory === "Equipe Multidisciplinar" ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600">
                    O aluno será encaminhado para a análise da Equipe Multidisciplinar. Após a triagem interna, as profissionais responsáveis farão contato e estabelecerão o plano de ação.
                  </div>
                ) : (
                  <Select value={newActionTool} onValueChange={setNewActionTool}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {newActionCategory === "Ações Internas" && (
                        <>
                          <SelectItem value="Adaptação Curricular">Adaptação Curricular</SelectItem>
                          <SelectItem value="Prova com Ledor">Prova com Ledor</SelectItem>
                          <SelectItem value="Reforço no Contraturno">Reforço no Contraturno</SelectItem>
                          <SelectItem value="Redução de Atividades">Redução de Atividades</SelectItem>
                          <SelectItem value="Encaminhamento Sala de Recursos">Encaminhamento Sala de Recursos</SelectItem>
                        </>
                      )}
                      {newActionCategory === "Acionar Família" && (
                        <>
                          <SelectItem value="Convite Reunião Presencial">Convite Reunião Presencial</SelectItem>
                          <SelectItem value="Encaminhamento Clínico Externo">Encaminhamento Clínico Externo</SelectItem>
                          <SelectItem value="Adaptação de Rotina em Casa">Adaptação de Rotina em Casa</SelectItem>
                          <SelectItem value="Reportar Indisciplina (Aviso Fixo)">Reportar Indisciplina (Aviso Fixo)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </Tabs>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">
              2. Justificativa Estratégica <span className="text-red-500">*</span>
            </h3>
            <Textarea
              placeholder="Descreva o motivo desta escolha e informe qualquer detalhe adicional necessário..."
              value={newActionDescription}
              onChange={(e) => setNewActionDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-slate-800 flex items-center justify-between">
              3. Prazo de Pendência
              {(newActionCategory === "Acionar Família" || newActionCategory === "Equipe Multidisciplinar") && (
                <Badge variant="secondary" className="text-risk-high bg-risk-high/10">
                  Recomendado
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">O card ficará alertando até que seja solucionado.</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !newActionDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newActionDeadline ? format(newActionDeadline, "dd/MM/yyyy") : <span>Selecione uma data...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newActionDeadline}
                  onSelect={setNewActionDeadline}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Iniciar Tratativa</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
