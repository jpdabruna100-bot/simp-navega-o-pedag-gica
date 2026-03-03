-- SIMP: Tabela student_documents
CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type document_type NOT NULL,
  date DATE NOT NULL,
  responsavel TEXT NOT NULL,
  url TEXT NOT NULL,
  doc_category document_category,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_documents_student_id ON student_documents(student_id);
