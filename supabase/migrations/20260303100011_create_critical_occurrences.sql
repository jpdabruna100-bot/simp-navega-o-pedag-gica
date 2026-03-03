-- SIMP: Tabela critical_occurrences (Dossiês OC-1)
CREATE TABLE critical_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status critical_occurrence_status NOT NULL DEFAULT 'Em Tratativa',
  categories TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  reported_by TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_critical_occurrences_student_id ON critical_occurrences(student_id);
CREATE INDEX idx_critical_occurrences_status ON critical_occurrences(status);
