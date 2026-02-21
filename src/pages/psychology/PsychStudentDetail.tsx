import { useApp } from "@/context/AppContext";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { turmas, PsychAssessment, PSYCH_CLASSIFICATIONS, PEI_OPTIONS, getFamilyContactStatusLabel, FamilyContact, StudentDocument } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Clock, BookOpen, Brain, Phone, FileText, Upload, Eye } from "lucide-react";

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
    possuiPEI: "",
  });

  if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

  const turma = turmas.find((t) => t.id === student.turmaId);
  const lastAssessment = student.assessments[student.assessments.length - 1];

  const handleSave = () => {
    if (!form.tipo || !form.classificacao || !form.necessitaAcompanhamento || !form.possuiPEI) {
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
      possuiPEI: form.possuiPEI as any,
      responsavel: "Dra. Fernanda Costa",
    };

    const isInitial = form.tipo === "Inicial";

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const newTimeline = [
          ...s.timeline,
          { id: `tl${Date.now()}`, date: newPsych.date, type: "psych" as const, description: `Avaliação psicopedagógica (${form.tipo}) realizada` },
        ];

        // Auto-create family contact task on Initial assessment
        let familyContact = s.familyContact;
        if (isInitial && !familyContact) {
          familyContact = {
            id: `fc${Date.now()}`,
            studentId: s.id,
            tentativa1: { done: false, date: null },
            tentativa2: { done: false, date: null },
            tentativa3: { done: false, date: null },
            houveRetorno: null,
            observacao: "",
          };
          newTimeline.push({
            id: `tl${Date.now() + 1}`,
            date: newPsych.date,
            type: "family_contact" as const,
            description: "Tarefa de contato com a família criada automaticamente",
          });
        }

        return {
          ...s,
          psychAssessments: [...s.psychAssessments, newPsych],
          timeline: newTimeline,
          familyContact,
        };
      })
    );

    toast({ title: "Avaliação psicopedagógica salva!" });
    setShowForm(false);
    setForm({ tipo: "", classificacao: "", necessitaAcompanhamento: "", observacao: "", possuiPEI: "" });
  };

  const updateFamilyContact = (updates: Partial<FamilyContact>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId || !s.familyContact) return s;
        return { ...s, familyContact: { ...s.familyContact, ...updates } };
      })
    );
  };

  const handleAttemptToggle = (attempt: "tentativa1" | "tentativa2" | "tentativa3", checked: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    updateFamilyContact({
      [attempt]: { done: checked, date: checked ? today : null },
    });
    if (checked) {
      const num = attempt === "tentativa1" ? "1ª" : attempt === "tentativa2" ? "2ª" : "3ª";
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          return {
            ...s,
            timeline: [...s.timeline, {
              id: `tl${Date.now()}`,
              date: today,
              type: "family_contact" as const,
              description: `${num} tentativa de contato com a família`,
            }],
          };
        })
      );
    }
  };

  const handleDocUpload = () => {
    const newDoc: StudentDocument = {
      id: `doc${Date.now()}`,
      name: `Documento_${Date.now()}.pdf`,
      type: "pdf",
      date: new Date().toISOString().split("T")[0],
      responsavel: "Dra. Fernanda Costa",
      url: "#",
    };
    setStudents((prev) =>
      prev.map((s) => s.id === studentId ? { ...s, documents: [...s.documents, newDoc] } : s)
    );
    toast({ title: "Documento adicionado (simulação)!" });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">{turma?.name} • Mat: {student.matricula}</p>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>

        {/* Family Contact Summary */}
        {student.familyContact && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contato com a Família
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className="text-xs">
                {getFamilyContactStatusLabel(student.familyContact)}
              </Badge>
              <div className="space-y-2">
                {(["tentativa1", "tentativa2", "tentativa3"] as const).map((key, i) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      checked={student.familyContact![key].done}
                      onCheckedChange={(c) => handleAttemptToggle(key, !!c)}
                      disabled={i > 0 && !student.familyContact![`tentativa${i}` as "tentativa1" | "tentativa2" | "tentativa3"].done}
                    />
                    <span className="text-sm">Tentativa {i + 1}</span>
                    {student.familyContact![key].date && (
                      <span className="text-xs text-muted-foreground">{student.familyContact![key].date}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Houve retorno?</Label>
                <Select
                  value={student.familyContact.houveRetorno === true ? "Sim" : student.familyContact.houveRetorno === false ? "Não" : ""}
                  onValueChange={(v) => updateFamilyContact({ houveRetorno: v === "Sim" ? true : v === "Não" ? false : null })}
                >
                  <SelectTrigger className="w-40"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Observação do contato</Label>
                <Textarea
                  value={student.familyContact.observacao}
                  onChange={(e) => updateFamilyContact({ observacao: e.target.value })}
                  rows={2}
                  placeholder="Registre observações sobre o contato..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="pedagogica" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pedagogica" className="text-xs sm:text-sm gap-1">
              <BookOpen className="h-3.5 w-3.5 hidden sm:inline" /> Av. Pedagógica
            </TabsTrigger>
            <TabsTrigger value="psicologica" className="text-xs sm:text-sm gap-1">
              <Brain className="h-3.5 w-3.5 hidden sm:inline" /> Av. Psicopedagógicas
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm gap-1">
              <Clock className="h-3.5 w-3.5 hidden sm:inline" /> Linha do Tempo
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Pedagogical Assessment */}
          <TabsContent value="pedagogica">
            {lastAssessment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Avaliação Pedagógica</CardTitle>
                  <p className="text-xs text-muted-foreground">{lastAssessment.date}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">Conceito Geral:</span> <strong>{lastAssessment.conceitoGeral}</strong></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Leitura:</span> <strong>{lastAssessment.leitura}</strong></div>
                    <div><span className="text-muted-foreground">Escrita:</span> <strong>{lastAssessment.escrita}</strong></div>
                    <div><span className="text-muted-foreground">Matemática:</span> <strong>{lastAssessment.matematica}</strong></div>
                    <div><span className="text-muted-foreground">Atenção:</span> <strong>{lastAssessment.atencao}</strong></div>
                    <div><span className="text-muted-foreground">Comportamento:</span> <strong>{lastAssessment.comportamento}</strong></div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dificuldade percebida:</span>{" "}
                    <Badge variant={lastAssessment.dificuldadePercebida ? "destructive" : "secondary"} className="text-xs">
                      {lastAssessment.dificuldadePercebida ? "Sim" : "Não"}
                    </Badge>
                  </div>
                  {lastAssessment.observacaoProfessor && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Observação do Professor</p>
                      <p className="text-sm">{lastAssessment.observacaoProfessor}</p>
                    </div>
                  )}
                  {lastAssessment.principalDificuldade && (
                    <div><span className="text-muted-foreground">Principal dificuldade:</span> {lastAssessment.principalDificuldade}</div>
                  )}
                  {lastAssessment.recorrenteOuRecente && (
                    <div><span className="text-muted-foreground">Recorrência:</span> {lastAssessment.recorrenteOuRecente}</div>
                  )}
                  {lastAssessment.estrategiaEmSala && (
                    <div><span className="text-muted-foreground">Estratégia em sala:</span> {lastAssessment.estrategiaEmSala}</div>
                  )}
                  {/* Alert reason */}
                  {(student.riskLevel !== "low" || lastAssessment.dificuldadePercebida) && (
                    <div className="bg-destructive/10 p-3 rounded-lg">
                      <p className="text-xs font-medium text-destructive mb-1">Motivo do Alerta</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.riskLevel === "high" && <Badge variant="destructive" className="text-xs">Alto risco</Badge>}
                        {student.riskLevel === "medium" && <Badge variant="default" className="text-xs">Médio risco</Badge>}
                        {lastAssessment.dificuldadePercebida && <Badge variant="outline" className="text-xs">Dificuldade percebida</Badge>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="py-6 text-center text-muted-foreground">Nenhuma avaliação pedagógica registrada.</CardContent></Card>
            )}
          </TabsContent>

          {/* TAB 2: Psych Assessments */}
          <TabsContent value="psicologica">
            <div className="space-y-4">
              {student.psychAssessments.length > 0 ? (
                student.psychAssessments
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((pa) => (
                    <Card key={pa.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{pa.tipo}</CardTitle>
                          <span className="text-xs text-muted-foreground">{pa.date}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Classificação:</span> <strong>{pa.classificacao}</strong></div>
                        <div><span className="text-muted-foreground">Acompanhamento:</span>{" "}
                          <Badge variant={pa.necessitaAcompanhamento ? "default" : "secondary"} className="text-xs">
                            {pa.necessitaAcompanhamento ? "Sim" : "Não"}
                          </Badge>
                        </div>
                        <div><span className="text-muted-foreground">PEI:</span> <strong>{pa.possuiPEI || "N/A"}</strong></div>
                        {pa.responsavel && <div><span className="text-muted-foreground">Responsável:</span> {pa.responsavel}</div>}
                        {pa.observacao && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Observação Técnica</p>
                            <p className="text-sm">{pa.observacao}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card><CardContent className="py-6 text-center text-muted-foreground">Nenhuma avaliação psicopedagógica registrada.</CardContent></Card>
              )}

              {/* New Assessment Form */}
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
                      <Label>Possui PEI? *</Label>
                      <Select value={form.possuiPEI} onValueChange={(v) => setForm((f) => ({ ...f, possuiPEI: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {PEI_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
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
          </TabsContent>

          {/* TAB 3: Timeline */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Linha do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.timeline
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((event) => {
                      const iconColor = {
                        assessment: "bg-blue-500",
                        psych: "bg-purple-500",
                        intervention: "bg-amber-500",
                        referral: "bg-red-500",
                        family_contact: "bg-green-500",
                      }[event.type] || "bg-primary";

                      return (
                        <div key={event.id} className="flex gap-3 items-start">
                          <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${iconColor} flex-shrink-0`} />
                          <div>
                            <p className="text-sm">{event.description}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documentos do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.documents.length > 0 ? (
              student.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date} • {doc.responsavel}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-2">Nenhum documento registrado.</p>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={handleDocUpload}>
              <Upload className="h-4 w-4" /> Upload de Documento (Simulado)
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
