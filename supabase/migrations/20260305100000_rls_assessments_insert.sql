-- SIMP: Permite INSERT em assessments (avaliações pedagógicas pelo professor)
-- Necessário para salvar avaliação pedagógica (2 e 4 etapas)
DROP POLICY IF EXISTS "assessments_insert_all" ON assessments;
CREATE POLICY "assessments_insert_all" ON assessments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
