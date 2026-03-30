"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type {
  SelectedZone,
  OccupationalLoad,
  ActivityVolume,
  JointStructure,
  Movement,
  ProvocationType,
  MechanicalCondition,
} from "@/lib/schemas/session";
import type { RegionDef } from "@/lib/data/zones";
import { JOINT_BY_REGION, MOVEMENTS_BY_JOINT } from "@/lib/data/zones";

import { ProfileStep } from "./steps/ProfileStep";
import { RegionStep } from "./steps/RegionStep";
import { SideStep } from "./steps/SideStep";
import { SubzoneStep } from "./steps/SubzoneStep";
import { FunctionalStep } from "./steps/FunctionalStep";
import { SymptomsStep } from "./steps/SymptomsStep";
import { TriggersStep } from "./steps/TriggersStep";
import { ReviewStep } from "./steps/ReviewStep";

// ─── Types ───

export type WizardStepId =
  | "profile"
  | "region"
  | "side"
  | "subzone"
  | "functional"
  | "symptoms"
  | "triggers"
  | "review";

export interface FunctionalInput {
  jointStructure: JointStructure;
  movement: Movement;
  provocationType: ProvocationType;
  mechanicalCondition: MechanicalCondition;
  romRangeDegrees?: number;
  painStartsAtDegrees?: number;
}

export interface WizardResult {
  selectedZones: SelectedZone[];
  occupationalLoad: OccupationalLoad;
  activityVolume: ActivityVolume;
  sportProfile?: { sportType: string; roleOrPosition?: string; details?: string };
  patientAge?: number;
}

interface ZoneInProgress {
  region: RegionDef | null;
  side: "left" | "right" | null;
  subzoneLabel: string | null;
  functionalInputs: FunctionalInput[];
  selectedSymptoms: string[];
  selectedTriggers: string[];
}

function emptyZone(): ZoneInProgress {
  return {
    region: null,
    side: null,
    subzoneLabel: null,
    functionalInputs: [],
    selectedSymptoms: [],
    selectedTriggers: [],
  };
}

// ─── Props ───

interface WizardProps {
  onStart: (result: WizardResult) => void;
}

// ─── Component ───

