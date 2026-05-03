"use client";

import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { Fragment } from "react";
import type { Alocacao, GradeHorario } from "@/types/entities";

export function GradeGrid({
  grade,
  loading,
  gridConfig,
}: {
  grade: GradeHorario | null;
  loading: boolean;
  gridConfig: { dias: Array<{ key: string; label: string }>; codigos: string[] } | null;
}) {
  const diasSemana = gridConfig?.dias || [];
  const codigosHorario = gridConfig?.codigos || [];

  if (!diasSemana.length || !codigosHorario.length) {
    return (
      <div className="py-10 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Carregando configuração da grade...
        </div>
      </div>
    );
  }

  const codigosManha = codigosHorario.filter((c) => c.startsWith("M"));
  const codigosTarde = codigosHorario.filter((c) => c.startsWith("T"));
  const codigosNoite = codigosHorario.filter((c) => c.startsWith("N"));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="space-y-6">
          <GradeBlock
            codigos={codigosManha}
            diasSemana={diasSemana}
            grade={grade}
            loading={loading}
          />
          <GradeBlock
            codigos={codigosTarde}
            diasSemana={diasSemana}
            grade={grade}
            loading={loading}
          />
          <GradeBlock
            codigos={codigosNoite}
            diasSemana={diasSemana}
            grade={grade}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

function GradeBlock({
  codigos,
  diasSemana,
  grade,
  loading,
}: {
  codigos: string[];
  diasSemana: Array<{ key: string; label: string }>;
  grade: GradeHorario | null;
  loading: boolean;
}) {
  const columns = `120px repeat(${Math.max(codigos.length, 1)}, minmax(0, 1fr))`;

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: columns }}>
      <div />
      {codigos.map((c) => (
        <div
          key={c}
          className="text-xs font-medium text-center py-2 bg-muted rounded"
        >
          {c}
        </div>
      ))}

      {diasSemana.map((d) => (
        <Fragment key={d.key}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4" /> {d.label}
          </div>
          {codigos.map((c) => (
            <div
              key={`${d.key}-${c}`}
              className="border rounded p-2 min-h-[72px] min-w-0 overflow-hidden"
            >
              {loading ? (
                <div className="text-xs text-muted-foreground">Carregando...</div>
              ) : (
                <CellContent grade={grade} diaKey={d.key} codigo={c} />
              )}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

function CellContent({
  grade,
  diaKey,
  codigo,
}: {
  grade: GradeHorario | null;
  diaKey: string;
  codigo: string;
}) {
  const lista: Alocacao[] = grade?.[diaKey]?.[codigo] || [];
  if (!lista.length) {
    return <div className="text-xs text-muted-foreground">Livre</div>;
  }

  const a = lista[0];
  const extra = lista.length > 1 ? ` (+${lista.length - 1})` : "";

  return (
    <div className="space-y-1 min-w-0">
      {a.disciplina && (
        <div className="text-xs font-medium truncate min-w-0">
          {a.disciplina.nome}
          {extra}
        </div>
      )}
      <div className="flex gap-1 flex-wrap min-w-0">
        {a.user && (
          <Badge variant="secondary" className="text-[10px] max-w-full truncate">
            {typeof a.user === "object" ? a.user.nome : "Professor"}
          </Badge>
        )}
        {a.turma && (
          <Badge variant="outline" className="text-[10px] max-w-full truncate">
            {a.turma.nome}
          </Badge>
        )}
        {a.sala && (
          <Badge variant="outline" className="text-[10px] max-w-full truncate">
            {a.sala.nome}
          </Badge>
        )}
      </div>
    </div>
  );
}

