"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type {
  JointStructure,
  Movement,
  ProvocationType,
  MechanicalCondition,
} from "@/lib/schemas/session";
import {
  MOVEMENTS_BY_JOINT,
  MOVEMENT_LABELS,
  PROVOCATION_LABELS,
  CONDITION_LABELS,
} from "@/lib/data/zones";
import type { FunctionalInput } from "../Wizard";

interface FunctionalStepProps {
  contextLabel: string;
  joint: JointStructure | undefined;
  onContinue: (inputs: FunctionalInput[]) => void;
  onSkip: () => void;
}

export function FunctionalStep({
  contextLabel,
  joint,
  onContinue,
  onSkip,
}: FunctionalStepProps) {
  const availableMovements = joint ? MOVEMENTS_BY_JOINT[joint] : [];
  const [inputs, setInputs] = useState<FunctionalInput[]>([]);
  const [movement, setMovement] = useState<Movement>(
    availableMovements[0] ?? "flexion"
  );
  const [provocation, setProvocation] =
    useState<ProvocationType>("active_contraction");
  const [condition, setCondition] =
    useState<MechanicalCondition>("unloaded");
  const [rom, setRom] = useState("");
  const [painStart, setPainStart] = useState("");

  function addInput() {
    if (!joint) return;
    setInputs((prev) => [
      ...prev,
      {
        jointStructure: joint,
        movement,
        provocationType: provocation,
        mechanicalCondition: condition,
        romRangeDegrees: rom ? parseInt(rom, 10) : undefined,
        painStartsAtDegrees: painStart ? parseInt(painStart, 10) : undefined,
      },
    ]);
    setRom("");
    setPainStart("");
  }

  function removeInput(index: number) {
    setInputs((prev) => prev.filter((_, i) => i !== index));
  }

  // No joint mapping — skip automatically
  if (!joint) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Valoración funcional
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">{contextLabel}</p>
        </div>
        <p className="text-muted-foreground text-sm">
          Esta región no tiene valoración funcional automática.
        </p>
        <Button
          onClick={onSkip}
          className="mx-auto h-14 w-full max-w-xs text-base font-semibold"
        >
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Valoración funcional
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{contextLabel}</p>
      </div>

      <p className="text-muted-foreground mx-auto max-w-md text-center text-sm">
        Opcional. Registra movimientos que reproducen dolor para afinar las
        hipótesis iniciales.
      </p>

      <Button
        variant="outline"
        onClick={onSkip}
        className="mx-auto h-12 w-full max-w-xs text-sm"
      >
        Saltar este paso
      </Button>

      <Separator />

      {/* Added inputs */}
      {inputs.length > 0 && (
        <div className="flex flex-col gap-2">
          {inputs.map((item, i) => (
            <div
              key={i}
              className="bg-muted/50 flex items-center justify-between rounded-xl border px-4 py-3"
            >
              <div className="min-w-0 text-sm">
                <p className="font-medium">
                  {MOVEMENT_LABELS[item.movement]} ·{" "}
                  {PROVOCATION_LABELS[item.provocationType]} ·{" "}
                  {CONDITION_LABELS[item.mechanicalCondition]}
                </p>
                <p className="text-muted-foreground text-xs">
                  ROM {item.romRangeDegrees ?? "—"}° · Dolor desde{" "}
                  {item.painStartsAtDegrees ?? "—"}°
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeInput(i)}
                className="text-muted-foreground hover:text-foreground ml-3 shrink-0 text-sm touch-manipulation"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Select
          value={movement}
          onValueChange={(v) => setMovement(v as Movement)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Movimiento" />
          </SelectTrigger>
          <SelectContent>
            {availableMovements.map((m) => (
              <SelectItem key={m} value={m} label={MOVEMENT_LABELS[m]}>
                {MOVEMENT_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={provocation}
          onValueChange={(v) => setProvocation(v as ProvocationType)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Provocación" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PROVOCATION_LABELS) as ProvocationType[]).map((k) => (
              <SelectItem key={k} value={k} label={PROVOCATION_LABELS[k]}>
                {PROVOCATION_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition}
          onValueChange={(v) => setCondition(v as MechanicalCondition)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Condición mecánica" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CONDITION_LABELS) as MechanicalCondition[]).map(
              (k) => (
                <SelectItem key={k} value={k} label={CONDITION_LABELS[k]}>
                  {CONDITION_LABELS[k]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <input
          type="number"
          min={0}
          max={180}
          value={rom}
          onChange={(e) => setRom(e.target.value)}
          placeholder="ROM (grados)"
          className="bg-card border-border h-12 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="number"
          min={0}
          max={180}
          value={painStart}
          onChange={(e) => setPainStart(e.target.value)}
          placeholder="Dolor desde (°)"
          className="bg-card border-border h-12 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          variant="outline"
          onClick={addInput}
          className="h-12 text-sm"
        >
          + Añadir movimiento
        </Button>
      </div>

      <Separator />

      <Button
        onClick={() => onContinue(inputs)}
        className="mx-auto h-14 w-full max-w-xs text-base font-semibold"
      >
        {inputs.length > 0
          ? `Continuar con ${inputs.length} movimiento${inputs.length > 1 ? "s" : ""}`
          : "Continuar sin valoración"}
      </Button>
    </div>
  );
}
