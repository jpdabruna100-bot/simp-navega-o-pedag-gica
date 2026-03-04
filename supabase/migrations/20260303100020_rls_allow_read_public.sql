-- Permite que o app (anon e authenticated) leia os dados já existentes no banco.
-- Necessário quando RLS está ativado no projeto Supabase.
-- Aplicar: Supabase Dashboard → SQL Editor → colar e executar.

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO anon, authenticated USING (true);

-- turmas
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "turmas_select_all" ON turmas;
CREATE POLICY "turmas_select_all" ON turmas FOR SELECT TO anon, authenticated USING (true);

-- students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_select_all" ON students;
CREATE POLICY "students_select_all" ON students FOR SELECT TO anon, authenticated USING (true);

-- assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assessments_select_all" ON assessments;
CREATE POLICY "assessments_select_all" ON assessments FOR SELECT TO anon, authenticated USING (true);

-- psych_assessments
ALTER TABLE psych_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "psych_assessments_select_all" ON psych_assessments;
CREATE POLICY "psych_assessments_select_all" ON psych_assessments FOR SELECT TO anon, authenticated USING (true);

-- interventions
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "interventions_select_all" ON interventions;
CREATE POLICY "interventions_select_all" ON interventions FOR SELECT TO anon, authenticated USING (true);

-- intervention_updates
ALTER TABLE intervention_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "intervention_updates_select_all" ON intervention_updates;
CREATE POLICY "intervention_updates_select_all" ON intervention_updates FOR SELECT TO anon, authenticated USING (true);

-- family_contacts
ALTER TABLE family_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "family_contacts_select_all" ON family_contacts;
CREATE POLICY "family_contacts_select_all" ON family_contacts FOR SELECT TO anon, authenticated USING (true);

-- student_documents
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_documents_select_all" ON student_documents;
CREATE POLICY "student_documents_select_all" ON student_documents FOR SELECT TO anon, authenticated USING (true);

-- timeline_events
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timeline_events_select_all" ON timeline_events;
CREATE POLICY "timeline_events_select_all" ON timeline_events FOR SELECT TO anon, authenticated USING (true);
