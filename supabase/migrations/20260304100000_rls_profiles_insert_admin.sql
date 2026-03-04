-- Permite que usuários identificados como admin (por email no JWT) insiram novos perfis em profiles.
-- O login usa email; identificamos admin pelo registro em profiles com role = 'admin'.
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.email = (auth.jwt() ->> 'email')
      AND p.role = 'admin'
    )
  );
