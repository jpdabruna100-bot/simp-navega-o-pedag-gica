import { useState } from "react";
import { users, turmas } from "@/data/mockData";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, BookOpen, Link } from "lucide-react";

const roleLabels: Record<string, string> = {
  professor: "Professor",
  psicologia: "Psicologia",
  coordenacao: "Coordenação",
  diretoria: "Diretoria",
  admin: "Admin",
};

export default function AdminDashboard() {
  const [selectedProf, setSelectedProf] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");

  const profs = users.filter((u) => u.role === "professor");

  const handleLink = () => {
    if (selectedProf && selectedTurma) {
      toast({ title: `Vínculo simulado: ${profs.find((p) => p.id === selectedProf)?.name} → ${turmas.find((t) => t.id === selectedTurma)?.name}` });
      setSelectedProf("");
      setSelectedTurma("");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Painel Admin</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><UsersIcon className="h-4 w-4" /> Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{roleLabels[user.role]}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Turmas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {turmas.map((turma) => {
                const prof = users.find((u) => u.id === turma.professorId);
                return (
                  <div key={turma.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{turma.name}</p>
                      <p className="text-xs text-muted-foreground">{turma.turno} • {prof?.name}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4" /> Vincular Professor → Turma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedProf} onValueChange={setSelectedProf}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione professor..." /></SelectTrigger>
                <SelectContent>
                  {profs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione turma..." /></SelectTrigger>
                <SelectContent>
                  {turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleLink} disabled={!selectedProf || !selectedTurma}>Vincular</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
