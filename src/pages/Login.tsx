import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const { login, isRecovery: ctxRecovery, clearRecovery } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) setRecoveryMode(true);
  }, []);
  const recoveryModeActive = recoveryMode || ctxRecovery;

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "A senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    setResetLoading(true);
    try {
      const RESET_TIMEOUT_MS = 45_000; // tempo maior: Supabase Auth pode demorar em rede lenta
      const doUpdate = () =>
        Promise.race([
          supabase.auth.updateUser({ password: newPassword }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("A alteração está demorando. Tente novamente em alguns segundos; se persistir, use o link do e-mail de novo.")), RESET_TIMEOUT_MS)
          ),
        ]);

      // Pequena pausa para evitar conflito com o Auth processando o link de recuperação
      await new Promise((r) => setTimeout(r, 800));

      let result = await doUpdate();
      const maxRetries = 2;
      for (let i = 0; i < maxRetries && result.error?.message?.includes("Lock broken"); i++) {
        await new Promise((r) => setTimeout(r, 2000));
        result = await doUpdate();
      }
      if (result.error) throw result.error;

      toast({ title: "Senha alterada com sucesso. Faça login com a nova senha." });
      setRecoveryMode(false);
      clearRecovery();
      setNewPassword("");
      setNewPasswordConfirm("");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const friendlyMsg = msg.includes("Lock broken")
        ? "Conflito temporário com outra requisição. Tente clicar em \"Definir nova senha\" novamente."
        : msg;
      toast({ title: "Erro ao definir senha", description: friendlyMsg, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({ title: "Informe o email", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast({
        title: "Email enviado",
        description: "Se o email estiver cadastrado, você receberá um link para redefinir a senha. Verifique a caixa de entrada e o spam.",
      });
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast({ title: "Erro ao enviar", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: "Preencha email e senha", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Login realizado com sucesso!" });
      navigate(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao fazer login";
      const isInvalidCreds = typeof msg === "string" && (msg.includes("Invalid login credentials") || msg.includes("credenciais"));
      const description = isInvalidCreds
        ? "O email precisa existir em Supabase → Authentication → Users (não só na tabela profiles). Rode: npx tsx scripts/create-admin-auth.ts"
        : msg;
      toast({ title: "Erro no login", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">SIMP</CardTitle>
          <CardDescription>Sistema Integrado de Monitoramento Pedagógico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recoveryModeActive ? (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Defina uma nova senha para sua conta.
              </p>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  disabled={resetLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password-confirm">Confirmar nova senha</Label>
                <Input
                  id="new-password-confirm"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  disabled={resetLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Definir nova senha"
                )}
              </Button>
              {resetLoading && (
                <p className="text-center text-sm text-muted-foreground">
                  Isso pode levar alguns segundos. Aguarde.
                </p>
              )}
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@escola.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotOpen(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                Esqueci a senha
              </button>
            </div>
          </form>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Acesso restrito a administradores do sistema
          </p>
        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Esqueci a senha</DialogTitle>
            <DialogDescription>
              Informe o email cadastrado. Enviaremos um link para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="admin@escola.edu.br"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
                disabled={forgotLoading}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)} disabled={forgotLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={forgotLoading}>
                {forgotLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
