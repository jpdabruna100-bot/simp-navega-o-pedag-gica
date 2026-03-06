/**
 * Utilitários para elaboração guiada de PEI (Plano Educacional Especializado)
 * Baseado no modelo Jonas — pré-preenchimento e sugestões a partir da avaliação e recomendações.
 */

import type { Assessment, Student } from "@/data/mockData";

/** Áreas curriculares do PEI Jonas */
export type AreaCurricular = "linguagens" | "matematica" | "cienciasHumanas" | "cienciasNatureza";

/** Estrutura completa do PEI elaborado (modelo Jonas) */
export interface PEIElaborado {
  dataRegistro: string;
  dataRevisao: string;
  responsavel: string;
  capacidades: string[];
  oQueSabe: Record<AreaCurricular, string>;
  oQueGosta: string[];
  necessidades: string[];
  recursos: string[];
  estrategias: string[];
  objetivosAcademicos: Record<AreaCurricular, string>;
  objetivosSociais: string[];
  avaliacaoTipo: string;
  avaliacaoObservacao?: string;
  observacoes: string;
  metasCurtoPrazo: Record<AreaCurricular, string>;
  metasLongoPrazo: Record<AreaCurricular, string>;
  /** Campos legados para compatibilidade com exibição atual */
  objetivos: string;
  estrategiasLegado: string;
}

/** Estado do formulário do wizard (editável) */
export interface PEIFormState {
  capacidades: string[];
  oQueSabe: Record<AreaCurricular, string>;
  oQueGosta: string[];
  necessidades: string[];
  recursos: string[];
  estrategias: string[];
  objetivosAcademicos: Record<AreaCurricular, string>;
  objetivosSociais: string[];
  avaliacaoTipo: string;
  avaliacaoObservacao: string;
  observacoes: string;
  metasCurtoPrazo: Record<AreaCurricular, string>;
  metasLongoPrazo: Record<AreaCurricular, string>;
  responsavel: string;
  dataRevisao: string;
}

export const AREAS_CURRICULARES: { key: AreaCurricular; label: string }[] = [
  { key: "linguagens", label: "Linguagens" },
  { key: "matematica", label: "Matemática" },
  { key: "cienciasHumanas", label: "Ciências Humanas" },
  { key: "cienciasNatureza", label: "Ciências da Natureza" },
];

export const RECURSOS_SUGERIDOS = [
  "Lousa e pincel",
  "Livro didático",
  "Material dourado",
  "Jogos pedagógicos",
  "Plataformas digitais",
  "Projetor",
  "Lousa mágica",
  "Bolas, cones, bambolês",
  "Caderno de atividades",
];

export const ESTRATEGIAS_SUGERIDAS = [
  "Sentar próximo à professora",
  "Pausas entre tarefas",
  "Leitura compartilhada",
  "Avaliação adaptada com suporte da professora",
  "Apoio de colegas em atividades em grupo",
  "Intervenção quando situações fogem do controle",
  "Atividades práticas com ludicidade",
  "Jogos pedagógicos (encaixe, material dourado)",
];

export const AVALIACAO_OPCOES = [
  "Avaliação somativa adaptada com suporte da professora",
  "Prova objetiva adaptada com suporte",
  "Trabalhos de pesquisa",
  "Apresentação em evento/projeto cultural com suporte",
  "Relatório de acompanhamento individual",
];

const AREAS_AVALIACAO: Record<string, AreaCurricular> = {
  leitura: "linguagens",
  escrita: "linguagens",
  matematica: "matematica",
  atencao: "linguagens",
  comportamento: "cienciasHumanas",
};

const CONCEITO_ADEQUADO = ["Adequada", "Adequado", "Bom", "Excelente"];
const CONCEITO_DEFASAGEM = ["Defasada", "Defasado", "Insuficiente"];

