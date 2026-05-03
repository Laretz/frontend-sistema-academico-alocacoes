"use client";

import React from "react";
import { cn } from "@/lib/utils";

type LegendItem = {
  colorClass: string;
  label: string;
};

interface GradeLegendProps {
  className?: string;
  items?: LegendItem[];
}

export function GradeLegend({ className, items }: GradeLegendProps) {
  const defaultItems: LegendItem[] =
    items ?? [
      { colorClass: "bg-primary/5 border border-primary/20", label: "Dentro do turno" },
      { colorClass: "bg-warning/10 border border-warning/20", label: "Fora do turno (manhã/tarde)" },
      { colorClass: "bg-destructive/5 border border-destructive/20", label: "Fora do turno (noturno)" },
      { colorClass: "bg-muted/30 border border-border", label: "Livre" },
    ];

  return (
    <div className={cn("mt-3 flex flex-wrap items-center gap-3", className)}>
      {defaultItems.map((it, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-sm", it.colorClass)} />
          <span className="text-xs text-muted-foreground">{it.label}</span>
        </div>
      ))}
    </div>
  );
}