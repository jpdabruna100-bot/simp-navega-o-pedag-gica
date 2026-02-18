import { useApp } from "@/context/AppContext";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { turmas, PsychAssessment, PSYCH_CLASSIFICATIONS } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

export default function PsychStudentDetail() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const student = students.find((s) => s.id === studentId);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    tipo: "",
    classificacao: "",
    necessitaAcompanhamento: "",
    observacao: "",
  });

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastPsych = student.psychAssessments[student.psychAssessments.length - 1];

  const handleSave = () => {
    if (!form.tipo || !form.classificacao || !form.necessitaAcompanhamento) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const newPsych: PsychAssessment = {
      id: `pa${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      tipo: form.tipo as any,
      classificacao: form.classificacao,
      necessitaAcompanhamento: form.necessitaAcompanhamento === "Sim",
      observacao: form.observacao,
    };

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              psychAssessments: [...s.psychAssessments, newPsych],
              timeline: [
                ...s.timeline,
                { id: `tl${Date.now()}`, date: newPsych.date, type: "psych" as const, description: `Avaliação psicopedagógica (${form.tipo}) realizada` },
              ],
            }
          : s
      )
    );

    toast({ title: "Avaliação psicopedagógica salva!" });
    setShowForm(false);
    setForm({ tipo: "", classificacao: "", necessitaAcompanhamento: "", observacao: "" });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">{turma?.name} • Mat: {student.matricula}</p>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>

        {lastPsych && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última Avaliação Psicopedagógica</CardTitle>
              <p className="text-xs text-muted-foreground">{lastPsych.date}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Tipo:</span> <strong>{lastPsych.tipo}</strong></div>
              <div><span className="text-muted-foreground">Classificação:</span> <strong>{lastPsych.classificacao}</strong></div>
              <div><span className="text-muted-foreground">Acompanhamento:</span> <strong>{lastPsych.necessitaAcompanhamento ? "Sim" : "Não"}</strong></div>
              {lastPsych.observacao && <div><span className="text-muted-foreground">Observação:</span> <p className="mt-1">{lastPsych.observacao}</p></div>}
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
              {student.timeline
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((event) => (
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

        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full">Nova Avaliação Psicopedagógica</Button>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">Nova Avaliação Psicopedagógica</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {["Inicial", "Reavaliação", "Acompanhamento"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Classificação *</Label>
                <Select value={form.classificacao} onValueChange={(v) => setForm((f) => ({ ...f, classificacao: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {PSYCH_CLASSIFICATIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Necessita Acompanhamento *</Label>
                <Select value={form.necessitaAcompanhamento} onValueChange={(v) => setForm((f) => ({ ...f, necessitaAcompanhamento: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {["Sim", "Não"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Observação Técnica</Label>
                <Textarea value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">Salvar</Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
