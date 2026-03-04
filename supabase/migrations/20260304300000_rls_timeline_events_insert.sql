-- Permite que usuários anon e authenticated insiram eventos na timeline.
-- Necessário para registrar movimentações como "Caso assumido", avaliações, etc.
DROP POLICY IF EXISTS "timeline_events_insert_all" ON timeline_events;
CREATE POLICY "timeline_events_insert_all" ON timeline_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- INSERT para psych_assessments (registrar avaliações psicológicas)
DROP POLICY IF EXISTS "psych_assessments_insert_all" ON psych_assessments;
CREATE POLICY "psych_assessments_insert_all" ON psych_assessments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- INSERT para family_contacts (registrar tentativas de contato)
DROP POLICY IF EXISTS "family_contacts_insert_all" ON family_contacts;
CREATE POLICY "family_contacts_insert_all" ON family_contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- UPDATE para family_contacts
DROP POLICY IF EXISTS "family_contacts_update_all" ON family_contacts;
CREATE POLICY "family_contacts_update_all" ON family_contacts
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- UPDATE para students (risk_level, psych_referral, etc.)
DROP POLICY IF EXISTS "students_update_all" ON students;
CREATE POLICY "students_update_all" ON students
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- INSERT para student_documents
DROP POLICY IF EXISTS "student_documents_insert_all" ON student_documents;
CREATE POLICY "student_documents_insert_all" ON student_documents
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- UPDATE para psych_assessments
DROP POLICY IF EXISTS "psych_assessments_update_all" ON psych_assessments;
CREATE POLICY "psych_assessments_update_all" ON psych_assessments
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
