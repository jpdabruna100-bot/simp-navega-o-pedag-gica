-- SIMP: Tabela students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  risk_level risk_level NOT NULL DEFAULT 'low',
  last_assessment_date DATE,
  psych_referral BOOLEAN NOT NULL DEFAULT FALSE,
  psych_referral_reason TEXT,
  critical_alert BOOLEAN DEFAULT FALSE,
  medicacao TEXT,
  acompanhamento_externo TEXT,
  potencialidades TEXT,
  zdp TEXT,
  pei JSONB,
  pei_recomendado JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_turma_id ON students(turma_id);
CREATE INDEX idx_students_risk_level ON students(risk_level);
CREATE INDEX idx_students_psych_referral ON students(psych_referral);
