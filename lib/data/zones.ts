import type {
  JointStructure,
  Movement,
  ProvocationType,
  MechanicalCondition,
  OccupationalLoad,
  ActivityVolume,
} from "@/lib/schemas/session";

// ─── Types ───

export type SubzoneDef = { id: string; label: string };
export type RegionDef = {
  id: string;
  label: string;
  bilateral: boolean;
  subzones: SubzoneDef[];
};

// ─── Regions ───

export const REGIONS: RegionDef[] = [
  {
    id: "neck",
    label: "Cuello / Cervicales",
    bilateral: false,
    subzones: [
      { id: "anterior", label: "Anterior" },
      { id: "lateral_izq", label: "Lateral izquierda" },
      { id: "lateral_der", label: "Lateral derecha" },
      { id: "posterior", label: "Posterior" },
      { id: "cervical_alta", label: "Cervical alta (C1-C3)" },
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

export const SYMPTOMS = [
  { id: "sharp", label: "Dolor punzante / agudo" },
  { id: "deep", label: "Dolor profundo / difuso" },
  { id: "burning", label: "Quemazón" },
  { id: "tingling", label: "Hormigueo / adormecimiento" },
  { id: "movement_limitation", label: "Limitación de movimiento" },
  { id: "strength_loss", label: "Pérdida de fuerza" },
  { id: "clicking", label: "Chasquido / crepitación" },
  { id: "mixed", label: "Varios síntomas / no claro" },
];

export const TRIGGERS = [
  { id: "rest", label: "En reposo" },
  { id: "waking", label: "Al despertar / mañana" },
  { id: "night", label: "Dolor nocturno" },
  { id: "during_sport", label: "Durante actividad deportiva" },
  { id: "after_sport", label: "Tras actividad deportiva" },
  { id: "weight", label: "Al cargar peso" },
  { id: "walking_running", label: "Al caminar / correr" },
  { id: "stairs", label: "Al subir/bajar escaleras" },
  { id: "sitting", label: "Sentado prolongado" },
  { id: "standing", label: "De pie prolongado" },
  { id: "specific_movement", label: "Movimiento descrito" },
  { id: "constant", label: "Constante" },
  { id: "intermittent", label: "Intermitente sin patrón" },
];

// ─── Functional assessment maps ───

export const JOINT_BY_REGION: Record<string, JointStructure | undefined> = {
  neck: "cervical",
  shoulder: "shoulder",
  elbow: "elbow",
  wrist_hand: "wrist",
  upper_back: "cervical",
  mid_back: "lumbar",
  lumbar: "lumbar",
  sacro: "lumbar",
  hip: "hip",
  knee: "knee",
  leg: "knee",
  ankle: "ankle",
  foot: "ankle",
};

export const MOVEMENT_LABELS: Record<Movement, string> = {
  flexion: "Flexión",
  extension: "Extensión",
  abduction: "Abducción",
  adduction: "Aducción",
  internal_rotation: "Rotación interna",
  external_rotation: "Rotación externa",
  pronation: "Pronación",
  supination: "Supinación",
  radial_deviation: "Desviación radial",
  ulnar_deviation: "Desviación cubital",
  ipsilateral_inclination: "Inclinación homolateral",
  contralateral_inclination: "Inclinación contralateral",
  ipsilateral_rotation: "Rotación homolateral",
  contralateral_rotation: "Rotación contralateral",
  dorsiflexion: "Dorsiflexión",
  plantarflexion: "Flexión plantar",
  inversion: "Inversión",
  eversion: "Eversión",
  forced_valgus: "Valgo forzado",
  forced_varus: "Varo forzado",
  dynamic_valgus: "Valgo dinámico",
  dynamic_varus: "Varo dinámico",
};

export const MOVEMENTS_BY_JOINT: Record<JointStructure, Movement[]> = {
  shoulder: [
    "flexion", "extension", "abduction", "adduction",
    "internal_rotation", "external_rotation",
  ],
  elbow: [
    "flexion", "extension", "pronation", "supination",
    "forced_valgus", "forced_varus", "dynamic_valgus", "dynamic_varus",
  ],
  wrist: ["flexion", "extension", "radial_deviation", "ulnar_deviation"],
  cervical: [
    "flexion", "extension", "ipsilateral_inclination",
    "contralateral_inclination", "ipsilateral_rotation", "contralateral_rotation",
  ],
  lumbar: [
    "flexion", "extension", "ipsilateral_inclination",
    "contralateral_inclination", "ipsilateral_rotation", "contralateral_rotation",
  ],
  hip: [
    "flexion", "extension", "abduction", "adduction",
    "internal_rotation", "external_rotation",
  ],
  knee: [
    "flexion", "extension", "internal_rotation", "external_rotation",
    "forced_valgus", "forced_varus", "dynamic_valgus", "dynamic_varus",
  ],
  ankle: ["dorsiflexion", "plantarflexion", "inversion", "eversion"],
};

export const PROVOCATION_LABELS: Record<ProvocationType, string> = {
  active_contraction: "Contracción activa",
  passive_stretch: "Estiramiento pasivo",
  active_stretch: "Estiramiento activo",
  resisted: "Contrarresistencia",
  passive_mobility: "Movilidad pasiva",
};

export const CONDITION_LABELS: Record<MechanicalCondition, string> = {
  unloaded: "Sin carga",
  loaded: "Con carga",
  compression: "Con compresión",
  loaded_compression: "Carga + compresión",
};

// ─── Profile labels ───

export const OCCUPATIONAL_LOAD_LABELS: Record<OccupationalLoad, string> = {
  sedentary: "Sedentario",
  prolonged_standing: "De pie prolongado",
  moderate_physical: "Carga moderada",
  heavy_physical: "Carga pesada",
};

export const OCCUPATIONAL_LOAD_SUBTITLES: Record<OccupationalLoad, string> = {
  sedentary: ">6h sentado al día",
  prolonged_standing: "Hostelería, retail, docencia",
  moderate_physical: "Logística, profesor de EF",
  heavy_physical: "Construcción, agricultura",
};

export const ACTIVITY_VOLUME_LABELS: Record<ActivityVolume, string> = {
  none: "Sin actividad",
  recreational: "Recreativa",
  regular: "Regular",
  high_performance: "Alto rendimiento",
};

export const ACTIVITY_VOLUME_SUBTITLES: Record<ActivityVolume, string> = {
  none: "Sin actividad estructurada",
  recreational: "<2 sesiones/semana",
  regular: "2-4 sesiones/semana",
  high_performance: ">5 sesiones/semana",
};

export const COMMON_SPORTS = [
  "Correr", "Fútbol", "Pesas/Gimnasio", "Natación",
  "Ciclismo", "Pádel/Tenis", "Crossfit", "Yoga/Pilates",
  "Artes marciales", "Baloncesto", "Voleibol", "Escalada",
];
