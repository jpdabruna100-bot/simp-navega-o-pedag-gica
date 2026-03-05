const STORAGE_KEY = "professor_em_andamento";

/** Retorna os IDs dos alunos em andamento (PEI wizard ou avaliação em edição) */
export function getEmAndamentoStudentIds(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Adiciona aluno à lista de em andamento */
export function addEmAndamento(studentId: string): void {
  const ids = getEmAndamentoStudentIds();
  if (!ids.includes(studentId)) {
    ids.push(studentId);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

/** Remove aluno da lista de em andamento */
export function removeEmAndamento(studentId: string): void {
  const ids = getEmAndamentoStudentIds().filter((id) => id !== studentId);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
