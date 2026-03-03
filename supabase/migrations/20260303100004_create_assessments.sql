-- SIMP: Tabela assessments (avaliações pedagógicas)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ano_letivo INT NOT NULL,
  bimestre INT NOT NULL,
  conceito_geral TEXT NOT NULL,
  leitura TEXT NOT NULL,
  escrita TEXT NOT NULL,
  matematica TEXT NOT NULL,
  atencao TEXT NOT NULL,
  comportamento TEXT NOT NULL,
  dificuldade_percebida BOOLEAN NOT NULL DEFAULT FALSE,
  observacao_professor TEXT,
  principal_dificuldade TEXT,
  recorrente_ou_recente TEXT,
  estrategia_em_sala TEXT,
  sintomas_identificados TEXT[],
  acoes_iniciais TEXT[],
  outros_sintomas TEXT,
  outra_acao TEXT,
  frequencia_por_area JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_assessments_ano_bimestre ON assessments(ano_letivo, bimestre);
