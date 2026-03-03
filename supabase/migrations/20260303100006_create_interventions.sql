-- SIMP: Tabela interventions
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  action_category action_category NOT NULL,
  action_tool TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  status intervention_status NOT NULL DEFAULT 'Aguardando',
  pending_until DATE,
  resolution_ata TEXT,
  accepted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interventions_student_id ON interventions(student_id);
CREATE INDEX idx_interventions_status ON interventions(status);