/** Sugestões de capacidades — prioriza orientação da equipe; fallback na avaliação */
function sugerirCapacidades(
  assessment?: Assessment,
  peiRecomendado?: { areasAtencao?: string[]; sugestoes?: string }
): string[] {
  const list: string[] = [];
  // Prioridade: orientação da equipe
  if (peiRecomendado?.sugestoes) {
    const partes = peiRecomendado.sugestoes.split(/[;.]/).map((s) => s.trim()).filter(Boolean);
    for (const p of partes) {
      if (/material.*visual|apoio visual/i.test(p)) list.push("Responde bem a materiais com apoio visual.");
      if (/objetivos curtos|leitura/i.test(p)) list.push("Participa das atividades propostas pela professora.");
      if (/atenção|concentração|foco/i.test(p)) list.push("Consegue manter foco quando há estruturação da atividade.");
    }
  }
  // Fallback: avaliação pedagógica
  if (assessment && list.length === 0) {
    if (CONCEITO_ADEQUADO.includes(assessment.leitura)) list.push("Possui habilidades de leitura e compreensão de textos curtos.");
    if (CONCEITO_ADEQUADO.includes(assessment.escrita)) list.push("Se expressa com clareza por escrito.");
    if (CONCEITO_ADEQUADO.includes(assessment.matematica)) list.push("Tem noções quantificativas e domina operações básicas.");
    if (CONCEITO_ADEQUADO.includes(assessment.atencao)) list.push("Consegue manter foco nas atividades propostas.");
    if (CONCEITO_ADEQUADO.includes(assessment.comportamento)) list.push("Segue comandos e regras de convivência.");
  }
  if (list.length === 0) list.push("Participa das atividades propostas pela professora.");
  return [...new Set(list)];
}

/** O que sabe — prioriza orientação da equipe; fallback em conceitos da avaliação */
function preencherOQueSabe(
  assessment?: Assessment,
  peiRecomendado?: { areasAtencao?: string[]; sugestoes?: string }
): Record<AreaCurricular, string> {
  const vazio: Record<AreaCurricular, string> = { linguagens: "", matematica: "", cienciasHumanas: "", cienciasNatureza: "" };
  const areasRec = new Set(peiRecomendado?.areasAtencao?.map((a) => a.toLowerCase()) || []);

  // Prioridade: orientação da equipe (áreas e sugestões)
  if (areasRec.size > 0 || peiRecomendado?.sugestoes) {
    const sugestoes = peiRecomendado?.sugestoes || "";
    if (areasRec.has("leitura") || areasRec.has("escrita") || /leitura|escrita/i.test(sugestoes)) {
      const apoioVisual = /apoio visual|material visual/i.test(sugestoes)
        ? "Desempenho melhora com material de apoio visual. "
        : "";
      vazio.linguagens = `${apoioVisual}Aprendizado em leitura e escrita com acompanhamento.`;
    }
    if (areasRec.has("atenção") || /atenção|concentração|foco/i.test(sugestoes)) {
      const extra = "Consegue manter foco quando há apoio e estruturação da atividade.";
      vazio.linguagens = vazio.linguagens ? `${vazio.linguagens} ${extra}` : extra;
    }
    if (areasRec.has("matemática") || areasRec.has("matematica") || /matemática|matematica/i.test(sugestoes)) {
      vazio.matematica = "Desenvolvendo noções quantificativas. Domina operações básicas com apoio.";
    }
    if (areasRec.has("comportamento")) {
      vazio.cienciasHumanas = "Em desenvolvimento nas relações e regras de convivência.";
    }
  }

  // Fallback: avaliação pedagógica (se área ainda vazia)
  if (assessment) {
    if (!vazio.linguagens && (CONCEITO_ADEQUADO.includes(assessment.leitura) || CONCEITO_ADEQUADO.includes(assessment.escrita))) {
      vazio.linguagens = "Tem habilidades compatíveis com a turma em leitura e escrita. Reconhece letras e domina escrita.";
    }
    if (!vazio.matematica && CONCEITO_ADEQUADO.includes(assessment.matematica)) {
      vazio.matematica = "Tem aptidão em matemática. Domina soma e subtração com apoio.";
    }
    if (!vazio.cienciasHumanas && CONCEITO_ADEQUADO.includes(assessment.comportamento)) {
      vazio.cienciasHumanas = "Segue regras de convivência e se relaciona adequadamente.";
    }
  }
  return vazio;
}

