# Avaliação e Melhorias na Ficha do Aluno (SIMP)

Este documento concentra a análise de usabilidade, clareza e qualidade de dados gerados a partir do preenchimento da **Ficha Mensal de Avaliação** pelo Professor, com foco em como essas informações são consumidas pela Coordenação Pedagógica e pela equipe de Psicologia.

## 1. O Problema Atual (Gargalos de Informação)
O fluxo atual de preenchimento da ficha garante rapidez para o professor, mas gera **dados muitas vezes genéricos ou incompletos** para as esferas seguintes (Coordenação e Psicologia), dificultando a triagem e o planejamento de intervenções adequadas.

**Principais pontos de dor identificados:**

*   **Falta de Obrigatoriedade Contextual:** Campos cruciais para a compreensão do problema (ex: *O que já foi tentado em sala?*, *Desde quando o problema ocorre?*) são frequentemente tratados como opcionais ou pulados.
*   **Subjetividade em Textos Livres:** Observações como "aluno agitado" ou "dificuldade de aprendizado" são muito vagas para orientar a ação da Coordenação/Psicologia sem que seja necessária uma nova reunião investigativa.
*   **Inconsistência de Nomenclatura:** Existe um conflito potencial na definição de risco (o documento menciona alertas por conceitos *insuficientes*, enquanto a escala fala em *defasada*).

## 2. Propostas de Melhoria

Para garantir que a próxima pessoa da cadeia (Coordenador ou Psicólogo) entenda perfeitamente o contexto do aluno e não precise voltar ao professor para pedir mais detalhes, sugerimos as seguintes evoluções na Ficha de Avaliação:

### A. Condicionalidade Inteligente (Obrigatoriedade Contextual)
**Como funciona?** 
Se o aluno receber qualquer conceito "Defasado/Insuficiente" em Leitura, Escrita, Matemática, Atenção ou Comportamento, o sistema deve **exigir** que o professor detalhe:
1.  **Há quanto tempo essa dificuldade ocorre?** (Ex: Recente, Apenas neste bimestre, Desde o início do ano).
2.  **Quais estratégias já foram tentadas em sala de aula?** (Ex: Mudança de lugar, atividades de reforço, conversa com a família).

**Objetivo:** Evitar que a Coordenação proponha uma intervenção que já foi testada e falhou.

### B. Uso de Checklists Estruturados (Redução da Subjetividade)
**Como funciona?**
Substituir os campos abertos de "Observação" por checklists rápidos com categorias de comportamento observável.

*   *Exemplos para Dificuldade Comportamental:*
    *   [ ] Não consegue permanecer sentado durante atividades com foco direcional longo.
    *   [ ] Apresenta resistência extrema a mudanças de rotina.
    *   [ ] Relacionamento conflituoso com colegas frequente.
*   *Exemplos para Dificuldade Acadêmica:*
    *   [ ] Confunde letras espelhadas (p/b, q/d).
    *   [ ] Não consegue realizar operações matemáticas básicas compatíveis com a idade.

**Objetivo:** Transformar observações vagas em dados concretos, acionáveis e rastreáveis pela Psicologia.

### C. Abordagens Dinâmicas para a Coleta de Dados na Avaliação

Para resolver o problema das "informações soltas" no atual fluxo de avaliação do professor e para garantir que a coordenação receba dados ricos e estruturados, propomos duas alternativas arquiteturais para a tela de avaliação:

#### Alternativa 1: Ficha de Avaliação Guiada (Fluxo Condicional)
**Como funciona?** 
Em vez de uma ficha estática com campos abertos e genéricos ("Observações"), o formulário é dividido em etapas inteligentes:
1. **Identificação do Problema:** Se o professor marcar "Defasado" em Atenção ou Comportamento, o sistema abre imediatamente um bloco específico.
2. **Checklist Comportamental:** O professor marca opções que descrevem exatamente o que acontece em sala de aula (Ex: "Esquece material frequentemente", "Apresenta dificuldade em tarefas de repetição").
3. **Mapeamento de Ações Prévias:** O sistema exibe um formulário do tipo "*Quais ações iniciais já foram realizadas?*" (Ex: "Mudança de lugar", "Conversa com a família", "Redução da carga de exercícios").
4. **Encaminhamento Direto:** Ao finalizar com notas defasadas, a ficha já transita o aluno para **"Monitoria"** de forma automatizada, notificando a Coordenação.
5. **Sugestão de Ações (Opcional):** Com base nos checklists marcados, o próprio sistema pode sugerir rapidamente ao professor estratégias imediatas antes mesmo de a psicóloga ou a coordenação atuar.

**Vantagem:** Muito rápido de implementar via React Hook Form / UI (shadcn), evita subjetividade e garante padronização total para a Coordenação.

#### Alternativa 2: Agente Assistente (IA) de Qualificação 
**Como funciona?**
O professor não preenche uma ficha fria, mas interage com um Agente Assistente (LLM integrado) desenhado especificamente para "qualificar" a avaliação pedagógica com perguntas fechadas, progressivas e inteligentes.
1. O professor inicia a avaliação e informa: *"João está com muita dificuldade em Matemática e comportamento agitado."*
2. Em vez de despejar isso em um campo de texto, o Agente analisa a frase no contexto do aluno e pergunta: *"Percebi que o João tem dificuldade em Matemática. Há quanto tempo você observa isso? Ele não acompanha a matéria ou o problema é na execução da prova?"*
3. O Agente pergunta proativamente: *"E sobre o comportamento agitado, você já tentou mudar o aluno de lugar ou conversar com ele sobre isso?"*
4. No final da interação, o Agente **estrutura as respostas do professor** em um JSON padronizado e injeta na base de dados, já acionando a Coordenação.

**Vantagem:** Experiência muito mais humana e focada. O agente extrai apenas o que é relevante, elimina viés subjetivo ("informações soltas") e garante que o Coordenador receba um relatório perfeito de encaminhamento.

---
## 3. Próximos Passos e Discussão
*   *Definir qual caminho seguir para o professor:* **Ficha Guiada (UI Condicional e Checklists)** versus **Agente de Qualificação (IA Interativa)**?
*   *Mapear os Checklists:* Definir quais são as 5-10 "Ações Iniciais" padrão que todo professor deve tentar antes de acionar a Coordenação (e colocar isso no sistema).
