import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function InterventionManagement() {
  const { students, setStudents } = useApp();
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get("aluno");

  const allInterventions = students.flatMap((s) =>
    s.interventions.map((i) => ({ ...i, studentName: s.name, studentId: s.id }))
  );

  const [showForm, setShowForm] = useState(!!preSelectedStudentId);
  const [form, setForm] = useState({
    studentId: preSelectedStudentId || "",
    tipo: "",
    objetivo: "",
    responsavel: "",
    status: "Planejada",
    resultado: "",
  });

  useEffect(() => {
    if (preSelectedStudentId) {
      setForm((f) => ({ ...f, studentId: preSelectedStudentId }));
      setShowForm(true);
    }
  }, [preSelectedStudentId]);

  const selectedStudent = students.find((s) => s.id === form.studentId);

  const handleSave = () => {
    if (!form.studentId || !form.tipo) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const newIntervention = {
      id: `int-${Date.now()}`,
      tipo: form.tipo,
      objetivo: form.objetivo,
      responsavel: form.responsavel,
      status: form.status as "Planejada" | "Em andamento" | "Concluída",
      resultado: form.resultado,
      date: new Date().toISOString().split("T")[0],
    };

    setStudents((prev) =>
      prev.map((s) =>
        s.id === form.studentId
          ? {
              ...s,
              interventions: [...s.interventions, newIntervention],
              timeline: [
                ...s.timeline,
                {
                  id: `tl-int-${Date.now()}`,
                  date: newIntervention.date,
                  type: "intervention" as const,
                  description: `Intervenção atribuída: ${form.tipo}`,
                },
              ],
            }
          : s
      )
    );

    toast({ title: "Intervenção registrada com sucesso" });
    setShowForm(false);
    setForm({ studentId: "", tipo: "", objetivo: "", responsavel: "", status: "Planejada", resultado: "" });
  };

  const statusColor = (s: string) => {
    if (s === "Concluída") return "bg-risk-low/10 text-risk-low border-risk-low/20";
    if (s === "Em andamento") return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestão de Intervenções</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancelar" : "Nova Intervenção"}</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Registrar Intervenção
                {selectedStudent && <span className="text-sm font-normal text-muted-foreground ml-2">— {selectedStudent.name}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Aluno *</Label>
                <Select value={form.studentId} onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o aluno..." /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.matricula})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Intervenção *</Label>
                <Input value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} placeholder="Ex: Reforço escolar" />
              </div>
              <div className="space-y-1.5">
                <Label>Objetivo</Label>
                <Input value={form.objetivo} onChange={(e) => setForm((f) => ({ ...f, objetivo: e.target.value }))} placeholder="Ex: Melhorar leitura" />
              </div>
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Input value={form.responsavel} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Planejada", "Em andamento", "Concluída"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Resultado Observado</Label>
                <Textarea value={form.resultado} onChange={(e) => setForm((f) => ({ ...f, resultado: e.target.value }))} rows={2} />
              </div>
              <Button onClick={handleSave} className="w-full">Salvar Intervenção</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {allInterventions.map((intervention) => (
            <Card key={intervention.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{intervention.tipo}</p>
                    <p className="text-sm text-muted-foreground">Aluno: {intervention.studentName}</p>
                    <p className="text-sm text-muted-foreground">Objetivo: {intervention.objetivo}</p>
                    <p className="text-xs text-muted-foreground">Responsável: {intervention.responsavel} • {intervention.date}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(intervention.status)}`}>
                    {intervention.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {allInterventions.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma intervenção registrada.</p>}
        </div>
      </div>
    </Layout>
  );
}
