import { useQuery } from "@tanstack/react-query";
import {
  fetchProfiles,
  fetchTurmas,
  fetchStudents,
} from "@/lib/supabase-queries";

export const QUERY_KEYS = {
  profiles: ["profiles"] as const,
  turmas: ["turmas"] as const,
  students: ["students"] as const,
};

export function useProfiles() {
  return useQuery({
    queryKey: QUERY_KEYS.profiles,
    queryFn: fetchProfiles,
  });
}

export function useTurmas() {
  return useQuery({
    queryKey: QUERY_KEYS.turmas,
    queryFn: fetchTurmas,
  });
}

export function useStudents() {
  return useQuery({
    queryKey: QUERY_KEYS.students,
    queryFn: fetchStudents,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
