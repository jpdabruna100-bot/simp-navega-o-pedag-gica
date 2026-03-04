-- Permite que usuários anon e authenticated atualizem intervenções.
-- Necessário para que a coordenação possa mover alunos de "Aguardando" para "Em_Acompanhamento".
DROP POLICY IF EXISTS "interventions_update_all" ON interventions;
CREATE POLICY "interventions_update_all" ON interventions
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- INSERT também necessário para criação de novas intervenções pelo professor
DROP POLICY IF EXISTS "interventions_insert_all" ON interventions;
CREATE POLICY "interventions_insert_all" ON interventions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- intervention_updates: INSERT necessário para registrar andamentos
DROP POLICY IF EXISTS "intervention_updates_insert_all" ON intervention_updates;
CREATE POLICY "intervention_updates_insert_all" ON intervention_updates
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
