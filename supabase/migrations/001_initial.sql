-- Perfil del profesional (Marco, o futuros fisios en Fase 1+)
create table professional_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  contexts jsonb not null default '[]'::jsonb,
  -- contexts = [{id, name, techniques: string[], equipment: string[], notes: string}]
  active_context_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Log de feedback de desarrollo (herramienta interna Dani+Marco)
create table dev_feedback_log (
  id uuid primary key default gen_random_uuid(),
  session_date timestamptz default now(),

  -- Inputs del caso
  patient_zone text[],
  patient_profile text,
  patient_age integer,
  context_id text,

  -- Resultado diagnóstico
  hypotheses_generated jsonb,
  top_hypothesis text,
  discriminatory_questions jsonb,
  clinical_tests_suggested jsonb,
  therapy_proposed jsonb,

  -- Feedback de Marco
  diagnostic_accuracy text check (diagnostic_accuracy in (
    'top1', 'top3', 'in_list', 'not_found', 'not_diagnosable'
  )),
  utility text check (utility in ('helped', 'neutral', 'confused')),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  notes text,

  -- Raw para reprocesado
  raw_session_state jsonb,

  created_at timestamptz default now()
);

-- Índices para análisis del log
create index idx_feedback_date on dev_feedback_log(session_date desc);
create index idx_feedback_accuracy on dev_feedback_log(diagnostic_accuracy);
create index idx_feedback_zone on dev_feedback_log using gin(patient_zone);
