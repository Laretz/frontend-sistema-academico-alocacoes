"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Predio } from "@/types/entities";

export function SalasFilters({
  searchTerm,
  onSearchTermChange,
  selectedPredio,
  onSelectedPredioChange,
  predios,
}: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedPredio: string;
  onSelectedPredioChange: (value: string) => void;
  predios: Predio[];
}) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar salas..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="w-48">
        <Select value={selectedPredio} onValueChange={onSelectedPredioChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por prédio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os prédios</SelectItem>
            {predios.map((predio) => (
              <SelectItem key={predio.id} value={predio.nome}>
                {predio.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

