"use client";

import { cn } from "@/lib/utils";

interface SideStepProps {
  regionLabel: string;
  onSelect: (side: "left" | "right") => void;
}

const BTN =
  "touch-manipulation rounded-xl border-2 text-base font-semibold transition-all active:scale-[0.97] border-border bg-muted/50 text-foreground hover:border-teal-500/40 hover:bg-teal-500/5";

export function SideStep({ regionLabel, onSelect }: SideStepProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Lateralidad</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {regionLabel} — ¿qué lado?
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect("left")}
          className={cn(BTN, "h-20")}
        >
          Izquierdo
        </button>
        <button
          type="button"
          onClick={() => onSelect("right")}
          className={cn(BTN, "h-20")}
        >
          Derecho
        </button>
      </div>
    </div>
  );
}
