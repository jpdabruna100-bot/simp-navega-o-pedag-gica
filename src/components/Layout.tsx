import { useApp } from "@/context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const profileLabels: Record<string, string> = {
  professor: "Professor",
  psicologia: "Psicologia",
  coordenacao: "Coordenação",
  diretoria: "Diretoria",
  admin: "Admin",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, setProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isRoot = location.pathname === `/${profile}`;

  const handleLogout = () => {
    setProfile(null);
    navigate("/");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isRoot && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-primary-foreground hover:bg-primary/80">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-lg hidden sm:inline">SIMP</span>
            <span className="text-sm opacity-80 hidden md:inline">Sistema Integrado de Monitoramento Pedagógico</span>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <span className="text-sm bg-primary-foreground/15 px-3 py-1 rounded-full">
                {profileLabels[profile]}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80 gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
