/**
 * Cria o usuário admin no Supabase Auth (Authentication → Users).
 * A tabela profiles já pode ter o email; o login exige que o usuário exista no Auth.
 *
 * Uso (com variáveis do .env):
 *   npx tsx scripts/create-admin-auth.ts
 *
 * Ou com variáveis na linha de comando:
 *   ADMIN_EMAIL=wdavidce@gmail.com ADMIN_PASSWORD=admin123 npx tsx scripts/create-admin-auth.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.ADMIN_EMAIL || "admin@escola.edu.br";
const password = process.env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error("Defina SUPABASE_URL e SUPABASE_ANON_KEY (ou VITE_*) no .env");
  process.exit(1);
}

if (!password || password.length < 6) {
  console.error("Defina ADMIN_PASSWORD no .env (mín. 6 caracteres). Exemplo:");
  console.error("  ADMIN_EMAIL=wdavidce@gmail.com ADMIN_PASSWORD=admin123 npx tsx scripts/create-admin-auth.ts");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: undefined },
  });
  if (error) {
    if (error.message.includes("already been registered") || error.message.includes("already registered")) {
      console.log("Usuário já existe no Authentication. Use a senha correta ou redefina em Supabase → Authentication → Users.");
      return;
    }
    throw error;
  }
  console.log(`Usuário criado no Auth: ${email}`);
  console.log("Agora você pode fazer login em /login com esse email e senha.");
  if (data.user && !data.session) {
    console.log("Se o Supabase exigir confirmação de email, desative em Auth → Providers → Email ou confirme o link enviado.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
