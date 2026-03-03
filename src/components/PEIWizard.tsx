/**
 * Wizard de elaboração guiada de PEI (Plano Educacional Especializado)
 * Baseado no modelo Jonas — 9 etapas com pré-preenchimento inteligente
 */

import { useEffect, useState } from "react";
import {
  preencherFormAPartirDeAluno,
  formToPEIElaborado,
  peiElaboradoToLegado,
  type PEIFormState,
  type AreaCurricular,
  AREAS_CURRICULARES,
  RECURSOS_SUGERIDOS,
  ESTRATEGIAS_SUGERIDAS,
  AVALIACAO_OPCOES,
} from "@/lib/pei-utils";
import type { Student } from "@/data/mockData";
import { formatBRDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Visão geral" },
  { id: 2, title: "Capacidades" },
  { id: 3, title: "O que sabe" },
  { id: 4, title: "Necessidades" },
  { id: 5, title: "Recursos" },
  { id: 6, title: "Estratégias" },
  { id: 7, title: "Objetivos e metas" },
  { id: 8, title: "Avaliação" },
  { id: 9, title: "Revisão" },
];

interface PEIWizardProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (peiData: ReturnType<typeof peiElaboradoToLegado>) => void;
}

export function PEIWizard({ student, open, onOpenChange, onSave }: PEIWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PEIFormState | null>(null);

  useEffect(() => {
    if (open && student) {
      setForm(preencherFormAPartirDeAluno(student));
      setStep(1);
    }
  }, [open, student]);

  if (!form) return null;

  const lastAssessment = student.assessments[student.assessments.length - 1];

  const toggleArrayItem = (key: keyof PEIFormState, item: string) => {
    const arr = form[key];
    if (!Array.isArray(arr)) return;
    setForm((f) => ({
      ...f!,
      [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
    }));
  };

  const handleSave = () => {
    const hasObjectives =
      form.objetivosAcademicos &&
      Object.values(form.objetivosAcademicos).some((v) => v?.trim());
    const hasNecessities = form.necessidades.some((n) => n?.trim());
    const hasCapacities = form.capacidades.some((c) => c?.trim());

    if (!hasObjectives && !hasNecessities && !hasCapacities) {
      return; // Validação bloqueia — toast será mostrado pelo botão
    }

    const peiElab = formToPEIElaborado(form, student.name);
    const legado = peiElaboradoToLegado(peiElab);
    onSave(legado);
    onOpenChange(false);
  };

  const canSave =
    (form.objetivosAcademicos && Object.values(form.objetivosAcademicos).some((v) => v?.trim())) ||
    form.necessidades.some((n) => n?.trim()) ||
    form.capacidades.some((c) => c?.trim());

  const canGoNext = step < 9;
  const canGoPrev = step > 1;

  return (
    <div className="flex flex-col min-h-0 flex-1 px-1 gap-4">
      {/* Indicador de progresso + Stepper — fixos no topo */}
      <div className="flex-shrink-0 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Passo {step} de 9 — {STEPS.find((s) => s.id === step)?.title}
        </p>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setStep(s.id)}
              className={cn(
                "flex flex-col items-center px-2",
                step === s.id ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm",
                  step >= s.id ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                )}
              >
                {s.id}
              </div>
              <span className="text-[10px] mt-0.5 max-w-[60px] text-center truncate">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && <div className={cn("w-4 h-0.5", step > s.id ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
        </div>
      </div>

      {/* Conteúdo da etapa — área rolável */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {step === 1 && (
          <Card className="border-amber-100 bg-amber-50/30">
            <CardHeader className="p-4 sm:p-5">
              <CardTitle className="text-base">O que o sistema já sabe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-5 pt-0">
              {lastAssessment && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Última avaliação pedagógica</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span>Leitura: <strong>{lastAssessment.leitura}</strong></span>
                    <span>Escrita: <strong>{lastAssessment.escrita}</strong></span>
                    <span>Matemática: <strong>{lastAssessment.matematica}</strong></span>
                    <span>Atenção: <strong>{lastAssessment.atencao}</strong></span>
                    <span>Comportamento: <strong>{lastAssessment.comportamento}</strong></span>
                  </div>
                </div>
              )}
              {student.peiRecomendado && (
                <div className="text-sm p-4 bg-white rounded-lg border border-amber-200 space-y-1">
                  <p className="font-medium text-amber-900">Orientações da equipe</p>
                  <p>Áreas: {student.peiRecomendado.areasAtencao?.join(", ")}</p>
                  {student.peiRecomendado.sugestoes && <p className="text-muted-foreground mt-2 leading-relaxed">{student.peiRecomendado.sugestoes}</p>}
                </div>
              )}
              <p className="text-xs text-muted-foreground">As próximas etapas serão pré-preenchidas com base nestes dados. Você pode ajustar tudo.</p>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label>Capacidades (o que o aluno já faz bem)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {form.capacidades.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input
                    value={c}
                    onChange={(e) => {
                      const next = [...form.capacidades];
                      next[i] = e.target.value;
                      setForm((f) => f ? { ...f, capacidades: next } : f);
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => f ? { ...f, capacidades: form.capacidades.filter((_, j) => j !== i) } : f)}>Remover</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => f ? { ...f, capacidades: [...form.capacidades, ""] } : f)}>+ Adicionar</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">O que o aluno já sabe por área (pré-preenchido pela avaliação)</p>
            {AREAS_CURRICULARES.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Textarea
                  value={form.oQueSabe[key] || ""}
                  onChange={(e) => setForm((f) => f ? { ...f, oQueSabe: { ...f.oQueSabe, [key]: e.target.value } } : f)}
                  rows={2}
                  placeholder="Ex.: Tem aptidão em..."
                />
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Label>Necessidades / O que aprender</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {form.necessidades.map((n, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input
                    value={n}
                    onChange={(e) => {
                      const next = [...form.necessidades];
                      next[i] = e.target.value;
                      setForm((f) => f ? { ...f, necessidades: next } : f);
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => f ? { ...f, necessidades: form.necessidades.filter((_, j) => j !== i) } : f)}>Remover</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => f ? { ...f, necessidades: [...form.necessidades, ""] } : f)}>+ Adicionar</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <Label>Recursos</Label>
            <div className="grid grid-cols-2 gap-2">
              {RECURSOS_SUGERIDOS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.recursos.includes(r)} onCheckedChange={() => toggleArrayItem("recursos", r)} />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <Label className="text-xs">Outros (um por linha)</Label>
              <Textarea
                value={form.recursos.filter((x) => !RECURSOS_SUGERIDOS.includes(x)).join("\n")}
                onChange={(e) => {
                  const custom = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                  const fromList = form.recursos.filter((x) => RECURSOS_SUGERIDOS.includes(x));
                  setForm((f) => f ? { ...f, recursos: [...fromList, ...custom] } : f);
                }}
                placeholder="Digite recursos adicionais..."
                rows={2}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <Label>Estratégias</Label>
            <div className="space-y-2">
              {ESTRATEGIAS_SUGERIDAS.map((e) => (
                <label key={e} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form.estrategias.includes(e)} onCheckedChange={() => toggleArrayItem("estrategias", e)} />
                  <span className="text-sm">{e}</span>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <Label className="text-xs">Outras estratégias (texto livre)</Label>
              <Textarea
                value={form.estrategias.filter((x) => !ESTRATEGIAS_SUGERIDAS.includes(x)).join(". ")}
                onChange={(ev) => {
                  const custom = ev.target.value.split(".").map((s) => s.trim()).filter(Boolean);
                  const fromList = form.estrategias.filter((x) => ESTRATEGIAS_SUGERIDAS.includes(x));
                  setForm((f) => f ? { ...f, estrategias: [...fromList, ...custom] } : f);
                }}
                placeholder="Ex.: Durante as aulas é orientado a..."
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Objetivos acadêmicos por área</p>
            {AREAS_CURRICULARES.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Textarea
                  value={form.objetivosAcademicos[key] || ""}
                  onChange={(e) => setForm((f) => f ? { ...f, objetivosAcademicos: { ...f.objetivosAcademicos, [key]: e.target.value } } : f)}
                  rows={2}
                />
              </div>
            ))}
            <div>
              <Label className="text-xs">Objetivos sociais</Label>
              <div className="space-y-2 mt-1">
                {form.objetivosSociais.map((o, i) => (
                  <Input key={i} value={o} onChange={(e) => {
                    const next = [...form.objetivosSociais];
                    next[i] = e.target.value;
                    setForm((f) => f ? { ...f, objetivosSociais: next } : f);
                  }} />
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => f ? { ...f, objetivosSociais: [...form.objetivosSociais, ""] } : f)}>+ Adicionar</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Metas a curto prazo</p>
              {AREAS_CURRICULARES.map(({ key, label }) => (
                <div key={key} className="flex gap-2 items-center mb-2">
                  <span className="text-xs w-24 shrink-0">{label}</span>
                  <Input value={form.metasCurtoPrazo[key] || ""} onChange={(e) => setForm((f) => f ? { ...f, metasCurtoPrazo: { ...f.metasCurtoPrazo, [key]: e.target.value } } : f)} className="flex-1 text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4">
            <Label>Tipo de avaliação</Label>
            <div className="space-y-2">
              {AVALIACAO_OPCOES.map((op) => (
                <label key={op} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="avaliacao" checked={form.avaliacaoTipo === op} onChange={() => setForm((f) => f ? { ...f, avaliacaoTipo: op } : f)} />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
            <div>
              <Label className="text-xs">Observação sobre avaliação</Label>
              <Textarea value={form.avaliacaoObservacao} onChange={(e) => setForm((f) => f ? { ...f, avaliacaoObservacao: e.target.value } : f)} rows={2} />
            </div>
            <div>
              <Label className="text-xs">Responsável e data de revisão</Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.responsavel} onChange={(e) => setForm((f) => f ? { ...f, responsavel: e.target.value } : f)} placeholder="Ex.: Prof. regente" className="flex-1" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("min-w-[140px]", !form.dataRevisao && "text-muted-foreground")}>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {form.dataRevisao ? formatBRDate(form.dataRevisao) : "Data revisão"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={form.dataRevisao ? new Date(form.dataRevisao) : undefined}
                      onSelect={(d) => setForm((f) => f ? { ...f, dataRevisao: d ? format(d, "yyyy-MM-dd") : "" } : f)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label className="text-xs">Observações gerais</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm((f) => f ? { ...f, observacoes: e.target.value } : f)} rows={3} placeholder="Ex.: Aluno com potencial que precisa de apoio em..." />
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Resumo do PEI — revise e confirme</p>
            <Card className="border-amber-100 bg-amber-50/20 shadow-sm">
              <CardHeader className="py-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  Plano Educacional Especializado
                </CardTitle>
                <p className="text-sm text-muted-foreground">Aluno: {student.name}</p>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <section>
                  <h4 className="font-semibold text-amber-900 mb-1">Capacidades</h4>
                  <p className="text-muted-foreground leading-relaxed">{form.capacidades.filter(Boolean).length ? form.capacidades.filter(Boolean).join(" ") : "—"}</p>
                </section>
                <section>
                  <h4 className="font-semibold text-amber-900 mb-1">O que sabe</h4>
                  <div className="space-y-0.5 text-muted-foreground">
                    {AREAS_CURRICULARES.map(({ key, label }) => (
                      form.oQueSabe[key] && <p key={key}><span className="font-medium text-foreground">{label}:</span> {form.oQueSabe[key]}</p>
                    ))}
                    {!Object.values(form.oQueSabe).some(Boolean) && <p>—</p>}
                  </div>
                </section>
                <section>
                  <h4 className="font-semibold text-amber-900 mb-1">Necessidades</h4>
                  <p className="text-muted-foreground leading-relaxed">{form.necessidades.filter(Boolean).length ? form.necessidades.filter(Boolean).join("; ") : "—"}</p>
                </section>
                <section>
                  <h4 className="font-semibold text-amber-900 mb-1">Objetivos acadêmicos</h4>
                  <div className="space-y-0.5 text-muted-foreground">
                    {Object.entries(form.objetivosAcademicos).filter(([, v]) => v).map(([k, v]) => (
                      <p key={k}><span className="font-medium text-foreground">{AREAS_CURRICULARES.find((a) => a.key === k)?.label}:</span> {v}</p>
                    ))}
                    {!Object.values(form.objetivosAcademicos).some(Boolean) && <p>—</p>}
                  </div>
                </section>
                <section>
                  <h4 className="font-semibold text-amber-900 mb-1">Recursos e estratégias</h4>
                  <p className="text-muted-foreground leading-relaxed mb-2"><strong className="text-foreground">Recursos:</strong> {form.recursos.filter(Boolean).length ? form.recursos.filter(Boolean).join(", ") : "—"}</p>
                  <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Estratégias:</strong> {form.estrategias.filter(Boolean).length ? form.estrategias.filter(Boolean).join(". ") : "—"}</p>
                </section>
                <section>
                  <h4 className="font-semibold text-amber-900 mb-1">Avaliação e revisão</h4>
                  <p className="text-muted-foreground"><strong className="text-foreground">Tipo:</strong> {form.avaliacaoTipo || "—"}</p>
                  <p className="text-muted-foreground mt-1"><strong className="text-foreground">Responsável:</strong> {form.responsavel} · <strong>Revisão:</strong> {formatBRDate(form.dataRevisao)}</p>
                  {form.observacoes && <p className="text-muted-foreground mt-1 italic">{form.observacoes}</p>}
                </section>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navegação — fixa no rodapé */}
      <div className="flex-shrink-0 flex justify-between pt-4 border-t">
        <Button variant="outline" disabled={!canGoPrev} onClick={() => setStep((s) => s - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        {step < 9 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleSave}
            disabled={!canSave}
            title={!canSave ? "Preencha pelo menos objetivos, necessidades ou capacidades" : undefined}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Registrar PEI
          </Button>
        )}
      </div>
    </div>
  );
}
