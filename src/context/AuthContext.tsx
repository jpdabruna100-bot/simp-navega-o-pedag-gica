import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { User as AppUser } from "@/data/mockData";

interface AuthContextType {
  session: { user: User } | null;
  profile: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfileByEmail(email: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("email", email)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { id: string; name: string; email: string; role: string };
  return { id: row.id, name: row.name, email: row.email, role: row.role as AppUser["role"] };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Em rotas que não são /login nem /admin, fazemos logout para que as requisições de dados
  // (students, interventions, etc.) usem a chave anon e as tabelas carreguem corretamente.
  const isAuthRoute = location.pathname === "/login" || location.pathname.startsWith("/admin");
  const [anonReady, setAnonReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthRoute) {
      setAnonReady(false);
      supabase.auth.signOut().then(() => {
        if (!cancelled) setAnonReady(true);
      });
    } else {
      setAnonReady(true);
    }
    return () => { cancelled = true; };
  }, [isAuthRoute]);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (cancelled) return;
      setSession(s ? { user: s.user } : null);
      if (s?.user?.email) {
        const p = await fetchProfileByEmail(s.user.email);
        if (!cancelled) setProfile(p);
      } else if (!cancelled) {
        setProfile(null);
      }
      if (!cancelled) setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (cancelled) return;
      setSession(s ? { user: s.user } : null);
      if (s?.user?.email) {
        const p = await fetchProfileByEmail(s.user.email);
        if (!cancelled) setProfile(p);
      } else if (!cancelled) setProfile(null);
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Em rotas de dados, só monta os filhos após signOut para as queries rodarem como anon
  const canRender = isAuthRoute || anonReady;

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isAdmin: profile?.role === "admin",
        isLoading,
        login,
        logout,
      }}
    >
      {canRender ? children : <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground text-sm">Carregando…</span></div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
