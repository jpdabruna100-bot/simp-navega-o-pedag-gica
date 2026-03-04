import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { insertProfile, type ProfileInsert } from "@/lib/supabase-queries";
import { QUERY_KEYS } from "@/hooks/useSupabaseData";
import { Users as UsersIcon, BookOpen, Link, UserPlus, Search, RefreshCw } from "lucide-react";
import type { User } from "@/data/mockData";

const roleLabels: Record<string, string> = {
  professor: "Professor",
  psicologia: "Psicologia",
  psicopedagogia: "Psicopedagogia",
  coordenacao: "Coordenação",
  diretoria: "Diretoria",
  admin: "Admin",
};

const ROLES: User["role"][] = ["professor", "psicologia", "psicopedagogia", "coordenacao", "diretoria", "admin"];

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { profiles, turmas, isLoading } = useApp();
  const [selectedProf, setSelectedProf] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [createForm, setCreateForm] = useState<ProfileInsert>({ name: "", email: "", role: "professor" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profs = profiles.filter((u) => u.role === "professor");

  const filteredProfiles = useMemo(() => {
    if (!userSearch.trim()) return profiles;
    const q = userSearch.trim().toLowerCase();
    return profiles.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [profiles, userSearch]);

  const handleLink = () => {
    if (selectedProf && selectedTurma) {
      toast({ title: `Vínculo simulado: ${profs.find((p) => p.id === selectedProf)?.name} → ${turmas.find((t) => t.id === selectedTurma)?.name}` });
      setSelectedProf("");
      setSelectedTurma("");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      toast({ title: "Preencha nome e email.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await insertProfile(createForm);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles });
      toast({ title: "Usuário adicionado ao sistema." });
      setCreateForm({ name: "", email: "", role: "professor" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar usuário.";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.turmas });
    toast({ title: "Listas atualizadas." });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-muted-foreground uppercase tracking-wide">Principal</h1>
        <Button variant="outline" size="sm" onClick={handleRefetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar listas
          </Button>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><UsersIcon className="h-4 w-4" /> Usuários do Sistema</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  {userSearch ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
                </p>
              ) : (
                filteredProfiles.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{roleLabels[user.role]}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Turmas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {turmas.map((turma) => {
                const prof = profiles.find((u) => u.id === turma.professorId);
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
            <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Criar usuário</CardTitle>
            <CardDescription>
              Adicione um novo perfil ao sistema. Para a pessoa poder fazer login, crie também a conta em Supabase Auth (Dashboard → Authentication → Users ou script <code className="text-xs bg-muted px-1 rounded">create-admin-auth.ts</code>).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="new-user-name">Nome</Label>
                  <Input
                    id="new-user-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-user-email">Email</Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@escola.edu.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-user-role">Perfil</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v as User["role"] }))}
                  >
                    <SelectTrigger id="new-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando…" : "Criar usuário"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

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
    </div>
  );
}
