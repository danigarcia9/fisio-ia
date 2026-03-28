# FisioIA — Asistente diagnóstico para fisioterapia

Sistema de diagnóstico asistido por IA para fisioterapia. Genera hipótesis diagnósticas, preguntas discriminatorias, tests clínicos y propuestas terapéuticas.

**Fase 0**: Validación del motor de razonamiento clínico. Sin persistencia de pacientes, sin autenticación. Usuario único: Marco.

## Stack

- **Next.js 15** (App Router, TypeScript estricto)
- **Tailwind CSS v4** + **shadcn/ui v4** (dark mode, tablet-first)
- **Vercel AI SDK 6** (`ai` + `@ai-sdk/anthropic`) — llamadas directas a Claude Sonnet
- **Supabase** — perfil del profesional + log de feedback
- **Zod 4** — validación de schemas

## Setup local

### 1. Clonar e instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Rellena las variables:

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic (Claude) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase |

### 3. Configurar Supabase

Ejecuta la migración en tu proyecto Supabase:

```bash
# Con Supabase CLI
supabase db push

# O manualmente: copia el contenido de supabase/migrations/001_initial.sql
# y ejecútalo en el SQL Editor de Supabase Dashboard
```

### 4. Ejecutar

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). La primera vez te redirige a `/setup` para configurar el perfil del profesional.

## Arquitectura

```
/app
  /api
    /session/start     ← Inicia caso clínico (stream)
    /session/update    ← Nuevo input → recalcula hipótesis (stream)
    /session/propose   ← Propuesta terapéutica final (stream)
    /feedback          ← Log de desarrollo (Supabase)
    /profile           ← CRUD perfil del profesional
  /(auth)/setup        ← Configuración inicial del perfil
  /(app)/session       ← UI principal de consulta (tablet)
  /(app)/log           ← Review del log de feedback

/components
  /session             ← BodyMap, HypothesisTree, QuestionPanel, etc.
  /ui                  ← Componentes shadcn instalados

/lib
  /ai                  ← Agente diagnóstico (tools, prompts, agent)
  /supabase            ← Clientes Supabase (browser + server)
  /schemas             ← Schemas Zod (session, profile, feedback)

/knowledge-base        ← Base de conocimiento clínico (por construir)
/supabase/migrations   ← Schema de base de datos
```

## Flujo de uso

1. **Apertura del caso**: Seleccionar perfil del paciente + zona(s) de dolor en el mapa corporal
2. **Ignición del agente**: Genera árbol de hipótesis + preguntas discriminatorias
3. **Refinamiento**: Responder preguntas → el árbol se recalcula en tiempo real
4. **Exploración física**: Tests clínicos sugeridos → marcar resultados
5. **Propuesta terapéutica**: Seleccionar hipótesis → el agente genera el plan de tratamiento
6. **Feedback**: Cerrar sesión → formulario rápido de feedback (30s)

## Notas

- El system prompt del agente (`lib/ai/prompts.ts`) es un **placeholder** — se construye en paralelo con la validación clínica de Marco
- El mapa corporal usa SVG propio con zonas interactivas
- Dark mode por defecto (entorno clínico con luz controlada)
- Diseño tablet-first con botones grandes para uso táctil
