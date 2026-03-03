-- SIMP: Tabela critical_occurrence_logs
CREATE TABLE critical_occurrence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id UUID NOT NULL REFERENCES critical_occurrences(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_critical_occurrence_logs_occurrence_id ON critical_occurrence_logs(occurrence_id);
