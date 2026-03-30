"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SYMPTOMS } from "@/lib/data/zones";
import { SelectionGrid } from "../SelectionGrid";
import { CustomInput } from "../CustomInput";

interface SymptomsStepProps {
  contextLabel: string;
  initialSelected: string[];
  onContinue: (symptoms: string[]) => void;
}

export function SymptomsStep({
  contextLabel,
  initialSelected,
  onContinue,
}: SymptomsStepProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [customInput, setCustomInput] = useState("");

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : [...prev, label]
    );
  }

  function addCustom() {
    const val = customInput.trim();
    if (val && !selected.includes(val)) {
      setSelected((prev) => [...prev, val]);
      setCustomInput("");
    }
  }

  const customSymptoms = selected.filter(
    (s) => !SYMPTOMS.some((sym) => sym.label === s)
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Tipo de dolor
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{contextLabel}</p>
      </div>

      <SelectionGrid
        options={SYMPTOMS}
        selected={selected}
        onSelect={toggle}
        columns="2-3-4"
      />

      <CustomInput
        value={customInput}
        onChange={setCustomInput}
        onAdd={addCustom}
        placeholder="Otro síntoma..."
      />

      {customSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customSymptoms.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-200"
            >
              {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                className="hover:text-foreground"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <Button
        onClick={() => onContinue(selected)}
        disabled={selected.length === 0}
        className="mx-auto h-14 w-full max-w-xs text-base font-semibold"
      >
        {selected.length === 0
          ? "Selecciona al menos un síntoma"
          : `Continuar (${selected.length} seleccionado${selected.length > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
