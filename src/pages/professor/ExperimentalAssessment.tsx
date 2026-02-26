import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function ExperimentalAssessment() {
    const { studentId } = useParams();
    const { students } = useApp();
    const navigate = useNavigate();

    const student = students.find((s) => s.id === studentId);

    const [form, setForm] = useState({
        conceitoGeral: "",
        leitura: "",
        escrita: "",
        matematica: "",
        atencao: "",
        comportamento: "",
        observacaoProfessor: "",

        // Dados de acompanhamento guiado
        sintomasIdentificados: [] as string[],
        acoesIniciais: [] as string[],
        outrosSintomas: "",
        outraAcao: "",
        frequenciaPorArea: {} as Record<string, string>,
    });

    // Controle do Wizard (Stepper) de 4 passos
    const [currentStep, setCurrentStep] = useState(1);

    if (!student) return <Layout><p>Aluno não encontrado.</p></Layout>;

    const getDefasagens = () => {
        const defasagens: string[] = [];
        if (form.leitura === "Defasada") defasagens.push("Leitura");
        if (form.escrita === "Defasada") defasagens.push("Escrita");
        if (form.matematica === "Defasada") defasagens.push("Matemática");
        if (form.atencao === "Defasada") defasagens.push("Atenção");
        if (form.comportamento === "Defasado") defasagens.push("Comportamento");

        // Se o conceito for insuficiente mas as disciplinas específicas não estiverem defasadas (raro, mas possível)
        if (form.conceitoGeral === "Insuficiente" && defasagens.length === 0) {
            defasagens.push("Geral");
        }
        return defasagens;
    };

    const hasDefasagem = getDefasagens().length > 0;

    // Mapeamento dos SINTOMAS baseados no DOC oficial (Exclusivo para Etapa 2)
    const sintomasPorArea: Record<string, string[]> = {
        "Leitura": [
            "Dificuldade em reconhecer as sílabas",
            "Dificuldade em decodificar/ler isoladamente",
            "Dificuldade em soletrar palavras",
            "Processa fonologicamente quebrando em pedaços",
            "Lê, mas não interpreta / Não compreende",
            "Tentativas de evitar leitura por insegurança",
            "Lentidão na aprendizagem da leitura"
        ],
        "Escrita": [
            "Dificuldade em nomear ou reconhecer letras",
            "Não sabe fazer uso do caderno (espaçamento, linhas)",
            "Dificuldade em reescrever da lousa",
            "Letra ilegível, desorganizada ou controle motor fino fraco",
            "Troca, omissão ou acréscimo de letras (sons semelhantes)",
            "Erros ortográficos/gramaticais/acento incomuns p/ idade",
            "Dificuldade em organizar ideias com clareza no papel"
        ],
        "Matemática": [
            "Dificuldade em nomear/reconhecer números",
            "Dificuldade em realizar sequência ou contagem",
            "Dificuldade nas 4 operações lógicas",
            "Dificuldade em armar e efetuar contas",
            "Dificuldade em resolver problemas textuais"
        ],
        "Atenção": [
            "Dificuldade em manter atenção nas aulas",
            "Dificuldade em concluir as atividades",
            "Dificuldade em lembrar instruções recentes",
            "Dificuldade em organizar material/trabalho",
            "Perda de foco nas aulas / Baixo desempenho"
        ],
        "Comportamento": [
            "Impulsividade e dificuldade em aguardar a vez",
            "Dificuldade em expressar ideias adequadamente",
            "Medo, ansiedade ou baixa autoestima observada",
            "Resistência a mudar de ambiente ou rotina"
        ],
        "Geral": [
            "Esquecimento constante de material/livros",
            "Desorganização severa de fardamento/mochila",
            "Isolamento em relação aos colegas"
        ]
    };

    // Mapeamento das AÇÕES TENTADAS baseadas no DOC oficial (Exclusivo para Etapa 3)
    const acoesPorArea: Record<string, string[]> = {
        "Leitura": [
            "Fiz sondagens diagnósticas pontuais de leitura",
            "Adaptei a metodologia textual para a necessidade dele(a)",
            "Estimulei o interesse lúdico ou com temas que gosta",
        ],
        "Escrita": [
            "Adaptei tamanho das atividades e espaçamentos",
            "Fiz intervenção no manuseio/correção do caderno",
            "Flexibilizei o tempo em cópias extensas"
        ],
        "Matemática": [
            "Fiz uso intenso de material concreto (dourado/ábaco)",
            "Reduzi a complexidade ou volume dos problemas",
            "Trabalhei a fixação base antes de avançar operações"
        ],
        "Atenção": [
            "Mudei de lugar (foco na lousa / longe de distrações)",
            "Segmentei instruções longas em etapas curtas",
            "Criei um ambiente de apoio positivo e seguro na aula"
        ],
        "Comportamento": [
            "Conversei individualmente elogiando os acertos (autoestima)",
            "Trabalhei limites de impulsividade visuais/combinados",
            "Estimulei o desenvolvimento da autonomia em pequenos passos"
        ],
        "Geral": [
            "Agendei/Fiz reunião individual com os pais para conscientização",
            "Manti comunicação aberta diária/semanal (Clipescola)",
            "Pedi avaliação da Coordenação / Academia do Aprendizado"
        ]
    };

    const handleSintomaChange = (sintoma: string) => {
        setForm((prev) => {
            if (prev.sintomasIdentificados.includes(sintoma)) {
                return { ...prev, sintomasIdentificados: prev.sintomasIdentificados.filter(s => s !== sintoma) };
            }
            return { ...prev, sintomasIdentificados: [...prev.sintomasIdentificados, sintoma] };
        });
    };

    const handleAcaoChange = (acao: string) => {
        setForm((prev) => {
            if (prev.acoesIniciais.includes(acao)) {
                return { ...prev, acoesIniciais: prev.acoesIniciais.filter(a => a !== acao) };
            }
            return { ...prev, acoesIniciais: [...prev.acoesIniciais, acao] };
        });
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!form.conceitoGeral || !form.leitura || !form.escrita || !form.matematica || !form.atencao || !form.comportamento) {
                toast({ title: "Preencha todas as notas para prosseguir", variant: "destructive" });
                return;
            }
            if (!hasDefasagem) {
                setCurrentStep(4); // Pula direto para a conclusão
            } else {
                setCurrentStep(2); // Vai para Sintomas
            }
        } else if (currentStep === 2) {
            const defasagens = getDefasagens();
            const faltamFrequencias = defasagens.some(d => !form.frequenciaPorArea[d]);

            if (faltamFrequencias) {
                toast({ title: "Por favor, indique se a dificuldade é Recente ou Recorrente para cada área.", variant: "destructive" });
                return;
            }

            if (form.sintomasIdentificados.length === 0 && !form.outrosSintomas.trim()) {
                toast({ title: "Por favor, indique quais sintomas/dificuldades foram percebidos.", variant: "destructive" });
                return;
            }
            setCurrentStep(3); // Vai para Ações
        } else if (currentStep === 3) {
            // Ações são fortemente recomendadas mas o professor pode não ter tentado nada ainda, então não bloqueamos.
            setCurrentStep(4); // Vai para Conclusão
        }
    };

    const handleSave = () => {
        if (!form.observacaoProfessor.trim()) {
            toast({ title: "O parecer final do professor é obrigatório", variant: "destructive" });
            return;
        }

        if (form.observacaoProfessor.trim().length < 50) {
            toast({ title: "Parecer muito vago! Por favor, detalhe mais a sua observação.", variant: "destructive" });
            return;
        }

        toast({ title: hasDefasagem ? "Avaliação recebida! Aluno encaminhado para monitoria." : "Avaliação salva com sucesso!" });
        navigate(`/professor/aluno/${studentId}`);
    };

    const Field = ({ label, field, options, tooltip }: { label: string; field: keyof typeof form; options: string[], tooltip?: string }) => (
        <div className="space-y-1.5 flex flex-col justify-end p-4 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="mb-2">
                <Label className="text-base font-semibold text-slate-900">{label}</Label>
                {tooltip && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-white/50 p-2 rounded border border-slate-100">
                        {tooltip}
                    </p>
                )}
            </div>
            <Select value={form[field] as string} onValueChange={(v) => setForm((f) => ({ ...f, [field]: v }))}>
                <SelectTrigger className="w-full bg-white transition-colors focus:ring-primary/20 border-slate-300 h-11">
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Avaliação Guiada (Teste)
                    </h1>
                    <p className="text-muted-foreground text-sm">Avaliando: {student.name}</p>
                </div>

                <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
                    <div className={`flex flex-col items-center flex-shrink-0 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1 border-primary bg-primary text-white">1</div>
                        <span className="text-xs font-medium px-2">Notas Iniciais</span>
                    </div>
                    <div className={`flex-1 h-1 min-w-[20px] ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>

                    {hasDefasagem && (
                        <>
                            <div className={`flex flex-col items-center flex-shrink-0 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1 ${currentStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white'}`}>2</div>
                                <span className="text-xs font-medium px-2">Sintomas</span>
                            </div>
                            <div className={`flex-1 h-1 min-w-[20px] ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>

                            <div className={`flex flex-col items-center flex-shrink-0 ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1 ${currentStep >= 3 ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white'}`}>3</div>
                                <span className="text-xs font-medium px-2">Estratégias Turma</span>
                            </div>
                            <div className={`flex-1 h-1 min-w-[20px] ${currentStep >= 4 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                        </>
                    )}

                    <div className={`flex flex-col items-center flex-shrink-0 ${currentStep >= 4 ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1 ${currentStep >= 4 ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white'}`}>{hasDefasagem ? '4' : '2'}</div>
                        <span className="text-xs font-medium px-2">Parecer Final</span>
                    </div>
                </div>

                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card>
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-lg">Avaliação de Desempenho (Etapa 1 de 3)</CardTitle>
                                <CardDescription>Resumo rápido de desempenho e comportamento escolar.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field
                                        label="Conceito Geral"
                                        field="conceitoGeral"
                                        options={["Regular", "Bom", "Excelente", "Insuficiente"]}
                                        tooltip="Avalie o aluno globalmente na comunidade escolar: assiduidade, capricho/organização (mochila, caderno, farda), disciplina geral e interação com colegas/professor."
                                    />
                                    <Field
                                        label="Leitura"
                                        field="leitura"
                                        options={["Adequada", "Em desenvolvimento", "Defasada"]}
                                        tooltip="Lê enunciados com autonomia pro ano escolar? A velocidade e fluência estão de acordo com o esperado (7-11 anos) ou há silabação excessiva?"
                                    />
                                    <Field
                                        label="Escrita"
                                        field="escrita"
                                        options={["Adequada", "Em desenvolvimento", "Defasada"]}
                                        tooltip="Consegue formular frases e copiá-las do quadro no tempo hábil? Avalie erros ortográficos graves (trocas p/b, f/v não esperadas para a idade)."
                                    />
                                    <Field
                                        label="Matemática"
                                        field="matematica"
                                        options={["Adequada", "Em desenvolvimento", "Defasada"]}
                                        tooltip="O aluno compreende o raciocínio das 4 operações adequadas à sua idade? Possui dificuldade extrema em montar/armar contas simples?"
                                    />
                                    <Field
                                        label="Atenção"
                                        field="atencao"
                                        options={["Adequada", "Em desenvolvimento", "Defasada"]}
                                        tooltip="Foco em atividades da lousa ou silenciosas: O aluno dispersa muito rápido? Esquece instruções de 5 min atrás sistematicamente?"
                                    />
                                    <Field
                                        label="Comportamento"
                                        field="comportamento"
                                        options={["Adequado", "Em desenvolvimento", "Defasado"]}
                                        tooltip="Apresenta impulsividade recorrente, agressividade (física/verbal), ou resistência forte a mudar rotinas e a ser contrariado?"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-6">
                            <Button onClick={handleNextStep} className="w-full" size="lg">Avançar para Qualificação</Button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && hasDefasagem && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card className="border-red-200 bg-red-50/30">
                            <CardHeader className="pb-4 border-b border-red-100">
                                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Mapeamento de Sintomas (Etapa 2 de 4)
                                </CardTitle>
                                <CardDescription className="text-red-700/80">
                                    Baseado no Levantamento Pedagógico. Marque as características exatas observadas no aluno.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <Label className="text-sm font-medium text-red-800">Quais as manifestações da dificuldade de aprendizagem?</Label>
                                <div className="space-y-6 mb-6">
                                    {getDefasagens().map((area) => (
                                        <div key={area} className="space-y-3">
                                            <p className="text-sm font-bold text-slate-800 bg-red-100/70 py-1.5 px-3 rounded inline-block">Manifestações em {area}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {sintomasPorArea[area]?.map((sintoma) => (
                                                    <label key={sintoma} className="flex items-start gap-3 p-3 border rounded-md bg-white hover:bg-red-50/50 cursor-pointer transition-colors border-red-100/60 shadow-sm">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 flex-shrink-0 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                                                            checked={form.sintomasIdentificados.includes(sintoma)}
                                                            onChange={() => handleSintomaChange(sintoma)}
                                                        />
                                                        <span className="text-sm text-gray-700 leading-snug">{sintoma}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="mt-4 p-4 bg-white/50 border border-red-100/60 rounded-md">
                                                <Label className="text-sm font-semibold text-slate-800 mb-2 block">Essa manifestação em {area} é Frequente ou Recente?</Label>
                                                <Select
                                                    value={form.frequenciaPorArea[area] || ""}
                                                    onValueChange={(v) => setForm(f => ({ ...f, frequenciaPorArea: { ...f.frequenciaPorArea, [area]: v } }))}
                                                >
                                                    <SelectTrigger className="w-full md:w-1/2 bg-white">
                                                        <SelectValue placeholder="Selecione o tempo..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Recorrente">Recorrente (Vem de meses anteriores)</SelectItem>
                                                        <SelectItem value="Recente">Recente (Começou este mês)</SelectItem>
                                                        <SelectItem value="Imprevisível">Imprevisível (Oscila muito)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1.5 mt-6 pt-4 border-t border-red-100">
                                    <Label className="text-sm font-medium text-red-800">Citar outro sintoma/dificuldade específica não listada? (Opcional)</Label>
                                    <Textarea
                                        value={form.outrosSintomas}
                                        onChange={(e) => setForm((f) => ({ ...f, outrosSintomas: e.target.value }))}
                                        placeholder="Caso haja alguma outra dificuldade visual, de fala ou comportamento que foge à lista."
                                        rows={2}
                                        className="bg-white border-red-200/50 focus-visible:ring-red-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-6 flex gap-4">
                            <Button variant="outline" onClick={() => setCurrentStep(1)} size="lg">Voltar</Button>
                            <Button onClick={handleNextStep} className="flex-1" size="lg">Avançar para Ações da Turma</Button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && hasDefasagem && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card className="border-orange-200 bg-orange-50/50">
                            <CardHeader className="pb-4 border-b border-orange-100">
                                <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                                    Investigação de Estratégias (Etapa 3 de 4)
                                </CardTitle>
                                <CardDescription className="text-orange-700/80">
                                    O que já foi feito em sala de aula ou escola para tentar mitigar a dificuldade.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <Label className="text-sm font-medium text-orange-800">Ações, sondagens e adaptações que eu já testei:</Label>
                                <div className="space-y-6 mb-6">
                                    {getDefasagens().map((area) => (
                                        <div key={area} className="space-y-3">
                                            <p className="text-sm font-bold text-slate-800 bg-orange-100/70 py-1.5 px-3 rounded inline-block">Plano de Ação: {area}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {acoesPorArea[area]?.map((acao) => (
                                                    <label key={acao} className="flex items-start gap-3 p-3 border rounded-md bg-white hover:bg-orange-50/50 cursor-pointer transition-colors border-orange-100/60 shadow-sm">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 flex-shrink-0 w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                                            checked={form.acoesIniciais.includes(acao)}
                                                            onChange={() => handleAcaoChange(acao)}
                                                        />
                                                        <span className="text-sm text-gray-700 leading-snug">{acao}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1.5 mt-6 pt-4 border-t border-orange-100">
                                    <Label className="text-sm font-medium text-orange-800">Estratégias livres ou combinadas com os pais? (Opcional)</Label>
                                    <Textarea
                                        value={form.outraAcao}
                                        onChange={(e) => setForm((f) => ({ ...f, outraAcao: e.target.value }))}
                                        placeholder="Relate aqui rapidamente se fez alguma outra coisa ou se combinou algo com os pais."
                                        rows={2}
                                        className="bg-white border-orange-200/50 focus-visible:ring-orange-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-6 flex gap-4">
                            <Button variant="outline" onClick={() => setCurrentStep(2)} size="lg">Voltar aos Sintomas</Button>
                            <Button onClick={handleNextStep} className="flex-1" size="lg">Ir para Parecer Final</Button>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card>
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-lg">
                                    {hasDefasagem ? "Encaminhamento e Parecer Diagnóstico (Etapa 4 de 4)" : "Parecer de Desenvolvimento (Etapa 2 de 2)"}
                                </CardTitle>
                                <CardDescription>
                                    {hasDefasagem
                                        ? "Com base no mapeamento realizado, condense as informações no seu parecer."
                                        : "Nenhum sinal de alerta grave identificado. Registre os avanços e destaques do aluno."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-semibold">Parecer Escrito do Professor *</Label>
                                    </div>

                                    <div className={`p-3 rounded-md text-sm border flex gap-2 ${hasDefasagem ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                                        <span className="text-xl mt-0.5">💡</span>
                                        <div className="w-full">
                                            <strong className="block">Descreva exemplos práticos do dia a dia.</strong>
                                            {hasDefasagem ? (
                                                <div className="mt-1">
                                                    <span className="text-blue-900/80">Como as dificuldades se manifestam? Inspire-se:</span>
                                                    <ul className="list-disc pl-5 space-y-1 mt-1 text-blue-800/90 italic">
                                                        <li>"Ao invés de ler a palavra completo, silaba bo-la... e perde o sentido."</li>
                                                        <li>"Durante o recreio, isola-se sistematicamente ou reage com agressividade."</li>
                                                        <li>"Na cópia da lousa, tem um ritmo muito lento e omite vogais."</li>
                                                    </ul>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    <span className="text-emerald-900/80">Quais as principais conquistas? Inspire-se:</span>
                                                    <ul className="list-disc pl-5 space-y-1 mt-1 text-emerald-800/90 italic">
                                                        <li>"Auxilia de forma ativa os colegas nas atividades em grupo."</li>
                                                        <li>"Lê textos longos com fluência e ótima interpretação para a idade."</li>
                                                        <li>"Apresenta cadernos muito caprichados e foca nas explicações."</li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Textarea
                                        value={form.observacaoProfessor}
                                        onChange={(e) => setForm((f) => ({ ...f, observacaoProfessor: e.target.value.slice(0, 500) }))}
                                        placeholder={hasDefasagem
                                            ? "Ex: Apesar das dificuldades em [Área], o aluno consegue... O principal impacto na sala de aula tem sido..."
                                            : "Neste bimestre, o aluno se destacou em... A sua principal conquista foi..."}
                                        rows={6}
                                        className={form.observacaoProfessor.length > 0 && form.observacaoProfessor.length < 50 ? "border-orange-500 focus-visible:ring-orange-500" : ""}
                                    />

                                    <div className="flex justify-between text-xs">
                                        {form.observacaoProfessor.length > 0 && form.observacaoProfessor.length < 50 ? (
                                            <span className="text-orange-600 font-medium">⚠️ Escrito muito curto. Explique melhor.</span>
                                        ) : (
                                            <span className="text-muted-foreground">{form.observacaoProfessor.length >= 50 && "✓ Tamanho adequado"}</span>
                                        )}
                                        <span className="text-muted-foreground">{form.observacaoProfessor.length}/500</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-6 flex gap-4">
                            <Button variant="outline" onClick={() => setCurrentStep(hasDefasagem ? 3 : 1)} size="lg">Voltar</Button>
                            <Button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white" size="lg">
                                {hasDefasagem ? "Finalizar Anamnese e Enviar Alerta" : "Salvar Avaliação de Rotina"}
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
