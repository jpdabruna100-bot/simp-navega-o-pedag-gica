-- SIMP: Tabela family_contacts
CREATE TABLE family_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  tentativa1 JSONB NOT NULL DEFAULT '{"done": false, "date": null}',
  tentativa2 JSONB NOT NULL DEFAULT '{"done": false, "date": null}',
  tentativa3 JSONB NOT NULL DEFAULT '{"done": false, "date": null}',
  houve_retorno BOOLEAN,
  observacao TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_family_contacts_student_id ON family_contacts(student_id);
