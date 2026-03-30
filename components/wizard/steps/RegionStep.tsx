"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { REGIONS, type RegionDef } from "@/lib/data/zones";
import { CustomInput } from "../CustomInput";
import type { SelectedZone } from "@/lib/schemas/session";

interface RegionStepProps {
  completedZones: SelectedZone[];
  onSelect: (region: RegionDef) => void;
}

export function RegionStep({ completedZones, onSelect }: RegionStepProps) {
  const [customInput, setCustomInput] = useState("");

  function hasSelection(region: RegionDef): boolean {
    return completedZones.some((z) => z.region === region.label);
  }

  function selectCustomRegion() {
    const val = customInput.trim();
    if (!val) return;
    const custom: RegionDef = {
      id: `custom_${val}`,
      label: val,
      bilateral: false,
      subzones: [{ id: "custom", label: "Zona no especificada" }],
    };
    onSelect(custom);
    setCustomInput("");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Región anatómica
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Toca la zona donde el paciente refiere molestias
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => onSelect(region)}
            className={cn(
              "h-13 rounded-xl border text-sm font-medium transition-all active:scale-[0.97] touch-manipulation",
              hasSelection(region)
                ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200"
                : "border-border bg-muted/50 text-foreground hover:border-teal-500/40 hover:bg-teal-500/5"
            )}
          >
            {region.label}
            {region.bilateral && (
              <span className="text-muted-foreground ml-1.5 text-[10px]">
                izq/der
              </span>
            )}
          </button>
        ))}
      </div>

      <CustomInput
        value={customInput}
        onChange={setCustomInput}
        onAdd={selectCustomRegion}
        placeholder="Otra región..."
      />
    </div>
  );
}
