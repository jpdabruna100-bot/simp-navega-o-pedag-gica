import { useApp } from "@/context/AppContext";
import { formatBRDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { turmas } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, ClipboardList } from "lucide-react";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";

export default function ProfessorDashboard() {
  const { students } = useApp();
  const navigate = useNavigate();

  // Professor sees turmas t1, t2, t5 (professorId u1)
  const myTurmas = turmas.filter((t) => t.professorId === "u1");
  const myStudents = students.filter((s) => myTurmas.some((t) => t.id === s.turmaId));
  const demandasPei = myStudents
    .filter((s) => !s.pei && s.peiRecomendado)
    .map((s) => ({
      studentId: s.id,
      nome: s.name,
      turma: myTurmas.find((t) => t.id === s.turmaId)?.name ?? "",
      prazo: s.peiRecomendado!.prazo,
    }))
    .sort((a, b) => a.prazo.localeCompare(b.prazo));
  const peiPendenteCount = demandasPei.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painel do Professor</h1>
            <p className="text-muted-foreground text-sm">Profª. Carla Mendes</p>
          </div>
          {peiPendenteCount > 0 && (
            <div
              id="demandas"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 cursor-pointer hover:bg-amber-100/80 transition-colors"
              onClick={() => document.getElementById("secao-demandas")?.scrollIntoView({ behavior: "smooth" })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("secao-demandas")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ClipboardList className="h-5 w-5 text-amber-600" />
              <span className="font-medium">{peiPendenteCount} aluno{peiPendenteCount > 1 ? "s" : ""} com PEI pendente</span>
            </div>
          )}
        </div>

        {demandasPei.length > 0 && (
          <Card id="secao-demandas" className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                <ClipboardList className="h-5 w-5 text-amber-600" />
                Minhas Demandas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {demandasPei.map((d) => (
                  <li key={d.studentId}>
                    <button
                      type="button"
                      onClick={() => navigate(`/professor/aluno/${d.studentId}`)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 hover:border-amber-300 transition-colors"
                    >
                      <span className="font-medium text-slate-800">Elaborar PEI — {d.nome} ({d.turma})</span>
                      <span className="text-xs text-amber-700">Prazo: {formatBRDate(d.prazo)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myTurmas.map((turma) => {
            const turmaStudents = students.filter((s) => s.turmaId === turma.id);
            const highRisk = turmaStudents.filter((s) => s.riskLevel === "high").length;
            const mediumRisk = turmaStudents.filter((s) => s.riskLevel === "medium").length;
            const peiPendenteTurma = turmaStudents.filter((s) => !s.pei && s.peiRecomendado).length;

            return (
              <Card
                key={turma.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
                onClick={() => navigate(`/professor/turma/${turma.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    {turma.name}
                    {peiPendenteTurma > 0 && (
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {peiPendenteTurma} PEI pendente{peiPendenteTurma > 1 ? "s" : ""}
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Turno: {turma.turno}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {turmaStudents.length} alunos
                  </div>
                  {(highRisk > 0 || mediumRisk > 0 || peiPendenteTurma > 0) && (
                    <div className="flex flex-wrap gap-2 text-sm">
                      {highRisk > 0 && (
                        <span className="font-medium text-risk-high">
                          <AlertTriangle className="h-3.5 w-3.5 inline mr-0.5" />
                          {highRisk} 🔴
                        </span>
                      )}
                      {mediumRisk > 0 && (
                        <span className="font-medium text-risk-medium">
                          <AlertTriangle className="h-3.5 w-3.5 inline mr-0.5" />
                          {mediumRisk} 🟡
                        </span>
                      )}
                      {peiPendenteTurma > 0 && (
                        <span className="font-medium text-amber-700">
                          <ClipboardList className="h-3.5 w-3.5 inline mr-0.5" />
                          {peiPendenteTurma} PEI
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