/** Necessidades — baseado em defasagens + recomendações da equipe */
function preencherNecessidades(
  assessment?: Assessment,
  peiRecomendado?: { areasAtencao?: string[]; sugestoes?: string }
): string[] {
  const list: string[] = [];
  if (peiRecomendado?.sugestoes) {
    list.push(...peiRecomendado.sugestoes.split(/[;.]/).map((s) => s.trim()).filter(Boolean));
  }
  if (assessment) {
    if (CONCEITO_DEFASAGEM.includes(assessment.leitura)) list.push("Praticar leitura, principalmente palavras com sílabas complexas.");
    if (CONCEITO_DEFASAGEM.includes(assessment.escrita)) list.push("Praticar escrita e desenvolver fluência.");
    if (CONCEITO_DEFASAGEM.includes(assessment.matematica)) list.push("Desenvolver operações matemáticas (soma, subtração, multiplicação, divisão).");
    if (CONCEITO_DEFASAGEM.includes(assessment.atencao)) list.push("Ampliar tempo de concentração nas atividades. Promover autoconfiança e auto regulação.");
    if (CONCEITO_DEFASAGEM.includes(assessment.comportamento)) list.push("Desenvolver interação e regras de convivência.");
    if (assessment.dificuldadePercebida) list.push("Suporte para realização de atividades.");
  }
  return [...new Set(list)];
}

/** Objetivos sugeridos por área — prioriza orientação da equipe */
function sugerirObjetivosPorArea(
  assessment?: Assessment,
  peiRecomendado?: { areasAtencao?: string[]; sugestoes?: string }
): Record<AreaCurricular, string> {
  const vazio: Record<AreaCurricular, string> = { linguagens: "", matematica: "", cienciasHumanas: "", cienciasNatureza: "" };
  const areasRec = new Set(peiRecomendado?.areasAtencao?.map((a) => a.toLowerCase()) || []);
  const sugestoes = peiRecomendado?.sugestoes || "";

  // Prioridade: orientação da equipe (sugestoes explícitas)
  if (sugestoes) {
    if (areasRec.has("leitura") || areasRec.has("escrita") || /leitura|escrita/i.test(sugestoes)) {
      const priorizarCurtos = /objetivos curtos/i.test(sugestoes)
        ? "Priorizar objetivos curtos em leitura. "
        : "";
      const apoioVisual = /apoio visual|material visual/i.test(sugestoes)
        ? "Utilizar material com apoio visual para favorecer o aprendizado."
        : "Fluência na leitura. Reconhecimento de sílabas complexas.";
      vazio.linguagens = priorizarCurtos + apoioVisual;
    }
    if (areasRec.has("atenção") || /atenção|concentração|foco/i.test(sugestoes)) {
      const extra = "Ampliar concentração e autorregulação.";
      vazio.linguagens = vazio.linguagens ? `${vazio.linguagens} ${extra}` : extra;
    }
  }

  // Complemento ou fallback: áreas da equipe e avaliação
  if (areasRec.has("leitura") && !vazio.linguagens) {
    vazio.linguagens = "Fluência na leitura. Reconhecimento de sílabas complexas.";
  }
  if (CONCEITO_DEFASAGEM.includes(assessment?.leitura || "") && !vazio.linguagens) {
    vazio.linguagens = "Fluência na leitura. Reconhecimento de sílabas complexas.";
  }
  if (CONCEITO_DEFASAGEM.includes(assessment?.escrita || "") || areasRec.has("escrita")) {
    vazio.linguagens = (vazio.linguagens ? vazio.linguagens + " " : "") + "Escrever com letra cursiva de forma legível.";
  }
  if (CONCEITO_DEFASAGEM.includes(assessment?.matematica || "") || areasRec.has("matemática") || areasRec.has("matematica")) {
    vazio.matematica = "Realizar com destreza as operações: soma, subtração, multiplicação e divisão.";
  }
  if ((CONCEITO_DEFASAGEM.includes(assessment?.atencao || "") || areasRec.has("atenção")) && !/atenção|concentração|foco/i.test(vazio.linguagens)) {
    vazio.linguagens = (vazio.linguagens ? vazio.linguagens + " " : "") + "Ampliar concentração e autorregulação.";
  }
  if (CONCEITO_DEFASAGEM.includes(assessment?.comportamento || "")) {
    vazio.cienciasHumanas = "Bom relacionamento com colegas. Participação ativa nas atividades.";
  }
  return vazio;
}

