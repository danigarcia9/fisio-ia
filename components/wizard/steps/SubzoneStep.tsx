"use client";

import { useState } from "react";
import type { RegionDef } from "@/lib/data/zones";
import { SelectionGrid } from "../SelectionGrid";
import { CustomInput } from "../CustomInput";

interface SubzoneStepProps {
  region: RegionDef;
  side: "left" | "right" | null;
  onSelect: (label: string) => void;
}

export function SubzoneStep({ region, side, onSelect }: SubzoneStepProps) {
  const [customInput, setCustomInput] = useState("");

  const sideLabel =
    side === "left" ? " izquierdo" : side === "right" ? " derecho" : "";

  function addCustom() {
    const val = customInput.trim();
    if (val) {
      onSelect(val);
      setCustomInput("");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Zona específica
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {region.label}{sideLabel}
        </p>
      </div>

      <SelectionGrid
        options={region.subzones}
        onSelect={onSelect}
        columns="2-3"
      />

      <CustomInput
        value={customInput}
        onChange={setCustomInput}
        onAdd={addCustom}
        placeholder="Otra zona..."
      />
    </div>
  );
}
