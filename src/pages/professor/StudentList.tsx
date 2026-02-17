import { useApp } from "@/context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { turmas, RiskLevel } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Layout from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Search } from "lucide-react";

export default function StudentList() {
  const { turmaId } = useParams();
  const { students } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "all">("all");

  const turma = turmas.find((t) => t.id === turmaId);
  const turmaStudents = students
    .filter((s) => s.turmaId === turmaId)
    .filter((s) => filter === "all" || s.riskLevel === filter)
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{turma?.name || "Turma"}</h1>
          <p className="text-muted-foreground text-sm">Turno: {turma?.turno}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar aluno..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {(["all", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f === "all" ? "Todos" : f === "high" ? "🔴" : f === "medium" ? "🟡" : "🟢"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {turmaStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => navigate(`/professor/aluno/${student.id}`)}
              className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:shadow-sm hover:border-primary/30 transition-all"
            >
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-xs text-muted-foreground">Mat: {student.matricula}</p>
              </div>
              <div className="flex items-center gap-3">
                {student.psychReferral && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Encaminhado</span>
                )}
                <RiskBadge level={student.riskLevel} />
              </div>
            </div>
          ))}
          {turmaStudents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum aluno encontrado.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