/** Metas curto prazo — versão resumida dos objetivos */
function sugerirMetasCurtoPrazo(
  assessment?: Assessment,
  peiRecomendado?: { areasAtencao?: string[] }
): Record<AreaCurricular, string> {
  const obj = sugerirObjetivosPorArea(assessment, peiRecomendado);
  return {
    linguagens: obj.linguagens ? obj.linguagens.split(".")[0] + "." : "",
    matematica: obj.matematica ? "Realizar cálculos com destreza e sem suporte." : "",
    cienciasHumanas: obj.cienciasHumanas ? obj.cienciasHumanas.split(".")[0] + "." : "",
    cienciasNatureza: obj.cienciasNatureza || "",
  };
}

/** Estratégias derivadas da orientação da equipe */
function estrategiasDaEquipe(peiRecomendado?: { sugestoes?: string }): string[] {
  if (!peiRecomendado?.sugestoes) return [];
  const list: string[] = [];
  const s = peiRecomendado.sugestoes.toLowerCase();
  if (/apoio visual|material visual/i.test(s)) list.push("Uso de material com apoio visual");
  if (/objetivos curtos|metas curtas/i.test(s)) list.push("Objetivos curtos e sequenciais");
  if (/leitura/i.test(s)) list.push("Leitura compartilhada");
  if (/atenção|concentração|foco/i.test(s)) list.push("Pausas entre tarefas");
  return list;
}

/** Converte PEI existente (formato legado ou guiado) em PEIFormState para edição */
export function peiToFormState(pei: NonNullable<Student["pei"]>): PEIFormState {
  const areas: AreaCurricular[] = ["linguagens", "matematica", "cienciasHumanas", "cienciasNatureza"];
  const vazioArea = Object.fromEntries(areas.map((a) => [a, ""])) as Record<AreaCurricular, string>;

  const estrategiasArr =
    typeof pei.estrategias === "string"
      ? pei.estrategias.split(/[.;]/).map((s) => s.trim()).filter(Boolean)
      : Array.isArray(pei.estrategias)
        ? pei.estrategias.filter(Boolean)
        : [];

  const temFormatoGuiado =
    (pei.capacidades?.length ?? 0) > 0 ||
    (pei.oQueSabe && Object.values(pei.oQueSabe).some(Boolean)) ||
    (pei.objetivosAcademicos && Object.values(pei.objetivosAcademicos).some(Boolean));

  const observacoesVal =
    "observacoes" in pei && pei.observacoes
      ? String(pei.observacoes)
      : !temFormatoGuiado && pei.objetivos
        ? pei.objetivos
        : "";

  return {
    capacidades: pei.capacidades?.filter(Boolean) ?? [],
    oQueSabe: pei.oQueSabe
      ? { ...vazioArea, ...pei.oQueSabe }
      : vazioArea,
    oQueGosta: pei.oQueGosta?.filter(Boolean) ?? [],
    necessidades: pei.necessidades?.filter(Boolean) ?? [],
    recursos: pei.recursos?.filter(Boolean) ?? [],
    estrategias: estrategiasArr.length > 0 ? estrategiasArr : ["Acompanhamento e apoio contínuo."],
    objetivosAcademicos: pei.objetivosAcademicos
      ? { ...vazioArea, ...pei.objetivosAcademicos }
      : vazioArea,
    objetivosSociais: pei.objetivosSociais?.filter(Boolean) ?? [],
    avaliacaoTipo: "avaliacaoTipo" in pei && pei.avaliacaoTipo ? String(pei.avaliacaoTipo) : AVALIACAO_OPCOES[0],
    avaliacaoObservacao: "avaliacaoObservacao" in pei && pei.avaliacaoObservacao ? String(pei.avaliacaoObservacao) : "",
    observacoes: observacoesVal,
    metasCurtoPrazo: pei.metasCurtoPrazo
      ? { ...vazioArea, ...pei.metasCurtoPrazo }
      : vazioArea,
    metasLongoPrazo: pei.metasLongoPrazo
      ? { ...vazioArea, ...pei.metasLongoPrazo }
      : vazioArea,
    responsavel: pei.responsavel || "Professor regente",
    dataRevisao: pei.dataRevisao || new Date().toISOString().split("T")[0],
  };
}

