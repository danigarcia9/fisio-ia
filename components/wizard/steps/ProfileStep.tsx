"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { OccupationalLoad, ActivityVolume } from "@/lib/schemas/session";
import { occupationalLoadOptions, activityVolumeOptions } from "@/lib/schemas/session";
import {
  OCCUPATIONAL_LOAD_LABELS,
  OCCUPATIONAL_LOAD_SUBTITLES,
  ACTIVITY_VOLUME_LABELS,
  ACTIVITY_VOLUME_SUBTITLES,
  COMMON_SPORTS,
} from "@/lib/data/zones";

interface ProfileStepProps {
  occupationalLoad: OccupationalLoad;
  setOccupationalLoad: (v: OccupationalLoad) => void;
  activityVolume: ActivityVolume;
  setActivityVolume: (v: ActivityVolume) => void;
  sportProfile?: { sportType: string; roleOrPosition?: string; details?: string };
  setSportProfile: (v: { sportType: string; roleOrPosition?: string; details?: string } | undefined) => void;
  patientAge?: number;
  setPatientAge: (v: number | undefined) => void;
  onNext: () => void;
}

export function ProfileStep({
  occupationalLoad,
  setOccupationalLoad,
  activityVolume,
  setActivityVolume,
  sportProfile,
  setSportProfile,
  patientAge,
  setPatientAge,
  onNext,
}: ProfileStepProps) {
  const [sportInput, setSportInput] = useState("");
  const [sportDetails, setSportDetails] = useState(sportProfile?.details ?? "");
  const hasActivity = activityVolume !== "none";

  function toggleSport(sport: string) {
    if (sportProfile?.sportType === sport) {
      setSportProfile(undefined);
    } else {
      setSportProfile({
        sportType: sport,
        roleOrPosition: sportProfile?.roleOrPosition,
        details: sportProfile?.details,
      });
    }
    setSportInput("");
  }

  function addCustomSport() {
    const val = sportInput.trim();
    if (val) toggleSport(val);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Perfil del paciente
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Selecciona el perfil que mejor describa al paciente
        </p>
      </div>

      {/* Occupational load */}
      <section className="flex flex-col gap-4">
        <label className="text-sm font-semibold tracking-tight">
          Carga ocupacional
        </label>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {occupationalLoadOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setOccupationalLoad(option)}
              className={cn(
                "touch-manipulation rounded-xl border-2 p-5 text-left transition-all active:scale-[0.98]",
                occupationalLoad === option
                  ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15"
                  : "border-border hover:border-teal-500/40 hover:bg-teal-500/5"
              )}
            >
              <span className="block text-sm font-semibold">
                {OCCUPATIONAL_LOAD_LABELS[option]}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs">
                {OCCUPATIONAL_LOAD_SUBTITLES[option]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Activity volume */}
      <section className="flex flex-col gap-4">
        <label className="text-sm font-semibold tracking-tight">
          Actividad deportiva
        </label>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {activityVolumeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setActivityVolume(option);
                if (option === "none") setSportProfile(undefined);
              }}
              className={cn(
                "touch-manipulation rounded-xl border-2 p-5 text-left transition-all active:scale-[0.98]",
                activityVolume === option
                  ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15"
                  : "border-border hover:border-teal-500/40 hover:bg-teal-500/5"
              )}
            >
              <span className="block text-sm font-semibold">
                {ACTIVITY_VOLUME_LABELS[option]}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs">
                {ACTIVITY_VOLUME_SUBTITLES[option]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Sport (conditional) */}
      {hasActivity && (
        <section className="flex flex-col gap-4">
          <label className="text-sm font-semibold tracking-tight">
            Deporte
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COMMON_SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSport(s)}
                className={cn(
                  "touch-manipulation rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97]",
                  sportProfile?.sportType === s
                    ? "border border-teal-500/50 bg-teal-500/20 text-teal-700 dark:text-teal-200"
                    : "border border-transparent bg-muted text-muted-foreground hover:bg-teal-500/10 hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
            {sportProfile &&
              !COMMON_SPORTS.includes(sportProfile.sportType) && (
                <button
                  type="button"
                  onClick={() => toggleSport(sportProfile.sportType)}
                  className="touch-manipulation rounded-full border border-teal-500/50 bg-teal-500/20 px-4 py-2.5 text-sm font-medium text-teal-700 transition-all active:scale-[0.97] dark:text-teal-200"
                >
                  {sportProfile.sportType} ✕
                </button>
              )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={sportInput}
              onChange={(e) => setSportInput(e.target.value)}
              placeholder="Otro deporte..."
              className="bg-card border-border h-12 flex-1 rounded-xl border px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && sportInput.trim()) addCustomSport();
              }}
            />
            <Button
              variant="outline"
              onClick={addCustomSport}
              disabled={!sportInput.trim()}
              className="h-12 shrink-0 px-4"
            >
              +
            </Button>
          </div>
          <input
            type="text"
            value={sportDetails}
            onChange={(e) => {
              const val = e.target.value;
              setSportDetails(val);
              if (sportProfile) {
                setSportProfile({ ...sportProfile, details: val || undefined });
              }
            }}
            placeholder="Rol/posición, detalles (ej: portero, pista dura, 40km/sem)"
            className="bg-card border-border h-12 rounded-xl border px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>
      )}

      {/* Age */}
      <section className="flex flex-col gap-4">
        <label className="text-sm font-semibold tracking-tight">
          Edad{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <input
          type="number"
          min={0}
          max={120}
          placeholder="—"
          value={patientAge ?? ""}
          onChange={(e) =>
            setPatientAge(e.target.value ? parseInt(e.target.value) : undefined)
          }
          className="bg-card border-border h-12 w-32 rounded-xl border px-4 text-base tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </section>

      {/* Next */}
      <Button
        onClick={onNext}
        className="mx-auto h-14 w-full max-w-xs text-base font-semibold"
      >
        Siguiente
      </Button>
    </div>
  );
}
