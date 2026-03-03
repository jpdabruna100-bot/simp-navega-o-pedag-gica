-- SIMP: Tabela psych_assessments
CREATE TABLE psych_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tipo psych_assessment_tipo NOT NULL,
  classificacao TEXT NOT NULL,
  necessita_acompanhamento BOOLEAN NOT NULL DEFAULT TRUE,
  observacao TEXT,
  possui_pei TEXT CHECK (possui_pei IN ('Sim', 'Não', 'Em elaboração')),
  responsavel TEXT,
  potencialidades TEXT,
  zdp TEXT,
  queixa_descritiva TEXT,
  pei JSONB,
  recomenda_elaboracao_pei BOOLEAN,
  areas_atencao_pei TEXT[],
  sugestoes_pei TEXT,
  prazo_pei DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_psych_assessments_student_id ON psych_assessments(student_id);
