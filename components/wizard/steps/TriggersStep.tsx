"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TRIGGERS } from "@/lib/data/zones";
import { SelectionGrid } from "../SelectionGrid";
import { CustomInput } from "../CustomInput";

interface TriggersStepProps {
  contextLabel: string;
  initialSelected: string[];
  onComplete: (triggers: string[]) => void;
}

export function TriggersStep({
  contextLabel,
  initialSelected,
  onComplete,
}: TriggersStepProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [customInput, setCustomInput] = useState("");

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((t) => t !== label)
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

  const customTriggers = selected.filter(
    (t) => !TRIGGERS.some((tr) => tr.label === t)
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Desencadenantes
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          ¿Cuándo aparece el dolor?
        </p>
      </div>

      <SelectionGrid
        options={TRIGGERS}
        selected={selected}
        onSelect={toggle}
        columns="2-3-4"
      />

      <CustomInput
        value={customInput}
        onChange={setCustomInput}
        onAdd={addCustom}
        placeholder="Otro desencadenante..."
      />

      {customTriggers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTriggers.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-200"
            >
              {t}
              <button
                type="button"
                onClick={() => toggle(t)}
                className="hover:text-foreground"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <Button
        onClick={() => onComplete(selected)}
        className="mx-auto h-14 w-full max-w-xs text-base font-semibold"
      >
        Añadir zona y revisar
      </Button>
    </div>
  );
}
