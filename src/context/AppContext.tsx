import React, { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Student, Turma, User } from "@/data/mockData";
import { useStudents, useTurmas, useProfiles } from "@/hooks/useSupabaseData";
import { QUERY_KEYS } from "@/hooks/useSupabaseData";

type Profile = "professor" | "psicologia" | "coordenacao" | "diretoria" | "admin" | null;

interface AppContextType {
  profile: Profile;
  setProfile: (p: Profile) => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  turmas: Turma[];
  profiles: User[];
  isLoading: boolean;
  refetchStudents: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(null);
  const queryClient = useQueryClient();
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useStudents();
  const { data: turmasData, isLoading: turmasLoading } = useTurmas();
  const { data: profilesData } = useProfiles();

  const students = studentsData ?? [];
  const isLoading = studentsLoading || turmasLoading;

  const setStudents: React.Dispatch<React.SetStateAction<Student[]>> = (updater) => {
    queryClient.setQueryData(QUERY_KEYS.students, (prev: Student[] | undefined) =>
      typeof updater === "function" ? updater(prev ?? []) : updater
    );
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        students,
        setStudents,
        turmas: turmasData ?? [],
        profiles: profilesData ?? [],
        isLoading,
        refetchStudents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
