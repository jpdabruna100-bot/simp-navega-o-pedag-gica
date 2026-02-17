import React, { createContext, useContext, useState } from "react";
import { Student, initialStudents } from "@/data/mockData";

type Profile = "professor" | "psicologia" | "coordenacao" | "diretoria" | "admin" | null;

interface AppContextType {
  profile: Profile;
  setProfile: (p: Profile) => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(null);
  const [students, setStudents] = useState<Student[]>(initialStudents);

  return (
    <AppContext.Provider value={{ profile, setProfile, students, setStudents }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
