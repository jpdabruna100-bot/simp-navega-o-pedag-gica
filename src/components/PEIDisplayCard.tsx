/**
 * Card para exibir PEI registrado (visualização após elaboração pelo wizard)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Pencil, Printer } from "lucide-react";
import { formatBRDate } from "@/lib/utils";
import { AREAS_CURRICULARES } from "@/lib/pei-utils";
import type { Student } from "@/data/mockData";

interface PEIDisplayCardProps {
  studentName: string;
  pei: NonNullable<Student["pei"]>;
  /** Permite edição do PEI pelo professor */
  onEdit?: () => void;
}

export function PEIDisplayCard({ studentName, pei, onEdit }: PEIDisplayCardProps) {
  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = `PEI - ${studentName}`;
    window.print();
    document.title = prevTitle;
  };

  const temFormatoGuiado =
    (pei.capacidades && pei.capacidades.filter(Boolean).length > 0) ||
    (pei.oQueSabe && Object.values(pei.oQueSabe).some(Boolean)) ||
    (pei.necessidades && pei.necessidades.filter(Boolean).length > 0) ||
    (pei.objetivosAcademicos && Object.values(pei.objetivosAcademicos).some(Boolean)) ||
    (pei.recursos && pei.recursos.filter(Boolean).length > 0);

  const estrategiasTexto =
    typeof pei.estrategias === "string"
      ? pei.estrategias
      : Array.isArray(pei.estrategias)
        ? pei.estrategias.filter(Boolean).join(". ")
        : "—";

  return (
    <Card
      id="pei-print-content"
      className="border-emerald-200 bg-emerald-50/30 shadow-sm"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              PEI registrado
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Aluno: {studentName} · Registrado em {formatBRDate(pei.dataRegistro)} · Revisão:{" "}
              {formatBRDate(pei.dataRevisao)}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 print:hidden">
            {onEdit != null && (
              <Button variant="default" size="sm" onClick={onEdit} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Pencil className="h-4 w-4" />
                Editar PEI
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir PEI
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        {temFormatoGuiado ? (
          <>
            {pei.capacidades && pei.capacidades.filter(Boolean).length > 0 && (
              <section>
                <h4 className="font-semibold text-emerald-900 mb-1">Capacidades</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {pei.capacidades.filter(Boolean).join(". ")}
                </p>
              </section>
            )}

            {pei.oQueSabe && Object.values(pei.oQueSabe).some(Boolean) && (
              <section>
                <h4 className="font-semibold text-emerald-900 mb-1">O que sabe</h4>
                <div className="space-y-0.5 text-muted-foreground">
                  {AREAS_CURRICULARES.map(({ key, label }) =>
                    pei.oQueSabe?.[key] ? (
                      <p key={key}>
                        <span className="font-medium text-foreground">{label}:</span> {pei.oQueSabe[key]}
                      </p>
                    ) : null
                  )}
                </div>
              </section>
            )}

            {pei.necessidades && pei.necessidades.filter(Boolean).length > 0 && (
              <section>
                <h4 className="font-semibold text-emerald-900 mb-1">Necessidades</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {pei.necessidades.filter(Boolean).join("; ")}
                </p>
              </section>
            )}

            {pei.objetivosAcademicos && Object.values(pei.objetivosAcademicos).some(Boolean) ? (
              <section>
                <h4 className="font-semibold text-emerald-900 mb-1">Objetivos acadêmicos</h4>
                <div className="space-y-0.5 text-muted-foreground">
                  {Object.entries(pei.objetivosAcademicos)
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <p key={k}>
                        <span className="font-medium text-foreground">
                          {AREAS_CURRICULARES.find((a) => a.key === k)?.label ?? k}:
                        </span>{" "}
                        {v}
                      </p>
                    ))}
                </div>
              </section>
            ) : (
              pei.objetivos && (
                <section>
                  <h4 className="font-semibold text-emerald-900 mb-1">Objetivos</h4>
                  <p className="text-muted-foreground leading-relaxed">{pei.objetivos}</p>
                </section>
              )
            )}

            <section>
              <h4 className="font-semibold text-emerald-900 mb-1">Recursos e estratégias</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong className="text-foreground">Recursos:</strong>{" "}
                {pei.recursos && pei.recursos.filter(Boolean).length > 0
                  ? pei.recursos.filter(Boolean).join(", ")
                  : "—"}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Estratégias:</strong> {estrategiasTexto}
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-emerald-900 mb-1">Avaliação e revisão</h4>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Tipo:</strong>{" "}
                {"avaliacaoTipo" in pei && pei.avaliacaoTipo ? String(pei.avaliacaoTipo) : "—"}
              </p>
              <p className="text-muted-foreground mt-1">
                <strong className="text-foreground">Responsável:</strong> {pei.responsavel} ·{" "}
                <strong>Revisão:</strong> {formatBRDate(pei.dataRevisao)}
              </p>
              {"observacoes" in pei && pei.observacoes && (
                <p className="text-muted-foreground mt-1 italic">{String(pei.observacoes)}</p>
              )}
            </section>
          </>
        ) : (
          <>
            <section>
              <h4 className="font-semibold text-emerald-900 mb-1">Objetivos</h4>
              <p className="text-muted-foreground leading-relaxed">{pei.objetivos || "—"}</p>
            </section>
            <section>
              <h4 className="font-semibold text-emerald-900 mb-1">Estratégias</h4>
              <p className="text-muted-foreground leading-relaxed">{estrategiasTexto}</p>
            </section>
            <section>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Responsável:</strong> {pei.responsavel} ·{" "}
                <strong>Revisão:</strong> {formatBRDate(pei.dataRevisao)}
              </p>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
