import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RiskLevel, Assessment } from "@/data/mockData";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    observacaoProfessor: "",
    principalDificuldade: "",
    recorrenteOuRecente: "",
    estrategiaEmSala: "",
  });

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const handleSave = () => {
    if (!form.conceitoGeral || !form.leitura || !form.escrita || !form.matematica || !form.atencao || !form.comportamento || !form.dificuldadePercebida) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (!form.observacaoProfessor.trim()) {
      toast({ title: "A observação do professor é obrigatória", variant: "destructive" });
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
      observacaoProfessor: form.observacaoProfessor,
      principalDificuldade: form.principalDificuldade || undefined,
      recorrenteOuRecente: form.recorrenteOuRecente || undefined,
      estrategiaEmSala: form.estrategiaEmSala || undefined,
    };

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

            {/* Observação obrigatória */}
            <div className="space-y-1.5">
              <Label className="text-sm">Observação do Professor *</Label>
              <Textarea
                value={form.observacaoProfessor}
                onChange={(e) => setForm((f) => ({ ...f, observacaoProfessor: e.target.value.slice(0, 500) }))}
                placeholder="Justifique o conceito dado e registre evidências observadas..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{form.observacaoProfessor.length}/500</p>
            </div>

            {/* Perguntas orientadoras opcionais */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Perguntas orientadoras (opcional)</p>
              <div className="space-y-1.5">
                <Label className="text-sm">Qual a principal dificuldade observada?</Label>
                <Textarea
                  value={form.principalDificuldade}
                  onChange={(e) => setForm((f) => ({ ...f, principalDificuldade: e.target.value }))}
                  placeholder="Ex: Dificuldade em compreensão de textos curtos..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Isso é recorrente ou recente?</Label>
                <Select value={form.recorrenteOuRecente} onValueChange={(v) => setForm((f) => ({ ...f, recorrenteOuRecente: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recorrente">Recorrente</SelectItem>
                    <SelectItem value="Recente">Recente</SelectItem>
                    <SelectItem value="Não sei informar">Não sei informar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Já foi feita alguma estratégia em sala?</Label>
                <Textarea
                  value={form.estrategiaEmSala}
                  onChange={(e) => setForm((f) => ({ ...f, estrategiaEmSala: e.target.value }))}
                  placeholder="Ex: Atendimento individualizado, atividades diferenciadas..."
                  rows={2}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">Salvar Avaliação</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
