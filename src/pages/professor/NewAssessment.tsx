import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RiskLevel, Assessment } from "@/data/mockData";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function NewAssessment() {
  const { studentId } = useParams();
  const { students, setStudents } = useApp();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === studentId);

  const [form, setForm] = useState({
    conceitoGeral: "",
    leitura: "",
    escrita: "",
    matematica: "",
    atencao: "",
    comportamento: "",
    dificuldadePercebida: "",
  });

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const handleSave = () => {
    if (!form.conceitoGeral || !form.leitura || !form.escrita || !form.matematica || !form.atencao || !form.comportamento || !form.dificuldadePercebida) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const newAssessment: Assessment = {
      id: `a${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      conceitoGeral: form.conceitoGeral,
      leitura: form.leitura,
      escrita: form.escrita,
      matematica: form.matematica,
      atencao: form.atencao,
      comportamento: form.comportamento,
      dificuldadePercebida: form.dificuldadePercebida === "Sim",
    };

    // Determine new risk level
    let newRisk: RiskLevel = "low";
    const defCount = [form.leitura, form.escrita, form.matematica, form.atencao].filter((v) => v === "Defasada").length;
    if (form.conceitoGeral === "Insuficiente" || defCount >= 2) newRisk = "high";
    else if (form.conceitoGeral === "Regular" || defCount >= 1) newRisk = "medium";

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              riskLevel: newRisk,
              lastAssessmentDate: newAssessment.date,
              assessments: [...s.assessments, newAssessment],
              timeline: [
                ...s.timeline,
                { id: `tl${Date.now()}`, date: newAssessment.date, type: "assessment" as const, description: "Nova avaliação pedagógica realizada" },
              ],
            }
          : s
      )
    );

    toast({ title: "Avaliação salva com sucesso!" });
    navigate(-1);
  };

  const Field = ({ label, field, options }: { label: string; field: keyof typeof form; options: string[] }) => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Select value={form[field]} onValueChange={(v) => setForm((f) => ({ ...f, [field]: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nova Avaliação Pedagógica</h1>
          <p className="text-muted-foreground text-sm">{student.name}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <Field label="Conceito Geral" field="conceitoGeral" options={["Regular", "Bom", "Excelente", "Insuficiente"]} />
            <Field label="Leitura" field="leitura" options={["Adequada", "Em desenvolvimento", "Defasada"]} />
            <Field label="Escrita" field="escrita" options={["Adequada", "Em desenvolvimento", "Defasada"]} />
            <Field label="Matemática" field="matematica" options={["Adequada", "Em desenvolvimento", "Defasada"]} />
            <Field label="Atenção" field="atencao" options={["Adequada", "Em desenvolvimento", "Defasada"]} />
            <Field label="Comportamento" field="comportamento" options={["Adequado", "Em desenvolvimento", "Defasado"]} />
            <Field label="Dificuldade Percebida" field="dificuldadePercebida" options={["Sim", "Não"]} />

            <Button onClick={handleSave} className="w-full">Salvar Avaliação</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
