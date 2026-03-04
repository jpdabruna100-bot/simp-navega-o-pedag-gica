import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { insertProfile, type ProfileInsert } from "@/lib/supabase-queries";
import { QUERY_KEYS } from "@/hooks/useSupabaseData";
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

export default function AdminColaborador() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ProfileInsert & { status?: string }>({
    name: "",
    email: "",
    role: "professor",
    status: "ativo",
  });
  const [endereco, setEndereco] = useState({
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    logradouro: "",
    numero: "",
    complemento: "",
  });
  const [contato, setContato] = useState({ telefone: "", ramal: "" });
  const [cargo, setCargo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Preencha nome e e-mail.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await insertProfile({ name: form.name, email: form.email, role: form.role });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles });
      toast({ title: "Usuário adicionado ao sistema." });
      setForm({ name: "", email: "", role: "professor", status: "ativo" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar usuário.";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-semibold text-muted-foreground uppercase tracking-wide mb-6">
        Colaborador
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* DADOS DE USUÁRIO */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Dados de usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as User["role"] }))}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Escolha o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Digite o nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={form.status ?? "ativo"}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Escolha o status do usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Digite o e-mail"
                />
              </div>
            </CardContent>
          </Card>

          {/* ENDEREÇO */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={endereco.cep}
                  onChange={(e) => setEndereco((a) => ({ ...a, cep: e.target.value }))}
                  placeholder="Digite o CEP"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={endereco.estado}
                    onValueChange={(v) => setEndereco((a) => ({ ...a, estado: v }))}
                  >
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="- Selecionar -" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Select
                    value={endereco.cidade}
                    onValueChange={(v) => setEndereco((a) => ({ ...a, cidade: v }))}
                  >
                    <SelectTrigger id="cidade">
                      <SelectValue placeholder="- Selecionar -" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="São Paulo">São Paulo</SelectItem>
                      <SelectItem value="Campinas">Campinas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={endereco.bairro}
                  onChange={(e) => setEndereco((a) => ({ ...a, bairro: e.target.value }))}
                  placeholder="Digite o bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={endereco.logradouro}
                  onChange={(e) => setEndereco((a) => ({ ...a, logradouro: e.target.value }))}
                  placeholder="Digite o logradouro"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={endereco.numero}
                    onChange={(e) => setEndereco((a) => ({ ...a, numero: e.target.value }))}
                    placeholder="Digite o número"
                  />
                </div>
                <div className="space-y-2 w-32">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={endereco.complemento}
                    onChange={(e) => setEndereco((a) => ({ ...a, complemento: e.target.value }))}
                    placeholder="Digite"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* CONTATO */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={contato.telefone}
                  onChange={(e) => setContato((c) => ({ ...c, telefone: e.target.value }))}
                  placeholder="(00) 0 0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ramal">Ramal</Label>
                <Input
                  id="ramal"
                  value={contato.ramal}
                  onChange={(e) => setContato((c) => ({ ...c, ramal: e.target.value }))}
                  placeholder="Digite..."
                />
              </div>
            </CardContent>
          </Card>

          {/* DADOS FUNCIONAIS */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Dados funcionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Digite o cargo"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
