import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { GraduationCap, Brain, BarChart3, Building2, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const profiles = [
  { key: "professor", label: "Entrar como Professor", icon: GraduationCap, desc: "Avaliações e turmas" },
  { key: "psicologia", label: "Entrar como Psicologia", icon: Brain, desc: "Encaminhamentos e avaliações" },
  { key: "coordenacao", label: "Entrar como Coordenação", icon: BarChart3, desc: "Dashboard estratégico" },
  { key: "diretoria", label: "Entrar como Diretoria", icon: Building2, desc: "Painel institucional" },
  { key: "admin", label: "Entrar como Admin", icon: Settings, desc: "Gestão do sistema" },
] as const;

export default function ProfileSelection() {
  const { setProfile } = useApp();
  const navigate = useNavigate();

  const handleSelect = (key: string) => {
    setProfile(key as any);
    navigate(`/${key}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">SIMP</h1>
          <p className="text-muted-foreground text-sm">Sistema Integrado de Monitoramento Pedagógico</p>
        </div>

        <div className="space-y-3">
          <p className="text-center text-sm font-medium text-muted-foreground">Escolha seu perfil</p>
          {profiles.map((p) => (
            <Card
              key={p.key}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
              onClick={() => handleSelect(p.key)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Protótipo navegável • Dados simulados • Fundamental 1
        </p>
      </div>
    </div>
  );
}
