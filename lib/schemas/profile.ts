import { z } from "zod/v4";

// --- Available Techniques ---

export const techniques = [
  "manual_therapy",
  "dry_needling",
  "neuromuscular_taping",
  "electrotherapy",
  "shockwave",
  "ultrasound",
  "laser",
  "therapeutic_exercise",
] as const;

export const TechniqueSchema = z.enum(techniques);
export type Technique = z.infer<typeof TechniqueSchema>;

export const techniqueLabels: Record<Technique, string> = {
  manual_therapy: "Terapia manual (masaje, movilizaciones)",
  dry_needling: "Punción seca",
  neuromuscular_taping: "Vendaje neuromuscular",
  electrotherapy: "Electroterapia (TENS, EMS)",
  shockwave: "Ondas de choque",
  ultrasound: "Ultrasonido",
  laser: "Láser",
  therapeutic_exercise: "Ejercicio terapéutico",
};

// --- Available Equipment ---

export const equipmentItems = [
  "treatment_table",
  "electrotherapy_equipment",
  "basic_gym",
  "full_gym",
  "shockwave_machine",
  "ultrasound_machine",
  "laser_machine",
] as const;

export const EquipmentSchema = z.enum(equipmentItems);
export type Equipment = z.infer<typeof EquipmentSchema>;

export const equipmentLabels: Record<Equipment, string> = {
  treatment_table: "Camilla",
  electrotherapy_equipment: "Material electroterapia",
  basic_gym: "Equipamiento gimnasio básico",
  full_gym: "Equipamiento gimnasio completo",
  shockwave_machine: "Máquina ondas de choque",
  ultrasound_machine: "Ultrasonido",
  laser_machine: "Láser",
};

// --- Clinic Context ---

export const ClinicContextSchema = z.object({
  id: z.string(),
  name: z.string(),
  techniques: z.array(TechniqueSchema),
  equipment: z.array(EquipmentSchema),
  notes: z.string().optional(),
});
export type ClinicContext = z.infer<typeof ClinicContextSchema>;

// --- Professional Profile ---

export const ProfessionalProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  contexts: z.array(ClinicContextSchema).min(1),
  activeContextId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type ProfessionalProfile = z.infer<typeof ProfessionalProfileSchema>;

// --- API Request Schemas ---

export const CreateProfileRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  contexts: z.array(ClinicContextSchema).min(1),
  activeContextId: z.string(),
});
export type CreateProfileRequest = z.infer<typeof CreateProfileRequestSchema>;

export const UpdateProfileRequestSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contexts: z.array(ClinicContextSchema).optional(),
  activeContextId: z.string().optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
