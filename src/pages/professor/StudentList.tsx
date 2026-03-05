import { useApp } from "@/context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Student } from "@/data/mockData";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAssessmentPendingByTurma,
  isOverdue,
} from "@/lib/assessment-utils";
import {
  getEmAndamentoStudentIds,
} from "@/lib/professor-em-andamento";
import { formatBRDate } from "@/lib/utils";
import {
  ClipboardList,
  FileText,
  LayoutList,
  Columns3,
  AlertCircle,
} from "lucide-react";

const ANO_LETIVO = new Date().getFullYear();

/** Aluno tem demanda da equipe multidisciplinar/coordenação (PEI recomendado, Ações Internas, etc.) */
function hasDemanda(student: Student): boolean {
  if (student.peiRecomendado) return true;
  const hasActiveIntervention = student.interventions.some(
    (i) =>
      i.status !== "Concluído" &&
      (i.actionCategory === "Ações Internas" ||
        i.actionCategory === "Equipe Multidisciplinar")
  );
  return hasActiveIntervention;
}

/** Aluno tem pendência em atraso (PEI com prazo vencido) */
function hasPendenciaAtrasada(student: Student): boolean {
  if (student.peiRecomendado && isOverdue(student.peiRecomendado.prazo))
    return true;
  return false;
}

export default function StudentList() {
  const { turmaId } = useParams();
  const { students, turmas, isLoading } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [emAndamentoIds, setEmAndamentoIds] = useState<string[]>([]);

  const turma = turmas?.find((t) => t.id === turmaId);
  const turmaStudents = students.filter(
    (s) => turmaId && s.turmaId === turmaId
  );

  const assessmentPendingIds = getAssessmentPendingByTurma(
    turmaStudents,
    ANO_LETIVO
  );

  useEffect(() => {
    setEmAndamentoIds(getEmAndamentoStudentIds());
  }, []);

  const aguardandoAcao = turmaStudents.filter(
    (s) => hasDemanda(s) && !emAndamentoIds.includes(s.id)
  );
  const emAndamento = turmaStudents.filter((s) =>
    emAndamentoIds.includes(s.id)
  );

  const renderCard = (student: Student) => {
    const isAssessmentPending = assessmentPendingIds.has(student.id);
    const isOverduePei = hasPendenciaAtrasada(student);
    const turmaName = turmas?.find((t) => t.id === student.turmaId)?.name;

    return (
      <div
        key={student.id}
        onClick={() => navigate(`/professor/aluno/${student.id}`)}
        className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
          isOverduePei ? "border-red-300 ring-1 ring-red-100" : "border-slate-200"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3
              className={`font-semibold ${
                isOverduePei ? "text-red-900" : "text-slate-800"
              }`}
            >
              {student.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {turmaName} • Mat: {student.matricula}
            </p>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {student.peiRecomendado && (
            <Badge
              variant="outline"
              className={`text-[10px] ${
                isOverduePei
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <ClipboardList className="w-3 h-3 mr-0.5" />
              PEI pendente
              {isOverduePei && " (atrasado)"}
            </Badge>
          )}
          {isAssessmentPending && (
            <Badge
              variant="outline"
              className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
            >
              <FileText className="w-3 h-3 mr-0.5" />
              Avaliação pendente
            </Badge>
          )}
          {student.psychReferral && (
            <Badge
              variant="outline"
              className="text-[10px] bg-accent/10 text-accent border-accent/30"
            >
              Encaminhado
            </Badge>
          )}
        </div>

        {student.peiRecomendado && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Prazo: {formatBRDate(student.peiRecomendado.prazo)}
          </p>
        )}
      </div>
    );
  };

  const renderListItem = (student: Student) => {
    const isAssessmentPending = assessmentPendingIds.has(student.id);
    const isOverduePei = hasPendenciaAtrasada(student);

    return (
      <div
        key={student.id}
        onClick={() => navigate(`/professor/aluno/${student.id}`)}
        className={`flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:shadow-sm hover:border-primary/30 transition-all ${
          isOverduePei ? "border-red-200 bg-red-50/30" : ""
        }`}
      >
        <div>
          <p className="font-medium">{student.name}</p>
          <p className="text-xs text-muted-foreground">Mat: {student.matricula}</p>
        </div>
        <div className="flex items-center gap-2">
          {student.peiRecomendado && (
            <Badge
              variant="outline"
              className={`text-[10px] ${
                isOverduePei ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-800"
              }`}
            >
              PEI {isOverduePei && "⚠"}
            </Badge>
          )}
          {isAssessmentPending && (
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
              Aval. pendente
            </Badge>
          )}
          {student.psychReferral && (
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              Encaminhado
            </span>
          )}
          <RiskBadge level={student.riskLevel} />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{turma?.name || "Turma"}</h1>
          <p className="text-muted-foreground text-sm">
            Turno: {turma?.turno}
          </p>
        </div>

        {/* Barra de Filtros (padrão /coordenacao/intervencoes) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
          <span className="text-sm font-medium text-slate-600 mr-2 flex items-center gap-1.5 hidden sm:flex">
            Filtrar visualização:
          </span>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className={`h-8 rounded-full px-4 text-xs ${viewMode === "list" ? "bg-slate-700 hover:bg-slate-800" : "text-slate-600 border-slate-200 bg-white"}`}
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-3.5 w-3.5 mr-1.5" />
            Ver apenas lista
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            className={`h-8 rounded-full px-4 text-xs ${viewMode === "kanban" ? "bg-slate-700 hover:bg-slate-800" : "text-slate-600 border-slate-200 bg-white"}`}
            onClick={() => setViewMode("kanban")}
          >
            <Columns3 className="h-3.5 w-3.5 mr-1.5" />
            Ver 3 colunas (Kanban)
          </Button>
        </div>

        {/* 3 colunas: Todos os alunos | Aguardando Ação | Em andamento */}
        <div
          className={`grid gap-4 ${
            viewMode === "list"
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {/* Coluna 1: Todos os alunos */}
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              Todos os alunos
              <Badge variant="secondary" className="ml-1">
                {turmaStudents.length}
              </Badge>
            </h2>
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {turmaStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum aluno nesta turma.
                </p>
              ) : (
                turmaStudents.map(renderListItem)
              )}
            </div>
          </section>

          {/* Colunas 2 e 3: Kanban (visíveis quando toggle = kanban) */}
          {viewMode === "kanban" && (
            <>
              <section className="rounded-lg border bg-slate-50/50 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Aguardando Ação
                  <Badge variant="secondary" className="ml-1">
                    {aguardandoAcao.length}
                  </Badge>
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto min-h-[120px]">
                  {aguardandoAcao.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground py-6">
                      Nenhuma demanda pendente.
                    </p>
                  ) : (
                    aguardandoAcao.map(renderCard)
                  )}
                </div>
              </section>

              <section className="rounded-lg border bg-blue-50/30 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Em andamento
                  <Badge variant="secondary" className="ml-1">
                    {emAndamento.length}
                  </Badge>
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto min-h-[120px]">
                  {emAndamento.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground py-6">
                      PEI ou avaliação em edição aparecem aqui.
                    </p>
                  ) : (
                    emAndamento.map(renderCard)
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
