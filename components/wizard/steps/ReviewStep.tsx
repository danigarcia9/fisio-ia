"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SelectedZone, OccupationalLoad, ActivityVolume } from "@/lib/schemas/session";
import {
  OCCUPATIONAL_LOAD_LABELS,
  ACTIVITY_VOLUME_LABELS,
} from "@/lib/data/zones";

interface ReviewStepProps {
  zones: SelectedZone[];
  occupationalLoad: OccupationalLoad;
  activityVolume: ActivityVolume;
  sportProfile?: { sportType: string; details?: string };
  patientAge?: number;
  onRemoveZone: (zoneId: string) => void;
  onAddZone: () => void;
  onStart: () => void;
}

export function ReviewStep({
  zones,
  occupationalLoad,
  activityVolume,
  sportProfile,
  patientAge,
  onRemoveZone,
  onAddZone,
  onStart,
}: ReviewStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Resumen de zonas
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {zones.length === 0
            ? "Ninguna zona configurada"
            : `${zones.length} zona${zones.length > 1 ? "s" : ""} configurada${zones.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Patient summary */}
      <div className="bg-muted/40 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {OCCUPATIONAL_LOAD_LABELS[occupationalLoad]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {ACTIVITY_VOLUME_LABELS[activityVolume]}
          </Badge>
          {sportProfile && (
            <Badge variant="secondary" className="text-xs">
              {sportProfile.sportType}
            </Badge>
          )}
          {patientAge && (
            <Badge variant="secondary" className="text-xs">
              {patientAge} años
            </Badge>
          )}
        </div>
      </div>

      {/* Zone cards */}
      <div className="flex flex-col gap-3">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-card border-border rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {zone.region}
                  {zone.side
                    ? ` ${zone.side === "left" ? "izq." : "der."}`
                    : ""}{" "}
                  · {zone.subzone}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {zone.symptom}
                </p>
                {zone.triggers.length > 0 && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {zone.triggers.join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveZone(zone.id)}
                className="text-muted-foreground hover:text-foreground shrink-0 text-sm touch-manipulation p-1"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <Button
          variant="outline"
          onClick={onAddZone}
          className="h-12 text-sm"
        >
          + Añadir otra zona
        </Button>

        <Button
          onClick={onStart}
          disabled={zones.length === 0}
          className="h-14 text-base font-semibold"
        >
          {zones.length === 0
            ? "Añade al menos una zona"
            : `Iniciar diagnóstico (${zones.length} zona${zones.length > 1 ? "s" : ""})`}
        </Button>
      </div>
    </div>
  );
}