/** Inicializa o estado do formulário a partir do aluno */
export function preencherFormAPartirDeAluno(student: Student): PEIFormState {
  if (student.pei) {
    return peiToFormState(student.pei);
  }

  const lastAssessment = student.assessments?.[student.assessments.length - 1];
  const peiRec = student.peiRecomendado;

  const capacidades = sugerirCapacidades(lastAssessment, peiRec);
  const necessidades = preencherNecessidades(lastAssessment, peiRec);
  const objetivos = sugerirObjetivosPorArea(lastAssessment, peiRec);
  const metasCurto = sugerirMetasCurtoPrazo(lastAssessment, peiRec);
  const estrategiasEquipe = estrategiasDaEquipe(peiRec);
  const estrategiasBase = ["Sentar próximo à professora", "Pausas entre tarefas", "Avaliação adaptada com suporte da professora"];
  const estrategias = [...new Set([...estrategiasEquipe, ...estrategiasBase])];

  const today = new Date().toISOString().split("T")[0];
  const recursosBase = ["Lousa e pincel", "Livro didático", "Material dourado"];
  const recursosExtra = peiRec?.sugestoes && /apoio visual|material visual/i.test(peiRec.sugestoes) ? ["Projetor"] : [];
  const recursos = [...new Set([...recursosBase, ...recursosExtra])];

  return {
    capacidades: capacidades.length > 0 ? capacidades : ["Participa das atividades propostas pela professora."],
    oQueSabe: preencherOQueSabe(lastAssessment, peiRec),
    oQueGosta: ["Atividades práticas com ludicidade.", "Jogos pedagógicos."],
    necessidades: necessidades.length > 0 ? necessidades : ["Suporte para realização de atividades."],
    recursos,
    estrategias,
    objetivosAcademicos: objetivos,
    objetivosSociais: [
      "Oferecer apoio personalizado e incentivar estratégias individuais.",
      "Proporcionar ambiente acolhedor, estimulando participação e bom relacionamento.",
    ],
    avaliacaoTipo: AVALIACAO_OPCOES[0],
    avaliacaoObservacao: "",
    observacoes: "",
    metasCurtoPrazo: metasCurto,
    metasLongoPrazo: objetivos,
    responsavel: "Professor regente",
    dataRevisao: today,
  };
}

/** Converte o formulário em PEIElaborado para persistência */
export function formToPEIElaborado(form: PEIFormState, studentName: string): PEIElaborado {
  const today = new Date().toISOString().split("T")[0];
  const objetivosTexto = Object.entries(form.objetivosAcademicos)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${AREAS_CURRICULARES.find((a) => a.key === k)?.label}: ${v}`)
    .join(". ");
  const estrategiasTexto = form.estrategias.join(". ");
  return {
    dataRegistro: today,
    dataRevisao: form.dataRevisao,
    responsavel: form.responsavel,
    capacidades: form.capacidades,
    oQueSabe: form.oQueSabe,
    oQueGosta: form.oQueGosta,
    necessidades: form.necessidades,
    recursos: form.recursos,
    estrategias: form.estrategias,
    objetivosAcademicos: form.objetivosAcademicos,
    objetivosSociais: form.objetivosSociais,
    avaliacaoTipo: form.avaliacaoTipo,
    avaliacaoObservacao: form.avaliacaoObservacao || undefined,
    observacoes: form.observacoes,
    metasCurtoPrazo: form.metasCurtoPrazo,
    metasLongoPrazo: form.metasLongoPrazo,
    objetivos: objetivosTexto || "Desenvolver habilidades conforme necessidades identificadas.",
    estrategiasLegado: estrategiasTexto || "Acompanhamento e apoio contínuo.",
  };
}

/** Converte PEIElaborado para formato legado (compatível com pei atual) */
export function peiElaboradoToLegado(pei: PEIElaborado) {
  return {
    objetivos: pei.objetivos,
    estrategias: pei.estrategiasLegado,
    responsavel: pei.responsavel,
    dataRevisao: pei.dataRevisao,
    dataRegistro: pei.dataRegistro,
    ...pei,
  };
}