export function Wizard({ onStart }: WizardProps) {
  // Navigation
  const [step, setStep] = useState<WizardStepId>("profile");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);

  // Profile (persists across zones)
  const [occupationalLoad, setOccupationalLoad] =
    useState<OccupationalLoad>("sedentary");
  const [activityVolume, setActivityVolume] =
    useState<ActivityVolume>("none");
  const [sportProfile, setSportProfile] = useState<
    { sportType: string; roleOrPosition?: string; details?: string } | undefined
  >();
  const [patientAge, setPatientAge] = useState<number | undefined>();

  // Zones
  const [completedZones, setCompletedZones] = useState<SelectedZone[]>([]);
  const [zone, setZone] = useState<ZoneInProgress>(emptyZone());
  const [isAddingMore, setIsAddingMore] = useState(false);

  // ─── Navigation helpers ───

  const goTo = useCallback((next: WizardStepId, dir: "forward" | "back" = "forward") => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setStep(next);
  }, []);

  const goBack = useCallback(() => {
    switch (step) {
      case "region":
        if (isAddingMore) {
          goTo("review", "back");
        } else {
          goTo("profile", "back");
        }
        break;
      case "side":
        goTo("region", "back");
        break;
      case "subzone":
        if (zone.region?.bilateral) {
          goTo("side", "back");
        } else {
          goTo("region", "back");
        }
        break;
      case "functional":
        goTo("subzone", "back");
        break;
      case "symptoms":
        goTo("functional", "back");
        break;
      case "triggers":
        goTo("symptoms", "back");
        break;
    }
  }, [step, zone.region, isAddingMore, goTo]);

  // ─── Step handlers ───

  const handleProfileNext = useCallback(() => {
    goTo("region");
  }, [goTo]);

  const handleSelectRegion = useCallback(
    (region: RegionDef) => {
      setZone((z) => ({ ...z, region, side: null, subzoneLabel: null }));
      if (region.bilateral) {
        goTo("side");
      } else {
        goTo("subzone");
      }
    },
    [goTo]
  );

  const handleSelectSide = useCallback(
    (side: "left" | "right") => {
      setZone((z) => ({ ...z, side }));
      goTo("subzone");
    },
    [goTo]
  );

  const handleSelectSubzone = useCallback(
    (label: string) => {
      setZone((z) => ({ ...z, subzoneLabel: label }));
      goTo("functional");
    },
    [goTo]
  );

  const handleFunctionalContinue = useCallback(
    (inputs: FunctionalInput[]) => {
      setZone((z) => ({ ...z, functionalInputs: inputs }));
      goTo("symptoms");
    },
    [goTo]
  );

  const handleFunctionalSkip = useCallback(() => {
    setZone((z) => ({ ...z, functionalInputs: [] }));
    goTo("symptoms");
  }, [goTo]);

  const handleSymptomsContinue = useCallback(
    (symptoms: string[]) => {
      setZone((z) => ({ ...z, selectedSymptoms: symptoms }));
      goTo("triggers");
    },
    [goTo]
  );

  const handleTriggersComplete = useCallback(
    (triggers: string[]) => {
      // Build the completed zone
      const z = zone;
      if (!z.region || !z.subzoneLabel) return;

      const sideLabel =
        z.side === "left" ? " izq." : z.side === "right" ? " der." : "";
      const symptomText = z.selectedSymptoms.join(" | ");
      const label = `${z.region.label}${sideLabel} · ${z.subzoneLabel} · ${symptomText}`;

      const joint = JOINT_BY_REGION[z.region.id];
      const firstMovement = joint ? MOVEMENTS_BY_JOINT[joint][0] : undefined;

      const newZone: SelectedZone = {
        id: crypto.randomUUID(),
        region: z.region.label,
        side: z.side ?? undefined,
        subzone: z.subzoneLabel,
        symptom: symptomText,
        triggers,
        label,
        functionalInputs:
          z.functionalInputs.length > 0 && joint
            ? z.functionalInputs
            : joint && firstMovement
              ? [
                  {
                    jointStructure: joint,
                    movement: firstMovement,
                    provocationType: "active_contraction",
                    mechanicalCondition: "unloaded",
                  },
                ]
              : undefined,
      };

      setCompletedZones((prev) => [...prev, newZone]);
      setZone(emptyZone());
      goTo("review");
    },
    [zone, goTo]
  );

  const handleRemoveZone = useCallback((zoneId: string) => {
    setCompletedZones((prev) => prev.filter((z) => z.id !== zoneId));
  }, []);

  const handleAddAnotherZone = useCallback(() => {
    setIsAddingMore(true);
    setZone(emptyZone());
    goTo("region");
  }, [goTo]);

  const handleStartDiagnosis = useCallback(() => {
    onStart({
      selectedZones: completedZones,
      occupationalLoad,
      activityVolume,
      sportProfile,
      patientAge,
    });
  }, [completedZones, occupationalLoad, activityVolume, sportProfile, patientAge, onStart]);

  const handleReset = useCallback(() => {
    setStep("profile");
    setDirection("forward");
    setAnimKey(0);
    setOccupationalLoad("sedentary");
    setActivityVolume("none");
    setSportProfile(undefined);
    setPatientAge(undefined);
    setCompletedZones([]);
    setZone(emptyZone());
    setIsAddingMore(false);
  }, []);

  // ─── Zone context label ───
  const zoneContextLabel = zone.region
    ? `${zone.region.label}${zone.side === "left" ? " izq." : zone.side === "right" ? " der." : ""}${zone.subzoneLabel ? ` · ${zone.subzoneLabel}` : ""}`
    : "";

  // ─── Joint for current zone ───
  const currentJoint = zone.region ? JOINT_BY_REGION[zone.region.id] : undefined;

  // ─── Show back button? ───
  const showBack =
    step !== "profile" && step !== "review";

  // ─── Render current step ───
  function renderStep() {
    switch (step) {
      case "profile":
        return (
          <ProfileStep
            occupationalLoad={occupationalLoad}
            setOccupationalLoad={setOccupationalLoad}
            activityVolume={activityVolume}
            setActivityVolume={setActivityVolume}
            sportProfile={sportProfile}
            setSportProfile={setSportProfile}
            patientAge={patientAge}
            setPatientAge={setPatientAge}
            onNext={handleProfileNext}
          />
        );
      case "region":
        return (
          <RegionStep
            completedZones={completedZones}
            onSelect={handleSelectRegion}
          />
        );
      case "side":
        return (
          <SideStep
            regionLabel={zone.region?.label ?? ""}
            onSelect={handleSelectSide}
          />
        );
      case "subzone":
        return (
          <SubzoneStep
            region={zone.region!}
            side={zone.side}
            onSelect={handleSelectSubzone}
          />
        );
      case "functional":
        return (
          <FunctionalStep
            contextLabel={zoneContextLabel}
            joint={currentJoint}
            onContinue={handleFunctionalContinue}
            onSkip={handleFunctionalSkip}
          />
        );
      case "symptoms":
        return (
          <SymptomsStep
            contextLabel={zoneContextLabel}
            initialSelected={zone.selectedSymptoms}
            onContinue={handleSymptomsContinue}
          />
        );
      case "triggers":
        return (
          <TriggersStep
            contextLabel={zoneContextLabel}
            initialSelected={zone.selectedTriggers}
            onComplete={handleTriggersComplete}
          />
        );
      case "review":
        return (
          <ReviewStep
            zones={completedZones}
            occupationalLoad={occupationalLoad}
            activityVolume={activityVolume}
            sportProfile={sportProfile}
            patientAge={patientAge}
            onRemoveZone={handleRemoveZone}
            onAddZone={handleAddAnotherZone}
            onStart={handleStartDiagnosis}
          />
        );
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-5 py-6 md:max-w-3xl md:py-8 lg:max-w-5xl lg:py-10">
          {/* Back button */}
          {showBack && (
            <button
              type="button"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5 text-sm transition-colors touch-manipulation"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 4L6 8L10 12" />
              </svg>
              Atrás
            </button>
          )}

          {/* Animated step content */}
          <div
            key={animKey}
            className={cn(
              animKey > 0 &&
                (direction === "forward"
                  ? "animate-[zone-slide-right_200ms_ease-out]"
                  : "animate-[zone-slide-left_200ms_ease-out]")
            )}
          >
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
