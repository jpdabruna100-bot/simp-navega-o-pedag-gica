import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { INTERVENTION_TYPES } from "@/data/mockData";

export default function InterventionManagement() {
  const { students, setStudents } = useApp();
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get("aluno");

  const allInterventions = students.flatMap((s) =>
    s.interventions.map((i) => ({ ...i, studentName: s.name, studentId: s.id }))
  );

  const [showForm, setShowForm] = useState(!!preSelectedStudentId);
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntervention, setSelectedIntervention] = useState<(typeof allInterventions)[0] | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editResultado, setEditResultado] = useState("");

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

  const filtered = allInterventions
    .filter((i) => filterTipo === "all" || i.tipo === filterTipo)
    .filter((i) => filterStatus === "all" || i.status === filterStatus)
    .filter((i) => searchQuery === "" || i.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleUpdateIntervention = () => {
    if (!selectedIntervention) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedIntervention.studentId
          ? {
              ...s,
              interventions: s.interventions.map((i) =>
                i.id === selectedIntervention.id
                  ? { ...i, status: editStatus as any, resultado: editResultado }
                  : i
              ),
            }
          : s
      )
    );
    toast({ title: "Intervenção atualizada" });
    setSelectedIntervention(null);
  };

  const openDetail = (intervention: (typeof allInterventions)[0]) => {
    setSelectedIntervention(intervention);
    setEditStatus(intervention.status);
    setEditResultado(intervention.resultado);
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
                <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
                  <SelectContent>
                    {INTERVENTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar aluno..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {INTERVENTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {["Planejada", "Em andamento", "Concluída"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {filtered.map((intervention) => (
            <Card key={intervention.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => openDetail(intervention)}>
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
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma intervenção encontrada.</p>}
        </div>

        {/* Modal Detalhes */}
        <Dialog open={!!selectedIntervention} onOpenChange={(open) => !open && setSelectedIntervention(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Intervenção</DialogTitle>
            </DialogHeader>
            {selectedIntervention && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Tipo:</span> <strong>{selectedIntervention.tipo}</strong></div>
                  <div><span className="text-muted-foreground">Aluno:</span> <strong>{selectedIntervention.studentName}</strong></div>
                  <div><span className="text-muted-foreground">Objetivo:</span> <strong>{selectedIntervention.objetivo}</strong></div>
                  <div><span className="text-muted-foreground">Responsável:</span> <strong>{selectedIntervention.responsavel}</strong></div>
                  <div><span className="text-muted-foreground">Data:</span> <strong>{selectedIntervention.date}</strong></div>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Planejada", "Em andamento", "Concluída"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Resultado Observado</Label>
                  <Textarea value={editResultado} onChange={(e) => setEditResultado(e.target.value)} rows={3} />
                </div>
                <Button onClick={handleUpdateIntervention} className="w-full">Salvar Alterações</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
