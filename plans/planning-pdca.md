# Planejamento PDCA — Estrutura para mudanças maiores

Este documento descreve a estrutura **Plan → Do → Check → Act** para reorganizações, migrações ou mudanças que afetam várias partes do projeto.

Use quando a mudança for **grande** (múltiplas telas, fluxos, dados ou integrações) e precisar de fases claras de planejamento, execução, verificação e ajuste.

---

## 1. PLAN (Planejar)

- Definir **objetivo** e **escopo** da mudança.
- Listar **estado atual** vs **estado desejado** (tabelas, fluxos, arquivos).
- Mapear **dependências** e **ordem de execução**.
- Identificar **riscos** e **mitigações**.
- Documentar em um plano em `plans/` (ex.: usando [templates/feature-plan-template.md](templates/feature-plan-template.md) ou um doc próprio com seções PLAN / DO / CHECK / ACT).

---

## 2. DO (Executar)

- Seguir o plano aprovado.
- Alterar **apenas** o que está definido no plano ([metodologia-escopo-edicao.md](metodologia-escopo-edicao.md)).
- Fazer em etapas quando possível (ex.: migração por fluxo ou por módulo).
- Registrar desvios ou bloqueios para a fase CHECK.

---

## 3. CHECK (Verificar)

- Validar cada item da checklist de aceitação do plano.
- Rodar build, lint e testes (`npm run build`, `npm run lint`, `npm run test`).
- Testar fluxos principais no browser (localhost:8080).
- Comparar com o “estado desejado” definido no PLAN.

---

## 4. ACT (Agir / Ajustar)

- Corrigir o que falhou na verificação.
- Atualizar documentação e planos se o escopo tiver mudado.
- Arquivar ou marcar o plano como concluído e documentar lições aprendidas (opcional).

---

## Exemplo de uso no SIMP

- **Reorganização de rotas ou perfis** (professor, psicologia, coordenação, direção, admin): planejar novas rotas e permissões (PLAN), implementar (DO), testar cada perfil (CHECK), ajustar (ACT).
- **Mudança no modelo de dados no Supabase:** PLAN com novo schema e migração; DO em etapas (migration → código); CHECK com queries e UI; ACT em correções.

Para planos menores (uma feature, um ajuste pontual), os templates [feature-plan-template.md](templates/feature-plan-template.md) e [prevc-template.md](templates/prevc-template.md) costumam ser suficientes.
