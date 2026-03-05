import type { Student } from "@/data/mockData";

/**
 * Retorna os IDs dos alunos com avaliação pendente (critério relativo à turma).
 * A partir do momento em que 1 aluno tiver mais avaliações que os demais,
 * os demais são sinalizados como pendente. Até 10 avaliações por ano letivo.
 */
export function getAssessmentPendingByTurma(
  students: Student[],
  anoLetivo: number
): Set<string> {
  const pending = new Set<string>();
  if (students.length === 0) return pending;

  const countByStudent = new Map<string, number>();
  for (const s of students) {
    const count = s.assessments.filter((a) => a.anoLetivo === anoLetivo).length;
    countByStudent.set(s.id, count);
  }

  const actualMax = Math.max(...Array.from(countByStudent.values()));
  if (actualMax === 0) return pending;

  for (const s of students) {
    const count = countByStudent.get(s.id) ?? 0;
    if (count < actualMax) {
      pending.add(s.id);
    }
  }

  return pending;
}

/** Verifica se a data está em atraso (antes de hoje) */
export function isOverdue(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const pendingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return pendingDate < today;
}
