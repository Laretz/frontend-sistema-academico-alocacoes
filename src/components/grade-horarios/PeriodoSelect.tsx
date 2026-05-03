import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PeriodoSelect({
  periodoAtivoNome,
  periodos,
  value,
  onChange,
}: {
  periodoAtivoNome: string;
  periodos: Array<{ id: string; nome: string; status: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const PERIODO_OPERACIONAL = "__OPERACIONAL__";

  return (
    <div className="flex items-center gap-2 justify-between sm:justify-end">
      <div className="text-xs text-muted-foreground hidden sm:block">
        Ativo:{" "}
        <span className="font-medium text-foreground">
          {periodoAtivoNome || "—"}
        </span>
      </div>

      <Select value={value || PERIODO_OPERACIONAL} onValueChange={onChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PERIODO_OPERACIONAL}>Período ativo</SelectItem>
          {periodos.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nome} ({p.status})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

