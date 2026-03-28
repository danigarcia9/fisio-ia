"use client";

import { useState, Fragment } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SelectedZone } from "@/lib/schemas/session";

// ─── Data types ───

type SubzoneDef = { id: string; label: string };
type RegionDef = {
  id: string;
  label: string;
  bilateral: boolean;
  subzones: SubzoneDef[];
};

// ─── Regions ───

const REGIONS: RegionDef[] = [
  {
    id: "neck",
    label: "Cuello / Cervicales",
    bilateral: false,
    subzones: [
      { id: "anterior", label: "Anterior" },
      { id: "lateral_izq", label: "Lateral izquierda" },
      { id: "lateral_der", label: "Lateral derecha" },
      { id: "posterior", label: "Posterior" },
      { id: "cervical_alta", label: "Cervical alta (C1-C2)" },
      { id: "cervical_media", label: "Cervical media (C3-C5)" },
      { id: "cervical_baja", label: "Cervical baja (C6-C7)" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "shoulder",
    label: "Hombro",
    bilateral: true,
    subzones: [
      { id: "anterior", label: "Cara anterior" },
      { id: "lateral", label: "Cara lateral" },
      { id: "posterior", label: "Cara posterior" },
      { id: "superior", label: "Superior (manguito)" },
      { id: "deltoides", label: "Deltoides" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "elbow",
    label: "Codo",
    bilateral: true,
    subzones: [
      { id: "lateral", label: "Cara lateral (epicóndilo)" },
      { id: "medial", label: "Cara medial (epitróclea)" },
      { id: "posterior", label: "Posterior (olécranon)" },
      { id: "anterior", label: "Fosa cubital (anterior)" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "wrist_hand",
    label: "Muñeca / Mano",
    bilateral: true,
    subzones: [
      { id: "dorsal", label: "Cara dorsal muñeca" },
      { id: "palmar", label: "Cara palmar muñeca" },
      { id: "radial", label: "Lateral (radio/tabaquera)" },
      { id: "cubital", label: "Medial (cúbito)" },
      { id: "dedos", label: "Dedos" },
      { id: "palma", label: "Palma" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "upper_back",
    label: "Dorsal alta",
    bilateral: false,
    subzones: [
      { id: "central", label: "Central" },
      { id: "lateral_izq", label: "Lateral izquierda" },
      { id: "lateral_der", label: "Lateral derecha" },
      { id: "interescapular", label: "Interescapular" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "mid_back",
    label: "Dorsal media",
    bilateral: false,
    subzones: [
      { id: "central", label: "Central" },
      { id: "lateral_izq", label: "Lateral izquierda" },
      { id: "lateral_der", label: "Lateral derecha" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "lumbar",
    label: "Lumbar",
    bilateral: false,
    subzones: [
      { id: "bilateral", label: "Banda lumbar bilateral" },
      { id: "izquierda", label: "Lumbar izquierda" },
      { id: "derecha", label: "Lumbar derecha" },
      { id: "lumbosacra", label: "Lumbosacra" },
      { id: "gluteo", label: "Irradiación a glúteo" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "sacro",
    label: "Sacro / Cóccix",
    bilateral: false,
    subzones: [
      { id: "sacro", label: "Sacro central" },
      { id: "coccix", label: "Cóccix" },
      { id: "sacroiliaca_izq", label: "Sacroilíaca izquierda" },
      { id: "sacroiliaca_der", label: "Sacroilíaca derecha" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "hip",
    label: "Cadera / Ingle",
    bilateral: true,
    subzones: [
      { id: "ingle", label: "Ingle" },
      { id: "anterior", label: "Cara anterior" },
      { id: "lateral", label: "Cara lateral (trocánter)" },
      { id: "posterior", label: "Cara posterior (glúteo)" },
      { id: "aductor", label: "Aductor" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "knee",
    label: "Rodilla",
    bilateral: true,
    subzones: [
      { id: "anterior", label: "Cara anterior" },
      { id: "medial", label: "Cara medial" },
      { id: "lateral", label: "Cara lateral" },
      { id: "posterior", label: "Cara posterior" },
      { id: "poplitea", label: "Poplítea" },
      { id: "rotula", label: "Rótula" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "leg",
    label: "Pierna / Tibia",
    bilateral: true,
    subzones: [
      { id: "anterior", label: "Cara anterior (espinilla)" },
      { id: "posterior", label: "Cara posterior (gemelos)" },
      { id: "lateral", label: "Cara lateral (peroneo)" },
      { id: "medial", label: "Cara medial" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "ankle",
    label: "Tobillo",
    bilateral: true,
    subzones: [
      { id: "lateral", label: "Cara lateral (peroneo)" },
      { id: "medial", label: "Cara medial (tibial)" },
      { id: "anterior", label: "Anterior" },
      { id: "posterior", label: "Posterior (Aquiles)" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "foot",
    label: "Pie",
    bilateral: true,
    subzones: [
      { id: "planta", label: "Planta (fascia plantar)" },
      { id: "dorso", label: "Dorso" },
      { id: "talon", label: "Talón" },
      { id: "metatarso", label: "Metatarso" },
      { id: "dedos", label: "Dedos" },
      { id: "arco_int", label: "Arco interno" },
      { id: "arco_ext", label: "Arco externo" },
      { id: "global", label: "Global" },
    ],
  },
  {
    id: "diffuse",
    label: "Zona difusa / Varios",
    bilateral: false,
    subzones: [
      { id: "generalizado", label: "Generalizado" },
      { id: "multiarticular", label: "Multiarticular" },
      { id: "migratorio", label: "Migratorio" },
    ],
  },
];

// ─── Symptoms & Triggers ───

const SYMPTOMS = [
  { id: "sharp", label: "Dolor punzante / agudo" },
  { id: "deep", label: "Dolor sordo / profundo" },
  { id: "burning", label: "Quemazón / hormigueo" },
  { id: "stiffness", label: "Rigidez / limitación de movimiento" },
  { id: "clicking", label: "Chasquido / crepitación" },
  { id: "mixed", label: "Varios síntomas / no claro" },
];

const TRIGGERS = [
  { id: "rest", label: "En reposo" },
  { id: "waking", label: "Al despertar / mañana" },
  { id: "night", label: "Dolor nocturno" },
  { id: "during_sport", label: "Durante actividad deportiva" },
  { id: "after_sport", label: "Tras actividad deportiva" },
  { id: "lifting", label: "Al levantar / elevar" },
  { id: "weight", label: "Al cargar peso" },
  { id: "walking_running", label: "Al caminar / correr" },
  { id: "stairs", label: "Al subir/bajar escaleras" },
  { id: "sitting", label: "Sentado prolongado" },
  { id: "standing", label: "De pie prolongado" },
  { id: "specific_movement", label: "Movimiento específico" },
  { id: "cold_weather", label: "Con frío / cambios temperatura" },
  { id: "constant", label: "Constante" },
  { id: "intermittent", label: "Intermitente sin patrón" },
];

// ─── Selector state ───

type SelectorState =
  | { step: "region" }
  | { step: "side"; region: RegionDef }
  | { step: "subzone"; region: RegionDef; side?: "left" | "right" }
  | {
      step: "symptom";
      region: RegionDef;
      side?: "left" | "right";
      subzoneLabel: string;
    }
  | {
      step: "triggers";
      region: RegionDef;
      side?: "left" | "right";
      subzoneLabel: string;
      symptomLabel: string;
    };

const STEP_LABELS: Record<SelectorState["step"], string> = {
  region: "Región",
  side: "Lateralidad",
  subzone: "Zona",
  symptom: "Síntoma",
  triggers: "Desencadenantes",
};

function getStepNumber(step: SelectorState["step"]): number {
  switch (step) {
    case "region":
    case "side":
      return 1;
    case "subzone":
      return 2;
    case "symptom":
      return 3;
    case "triggers":
      return 4;
  }
}

// ─── Button style helpers ───

const BTN_BASE =
  "h-11 rounded-lg border text-sm font-medium transition-all active:scale-[0.97] touch-manipulation";
const BTN_DEFAULT =
  "bg-muted/50 border-border text-foreground hover:bg-teal-500/15 hover:border-teal-500/40";
const BTN_ACTIVE = "bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-200";

// ─── Component ───

interface ZoneSelectorProps {
  selectedZones: SelectedZone[];
  onZoneAdded: (zone: SelectedZone) => void;
  onZoneRemoved: (zoneId: string) => void;
  disabled?: boolean;
}

export function ZoneSelector({
  selectedZones,
  onZoneAdded,
  onZoneRemoved,
  disabled = false,
}: ZoneSelectorProps) {
  const [state, setState] = useState<SelectorState>({ step: "region" });
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const currentStep = getStepNumber(state.step);

  // ─── Navigation ───

  function advance(next: SelectorState) {
    setDirection("forward");
    setAnimKey((k) => k + 1);
    setCustomInput("");
    setState(next);
  }

  function retreat() {
    setDirection("back");
    setAnimKey((k) => k + 1);
    setCustomInput("");

    switch (state.step) {
      case "side":
        setState({ step: "region" });
        break;
      case "subzone":
        if (state.side) {
          setState({ step: "side", region: state.region });
        } else {
          setState({ step: "region" });
        }
        break;
      case "symptom":
        setState({ step: "subzone", region: state.region, side: state.side });
        break;
      case "triggers":
        setState({
          step: "symptom",
          region: state.region,
          side: state.side,
          subzoneLabel: state.subzoneLabel,
        });
        setSelectedTriggers([]);
        break;
    }
  }

  // ─── Step handlers ───

  function selectRegion(region: RegionDef) {
    if (region.bilateral) {
      advance({ step: "side", region });
    } else {
      advance({ step: "subzone", region });
    }
  }

  function selectCustomRegion(label: string) {
    const custom: RegionDef = {
      id: `custom_${label}`,
      label,
      bilateral: false,
      subzones: [{ id: "custom", label: "Zona no especificada" }],
    };
    advance({ step: "subzone", region: custom });
  }

  function selectSide(side: "left" | "right") {
    if (state.step !== "side") return;
    advance({ step: "subzone", region: state.region, side });
  }

  function selectSubzone(subzoneLabel: string) {
    if (state.step !== "subzone") return;
    advance({
      step: "symptom",
      region: state.region,
      side: state.side,
      subzoneLabel,
    });
  }

  function selectSymptom(symptomLabel: string) {
    if (state.step !== "symptom") return;
    advance({
      step: "triggers",
      region: state.region,
      side: state.side,
      subzoneLabel: state.subzoneLabel,
      symptomLabel,
    });
  }

  function toggleTrigger(trigger: string) {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  }

  function addCustomTrigger() {
    const val = customInput.trim();
    if (val && !selectedTriggers.includes(val)) {
      setSelectedTriggers((prev) => [...prev, val]);
      setCustomInput("");
    }
  }

  function completeZone() {
    if (state.step !== "triggers") return;
    const sideLabel =
      state.side === "left" ? " izq." : state.side === "right" ? " der." : "";
    const label = `${state.region.label}${sideLabel} · ${state.subzoneLabel} · ${state.symptomLabel}`;

    const zone: SelectedZone = {
      id: crypto.randomUUID(),
      region: state.region.label,
      side: state.side,
      subzone: state.subzoneLabel,
      symptom: state.symptomLabel,
      triggers: selectedTriggers,
      label,
    };

    onZoneAdded(zone);
    setSelectedTriggers([]);
    setCustomInput("");
    setDirection("forward");
    setAnimKey((k) => k + 1);
    setState({ step: "region" });
  }

  function handleCustomSubmit(callback: (value: string) => void) {
    const val = customInput.trim();
    if (val) {
      callback(val);
      setCustomInput("");
    }
  }

  function regionHasSelection(region: RegionDef): boolean {
    return selectedZones.some((z) => z.region === region.label);
  }

  // ─── Render: option grid (single-select steps) ───

  function renderOptionGrid(
    options: { id: string; label: string }[],
    onSelect: (label: string) => void,
    customPlaceholder: string
  ) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.label)}
              className={cn(BTN_BASE, BTN_DEFAULT)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={customPlaceholder}
            className="bg-card border-border h-10 flex-1 rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCustomSubmit(onSelect);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCustomSubmit(onSelect)}
            disabled={!customInput.trim()}
            className="h-10 shrink-0 px-3"
          >
            +
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render: regions ───

  function renderRegions() {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => selectRegion(region)}
              className={cn(
                BTN_BASE,
                regionHasSelection(region) ? BTN_ACTIVE : BTN_DEFAULT
              )}
            >
              {region.label}
              {region.bilateral && (
                <span className="text-muted-foreground ml-1 text-[10px]">
                  izq/der
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Otra región..."
            className="bg-card border-border h-10 flex-1 rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCustomSubmit(selectCustomRegion);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCustomSubmit(selectCustomRegion)}
            disabled={!customInput.trim()}
            className="h-10 shrink-0 px-3"
          >
            +
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render: side selector ───

  function renderSides() {
    if (state.step !== "side") return null;
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-muted-foreground text-sm">
          {state.region.label} — ¿qué lado?
        </p>
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => selectSide("left")}
            className={cn(BTN_BASE, "h-14 font-semibold", BTN_DEFAULT)}
          >
            Izquierdo
          </button>
          <button
            type="button"
            onClick={() => selectSide("right")}
            className={cn(BTN_BASE, "h-14 font-semibold", BTN_DEFAULT)}
          >
            Derecho
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: subzones ───

  function renderSubzones() {
    if (state.step !== "subzone") return null;
    return renderOptionGrid(
      state.region.subzones,
      selectSubzone,
      "Otra zona..."
    );
  }

  // ─── Render: symptoms ───

  function renderSymptoms() {
    return renderOptionGrid(SYMPTOMS, selectSymptom, "Otro síntoma...");
  }

  // ─── Render: triggers (multi-select) ───

  function renderTriggers() {
    const customTriggers = selectedTriggers.filter(
      (t) => !TRIGGERS.some((tr) => tr.label === t)
    );

    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-center text-xs">
          ¿Cuándo aparece? Selecciona todas las que apliquen.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TRIGGERS.map((trigger) => (
            <button
              key={trigger.id}
              type="button"
              onClick={() => toggleTrigger(trigger.label)}
              className={cn(
                BTN_BASE,
                selectedTriggers.includes(trigger.label)
                  ? BTN_ACTIVE
                  : "bg-muted/50 border-border text-foreground hover:bg-muted"
              )}
            >
              {trigger.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Otro desencadenante..."
            className="bg-card border-border h-10 flex-1 rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") addCustomTrigger();
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomTrigger}
            disabled={!customInput.trim()}
            className="h-10 shrink-0 px-3"
          >
            +
          </Button>
        </div>
        {customTriggers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {customTriggers.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-200"
              >
                {t}
                <button
                  type="button"
                  onClick={() => toggleTrigger(t)}
                  className="hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <Button onClick={completeZone} className="mt-1 h-11 w-full">
          Añadir zona
        </Button>
      </div>
    );
  }

  // ─── Step dispatcher ───

  function renderStep() {
    switch (state.step) {
      case "region":
        return renderRegions();
      case "side":
        return renderSides();
      case "subzone":
        return renderSubzones();
      case "symptom":
        return renderSymptoms();
      case "triggers":
        return renderTriggers();
    }
  }

  // ─── Main render ───

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {/* Header: back + step indicator */}
      <div className="flex items-center">
        {state.step !== "region" ? (
          <button
            type="button"
            onClick={retreat}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Atrás
          </button>
        ) : (
          <div className="w-12" />
        )}
        <div className="flex-1 text-center">
          <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
            {[1, 2, 3, 4].map((n, i) => (
              <Fragment key={n}>
                {i > 0 && <span className="opacity-40">·</span>}
                <span
                  className={cn(
                    "transition-colors",
                    n === currentStep && "text-primary font-semibold",
                    n < currentStep && "text-primary/60"
                  )}
                >
                  {n}
                </span>
              </Fragment>
            ))}
          </div>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {STEP_LABELS[state.step]}
          </p>
        </div>
        <div className="w-12" />
      </div>

      {/* Animated step content */}
      <div className="overflow-hidden">
        <div
          key={animKey}
          style={
            animKey > 0
              ? {
                  animation: `${direction === "forward" ? "zone-slide-right" : "zone-slide-left"} 200ms ease-out`,
                }
              : undefined
          }
        >
          {renderStep()}
        </div>
      </div>

      {/* Selected zone chips */}
      {selectedZones.length > 0 && (
        <div className="border-border/50 flex flex-col gap-1.5 border-t pt-3">
          {selectedZones.map((zone) => (
            <div
              key={zone.id}
              className="bg-primary/10 flex items-start gap-2 rounded-lg px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-primary text-sm font-medium">{zone.label}</p>
                {zone.triggers.length > 0 && (
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    {zone.triggers.join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onZoneRemoved(zone.id)}
                disabled={disabled}
                className="text-muted-foreground hover:text-foreground shrink-0 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
