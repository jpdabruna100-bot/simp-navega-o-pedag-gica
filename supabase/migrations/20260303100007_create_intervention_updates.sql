-- SIMP: Tabela intervention_updates
CREATE TABLE intervention_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intervention_updates_intervention_id ON intervention_updates(intervention_id);
