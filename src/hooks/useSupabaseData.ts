import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchProfiles,
  fetchTurmas,
  fetchStudents,
  fetchCriticalOccurrences,
  fetchCriticalOccurrencesAll,
} from "@/lib/supabase-queries";

export const QUERY_KEYS = {
  profiles: ["profiles"] as const,
  turmas: ["turmas"] as const,
  students: ["students"] as const,
  criticalOccurrences: ["criticalOccurrences"] as const,
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

export function useCriticalOccurrences() {
  return useQuery({
    queryKey: QUERY_KEYS.criticalOccurrences,
    queryFn: fetchCriticalOccurrences,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
}

export function useCriticalOccurrencesAll() {
  return useQuery({
    queryKey: [...QUERY_KEYS.criticalOccurrences, "all"],
    queryFn: fetchCriticalOccurrencesAll,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
}

/** Realtime: invalida ocorrências críticas quando professor registra novo alerta */
export function useCriticalOccurrencesRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("critical_occurrences_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "critical_occurrences" },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.criticalOccurrences });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
