"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  techniques,
  techniqueLabels,
  equipmentItems,
  equipmentLabels,
  type Technique,
  type Equipment,
} from "@/lib/schemas/profile";

type Step = 1 | 2 | 3;

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");

  // Step 2
  const [clinicName, setClinicName] = useState("");
  const [selectedTechniques, setSelectedTechniques] = useState<Technique[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

  function toggleTechnique(t: Technique) {
    setSelectedTechniques((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleEquipment(e: Equipment) {
    setSelectedEquipment((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  }

  async function handleFinish() {
    setSaveError(null);
    setSaving(true);
    const contextId = uuidv4();
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contexts: [
            {
              id: contextId,
              name: clinicName || "Mi clínica",
              techniques: selectedTechniques,
              equipment: selectedEquipment,
            },
          ],
          activeContextId: contextId,
        }),
      });
      if (!res.ok) {
        const errorBody = (await res.json().catch(() => null)) as
          | { error?: string; details?: string }
          | null;

        throw new Error(
          errorBody?.details ?? errorBody?.error ?? "No se pudo guardar el perfil"
        );
      }
      router.push("/session");
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el perfil. Revisa Supabase y vuelve a intentar."
      );
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {step === 1 && "Bienvenido a FisioIA"}
            {step === 2 && "Configura tu clínica"}
            {step === 3 && "Todo listo"}
          </CardTitle>
          {/* Step indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Tu nombre</Label>
                <Input
                  id="name"
                  placeholder="Ej: Marco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="h-11 w-full"
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Clinic context */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="clinic">Nombre de la clínica</Label>
                <Input
                  id="clinic"
                  placeholder="Ej: Clínica Centro"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">
                  Técnicas disponibles
                </Label>
                <div className="flex flex-col gap-2">
                  {techniques.map((t) => (
                    <label
                      key={t}
                      className="bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedTechniques.includes(t)}
                        onCheckedChange={() => toggleTechnique(t)}
                      />
                      <span className="text-sm">{techniqueLabels[t]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">
                  Equipamiento disponible
                </Label>
                <div className="flex flex-col gap-2">
                  {equipmentItems.map((e) => (
                    <label
                      key={e}
                      className="bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedEquipment.includes(e)}
                        onCheckedChange={() => toggleEquipment(e)}
                      />
                      <span className="text-sm">{equipmentLabels[e]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-11"
                >
                  Atrás
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedTechniques.length === 0}
                  className="h-11 flex-1"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex flex-col gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Profesional:</span>{" "}
                    <span className="font-medium">{name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Clínica:</span>{" "}
                    <span className="font-medium">
                      {clinicName || "Mi clínica"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Técnicas:</span>{" "}
                    {selectedTechniques
                      .map((t) => techniqueLabels[t])
                      .join(", ")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Equipamiento:</span>{" "}
                    {selectedEquipment.length > 0
                      ? selectedEquipment
                          .map((e) => equipmentLabels[e])
                          .join(", ")
                      : "Ninguno seleccionado"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-11"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={saving}
                  className="h-11 flex-1"
                >
                  {saving ? "Guardando..." : "Empezar a usar FisioIA"}
                </Button>
              </div>

              {saveError && (
                <p className="text-destructive text-xs">{saveError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
