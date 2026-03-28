# Proyecto: Plataforma de IA para Fisioterapia

> Documento vivo de referencia del proyecto — versión 0.1
> Última actualización: 28 de marzo de 2026

---

## 1. Equipo fundador

### Daniel (Dani) — Producto, tecnología y estrategia

CEO y cofundador de PROXUS, plataforma EdTech española con +33.000 usuarios. Experiencia directa construyendo productos con IA (generación de tests, flashcards, podcasts), sistemas agenticos, y modelos SaaS freemium. Aporta al proyecto todo el conocimiento técnico, de arquitectura de producto y de desarrollo de software. Su rol en este proyecto es diseñar, construir y evolucionar la plataforma.

### Marco — Dominio clínico, validación y testing

Fisioterapeuta y preparador físico con experiencia tanto en alto rendimiento deportivo como en pacientes de perfil general (sedentarios, trabajadores de oficina, lesiones comunes). Trabaja en clínica privada combinando terapia manual, punción seca y ejercicio terapéutico. Su rol en este proyecto es doble: es el experto de dominio que define la lógica clínica del sistema y el primer usuario/tester que valida cada iteración en consulta real.

---

## 2. El problema

La fisioterapia clínica actual opera con herramientas del siglo pasado para gestionar procesos que son intrínsecamente complejos y basados en datos. Los problemas concretos que hemos identificado son:

**Diagnóstico basado en memoria e intuición.** Un fisioterapeuta experimentado maneja mentalmente cientos de patologías, patrones de dolor referido, técnicas y protocolos. Cuando un caso es poco convencional o ambiguo, el proceso diagnóstico se alarga, requiere múltiples intentos de tratamiento, y depende enteramente de la experiencia individual del profesional. No hay un sistema que asista en el razonamiento diferencial ni que aprenda de los resultados de tratamientos anteriores.

**Ausencia de protocolos estandarizados con datos reales.** Dos fisioterapeutas pueden tratar el mismo caso de formas completamente distintas, y ninguno de los dos tiene datos objetivos sobre qué enfoque funciona mejor para qué perfil de paciente. La evidencia clínica existe en papers académicos, pero no está integrada en el flujo de trabajo diario.

**Gestión de pacientes fragmentada.** El historial del paciente vive en notas sueltas, fichas en papel o sistemas genéricos de gestión que no entienden el contexto clínico. La evolución del paciente no se registra de forma estructurada, los ejercicios prescritos se comunican verbalmente o en PDFs genéricos, y el seguimiento entre sesiones depende de la memoria del profesional.

**El paciente no tiene visibilidad.** El paciente sale de consulta sin acceso a su historial, sin forma de revisar los ejercicios que le han mandado salvo un papel o un mensaje de WhatsApp, y sin manera de comunicar su evolución entre sesiones de forma que el fisioterapeuta pueda integrar esa información en el tratamiento.

---

## 3. La propuesta

Construir una plataforma de software agéntico con IA que acompañe al fisioterapeuta en todo el ciclo de atención al paciente: desde el diagnóstico inicial hasta el alta, pasando por la planificación del tratamiento, el seguimiento entre sesiones y la medición de resultados.

No se trata de sustituir al profesional. Se trata de darle un copiloto inteligente que le ayude a razonar más rápido en los casos difíciles, que aprenda de cada caso tratado, y que elimine toda la fricción administrativa que no aporta valor clínico.

### Principios de diseño del producto

- **El paciente no debe sentir que está rellenando papeleo.** La captura de información debe ser invisible, integrada en la conversación natural entre profesional y paciente.
- **El profesional debe sentir que el sistema le ahorra tiempo, no que le añade pasos.** Cada interacción con la plataforma debe ser más rápida que la alternativa actual (papel, memoria, WhatsApp).
- **La IA sugiere, el profesional decide.** El sistema nunca aplica un tratamiento ni cierra un diagnóstico automáticamente. Presenta opciones con justificaciones y el fisioterapeuta tiene la última palabra.
- **Los datos se acumulan y el sistema mejora con cada caso.** El valor diferencial a largo plazo no es el software en sí, sino la base de conocimiento clínico estructurada que se genera con el uso.
- **Adaptable al contexto del profesional.** El sistema conoce qué técnicas domina el profesional y qué equipamiento tiene disponible en cada momento, y adapta sus sugerencias en consecuencia.

---

## 4. Alcance funcional completo (visión a largo plazo)

La visión completa del producto abarca cinco grandes bloques funcionales. No se construirán todos a la vez — la estrategia de desarrollo por fases se detalla en la sección 5.

### 4.1 Sistema de diagnóstico asistido por IA

Motor central del producto. Un agente de IA que, a partir de datos mínimos del paciente y su sintomatología, genera un árbol de hipótesis diagnósticas ordenadas por probabilidad, sugiere preguntas discriminatorias y tests clínicos para refinar el diagnóstico, y propone protocolos de tratamiento ajustados al contexto del profesional.

**Datos de entrada del paciente:**
- Nombre (para catalogación)
- Edad y género
- Perfil de actividad: sedentario, deportista amateur, alto rendimiento, trabajo físico
- Peso y altura solo cuando sea clínicamente relevante (valores extremos)
- Zona de dolor (selección en mapa corporal interactivo)
- Tipo de dolor, intensidad, factores desencadenantes
- Historial relevante (lesiones previas, cirugías, patologías conocidas)

**Lógica del agente diagnóstico:**
- Con datos mínimos (zona + perfil), el agente genera un primer árbol de hipótesis
- Sugiere las 2-3 preguntas más discriminatorias para ese caso concreto
- Cada respuesta recalcula el árbol en tiempo real: ramas se descartan, otras suben
- Sugiere tests físicos específicos para confirmar/descartar hipótesis
- El árbol es navegable: el profesional puede retroceder, reconsiderar, añadir información en cualquier momento
- Si un tratamiento previo no funcionó, el sistema reordena hipótesis descartando esa rama

**Sistema de red flags:**
- Detección automática de banderas rojas que requieren derivación médica
- Alertas para síntomas que escapan del ámbito del fisioterapeuta (dolor torácico potencialmente cardíaco, síntomas neurológicos, signos de patología grave)
- Presente desde la primera versión por responsabilidad clínica y legal

### 4.2 Perfil del profesional y contexto de clínica

Cada profesional configura su perfil una vez y lo actualiza cuando cambia de contexto:

- **Técnicas que domina:** punción seca, terapia manual, vendaje neuromuscular, electroterapia, ejercicio terapéutico, etc.
- **Equipamiento disponible:** máquinas específicas (TENS, ultrasonido, ondas de choque, láser, etc.), herramientas de diagnóstico, material de gimnasio
- **Espacio disponible:** solo camilla, camilla + zona de ejercicios, gimnasio completo
- **Contextos múltiples:** si el profesional trabaja en varias clínicas, puede tener perfiles de equipamiento distintos y cambiar entre ellos

El sistema filtra automáticamente sus sugerencias terapéuticas por lo disponible. Cuando sugiere algo que requiere equipamiento no disponible, propone la mejor alternativa con lo que sí hay.

### 4.3 Gestión de pacientes y sesiones

- Ficha del paciente con datos clínicos estructurados
- Historial completo de sesiones con diagnósticos, tratamientos aplicados y evolución
- Registro de cada sesión: técnicas utilizadas, zonas tratadas, observaciones, plan de trabajo para casa
- Evolución medible a lo largo del tiempo (escala de dolor, rango de movilidad, capacidad funcional)

### 4.4 Sistema de retroalimentación y seguimiento

- Formulario automático enviado al paciente 48h después de cada sesión
- Envío por WhatsApp o email según preferencia del paciente
- Contenido del formulario adaptado al tratamiento aplicado (no genérico)
- Los datos de feedback se integran en el historial del paciente y alimentan la efectividad de los protocolos

### 4.5 Portal del paciente

- Acceso al historial completo de tratamientos y evolución
- Rutinas de rehabilitación prescritas con contenido multimedia (vídeos de ejercicios)
- Instrucciones claras para trabajo en casa o en gimnasio
- Documentación exportable para compartir con otros profesionales (médicos, traumatólogos)

### 4.6 Biblioteca de ejercicios y contenido

- Base de datos de vídeos de ejercicios terapéuticos y de rehabilitación
- Etiquetado por zona corporal, patología, nivel de dificultad, equipamiento necesario
- Selección automática según el plan de tratamiento, con capacidad de modificación manual
- Cobertura desde ejercicios terapéuticos básicos hasta rehabilitación completa

---

## 5. Estrategia de desarrollo por fases

Cada fase es un producto mínimo independiente que aporta valor por sí solo. No se avanza a la siguiente fase hasta que la anterior esté validada. Si una fase no funciona, se itera sobre ella o se replantea el enfoque antes de seguir.

### Fase 0 — Diagnóstico asistido (sin persistencia)

**Objetivo:** Validar que el motor de razonamiento clínico de la IA es útil y preciso en consulta real.

**Qué incluye:**
- Sistema de diagnóstico asistido completo (árbol de hipótesis, preguntas discriminatorias, sugerencia de tests)
- Perfil del profesional con inventario de técnicas y equipamiento
- Sistema de red flags y alertas de derivación
- Sistema de feedback de desarrollo (para Dani y Marco, no para el producto)
- Sin registro permanente de pacientes
- Sin portal de paciente
- Sin biblioteca de contenido

**Usuario:** Exclusivamente Marco.

**Métrica de éxito:** El sistema incluye el diagnóstico correcto en su top 3 en al menos el 80% de los casos.

**Detalle completo en la sección 6.**

### Fase 1 — Persistencia y registro

**Objetivo:** Convertir el asistente diagnóstico en un sistema de gestión de pacientes real.

**Qué incluye (además de Fase 0):**
- Modelo de datos completo para pacientes, sesiones, evaluaciones, tratamientos
- Fichas de paciente con historial clínico estructurado
- Registro de sesiones y evolución
- Cumplimiento completo de RGPD (consentimiento, cifrado, política de retención, derechos ARCO)

**Métrica de éxito:** Marco deja de usar su sistema actual (papel, Excel, lo que sea) y gestiona todo desde la plataforma.

### Fase 2 — Loop de retroalimentación

**Objetivo:** Cerrar el ciclo de datos para que los resultados de los tratamientos retroalimenten la calidad de las sugerencias.

**Qué incluye (además de Fases 0+1):**
- Formularios post-tratamiento automáticos para pacientes
- Tracking de evolución con métricas clínicas (dolor, movilidad, funcionalidad)
- Los datos de resultado alimentan los pesos del sistema diagnóstico
- Dashboard de efectividad de protocolos para el profesional

**Métrica de éxito:** El sistema mejora su tasa de acierto en top 3 de forma medible comparado con la Fase 0.

### Fase 3 — Contenido y portal del paciente

**Objetivo:** Extender el valor del sistema al paciente directamente.

**Qué incluye (además de Fases 0+1+2):**
- Portal del paciente con acceso a historial y rutinas
- Biblioteca de ejercicios con vídeo
- Prescripción de rutinas desde la plataforma
- Exportación de informes para otros profesionales

**Métrica de éxito:** Los pacientes de Marco utilizan activamente el portal y valoran positivamente la experiencia.

---

## 6. Fase 0 — Especificación detallada

### 6.1 Flujo de uso en consulta

El siguiente flujo describe cómo Marco usa el sistema durante una sesión real:

**Paso 1 — Apertura del caso (10 segundos)**

Marco abre la app en su tablet. Pulsa "Nuevo caso". Introduce dos datos:
- Perfil del paciente: toca una de tres opciones (sedentario / deportista / trabajo físico). Opcionalmente añade edad si es relevante.
- Zona de dolor: toca en un mapa corporal interactivo la región donde el paciente refiere dolor. Puede seleccionar múltiples zonas.

No hay más campos obligatorios. El paciente ni siquiera necesita percibir que Marco está introduciendo datos — es un gesto natural mientras conversa.

**Paso 2 — Ignición del agente (inmediato)**

Con esos dos datos, el agente de IA genera inmediatamente:
- Un árbol de hipótesis con las patologías/músculos más probables para esa zona y perfil, ordenados por probabilidad
- Las 2-3 preguntas discriminatorias más eficientes para ese caso concreto (las que más información aportan para separar hipótesis)

El árbol aparece en un panel lateral o inferior. Cada hipótesis muestra su probabilidad estimada y una justificación breve de por qué está en la lista.

**Paso 3 — Refinamiento conversacional (1-3 minutos)**

Marco hace las preguntas sugeridas al paciente durante la conversación natural. Va marcando respuestas en la app (selección rápida, un toque por respuesta). Puede también introducir información que el paciente le da espontáneamente.

Con cada input, el árbol se recalcula en tiempo real:
- Hipótesis que se vuelven menos probables bajan o desaparecen
- Hipótesis que ganan evidencia suben
- Nuevas preguntas discriminatorias se generan en función del estado actual del árbol

Si el sistema detecta una red flag (síntoma que sugiere patología grave o fuera del ámbito del fisioterapeuta), muestra una alerta visual clara con la recomendación de derivación.

**Paso 4 — Validación exploratoria (durante la exploración física)**

Cuando Marco pasa a la exploración física en camilla, el sistema sugiere tests clínicos específicos para confirmar o descartar las hipótesis principales. Para cada test sugerido:
- Nombre del test y cómo ejecutarlo (con referencia visual si es necesario)
- Qué confirma un resultado positivo y qué confirma un negativo
- Cómo afecta cada resultado al árbol de hipótesis

Marco ejecuta los tests y marca los resultados. El árbol se actualiza.

**Paso 5 — Propuesta terapéutica**

Una vez que Marco tiene una hipótesis con confianza suficiente (o la selecciona manualmente), el sistema genera una propuesta de tratamiento:
- Técnicas recomendadas (filtradas por el perfil de clínica de Marco)
- Si aplica punción seca: músculo objetivo, técnica recomendada, puntos de referencia
- Ejercicios terapéuticos recomendados (3-4 ejercicios para casos simples)
- Frecuencia sugerida de sesiones
- Señales de evolución esperada

Si el tratamiento requiere equipamiento que Marco no tiene en su contexto actual, el sistema lo indica y propone alternativas.

**Paso 6 — Navegación hacia atrás (en cualquier momento)**

En cualquier punto del flujo, Marco puede:
- Tocar cualquier hipótesis para ver su justificación completa
- Reabrir una hipótesis descartada ("vamos a reconsiderar esto")
- Añadir información nueva que recalcule todo
- Indicar que un tratamiento anterior no funcionó, lo que descarta la hipótesis asociada y reordena las restantes

El sistema mantiene el historial de razonamiento de la sesión para que Marco pueda ver qué camino ha seguido y por qué.

### 6.2 Perfil del profesional

En la primera configuración, Marco define:

**Técnicas disponibles:**
- Terapia manual (masaje, movilizaciones, estiramientos asistidos)
- Punción seca
- Vendaje neuromuscular (kinesiotaping)
- Electroterapia (TENS, EMS, etc.)
- Otras técnicas (especificar)

**Equipamiento disponible:**
- Camilla
- Material de electroterapia (especificar máquinas)
- Equipamiento de gimnasio (especificar)
- Ondas de choque
- Ultrasonido
- Láser
- Otros (especificar)

**Contextos de trabajo:**
- Marco puede definir múltiples "contextos" (ej: "Clínica A" con equipamiento completo, "Clínica B" solo camilla)
- Al abrir un caso, selecciona en qué contexto está trabajando
- Las sugerencias del sistema se adaptan automáticamente

### 6.3 Base de conocimiento clínico

El agente de IA necesita una base de conocimiento clínico estructurada para razonar. Esta base incluye:

- **Anatomía funcional:** músculos, inserciones, inervaciones, funciones, patrones de dolor referido
- **Patologías por región:** para cada zona corporal, las patologías más comunes con su presentación típica
- **Tests clínicos:** inventario de tests diagnósticos con su ejecución, sensibilidad, especificidad y qué confirman/descartan
- **Protocolos de tratamiento:** para cada patología, las líneas de tratamiento con evidencia, ordenadas por efectividad
- **Técnicas específicas:** para cada técnica (ej: punción seca en supraespinoso), la descripción detallada de ejecución, referencias anatómicas, precauciones

Esta base se construye inicialmente con el conocimiento de Marco y documentación clínica de referencia, y se enriquece progresivamente con el uso.

### 6.4 Sistema de feedback de desarrollo

**Propósito:** Herramienta interna para Dani y Marco. No forma parte del producto, no lo ve ningún paciente. Su único objetivo es generar datos que permitan iterar sobre el sistema de forma informada.

**Flujo:** Al cerrar un caso (o al final del día), Marco completa un mini-formulario de máximo 30 segundos:

- **Precisión del diagnóstico** (slider o selección rápida):
  - El sistema acertó en su primera sugerencia
  - El diagnóstico correcto estaba en el top 3
  - El diagnóstico correcto estaba en la lista pero no en el top 3
  - El sistema no incluyó el diagnóstico correcto
  - El caso no era diagnosticable con la información disponible

- **Utilidad del sistema** (selección rápida):
  - Me ahorró tiempo / Me ayudó a razonar
  - Neutral — no me aportó ni me quitó
  - Me hizo perder tiempo / Me confundió

- **Dificultad del caso** (tag):
  - Fácil / Medio / Difícil

- **Notas libres** (campo de texto, opcional):
  - Observaciones, errores detectados, sugerencias, lo que Marco quiera apuntar

**Almacenamiento:** Log estructurado (JSON o spreadsheet) accesible para Dani y Marco. Cada entrada incluye fecha, los inputs del caso (zona, perfil, respuestas), las hipótesis generadas, y el feedback de Marco.

**Uso del log:** En las reuniones periódicas de revisión, Dani y Marco abren el log y analizan patrones: dónde acierta el sistema, dónde falla, qué tipos de caso son problemáticos, qué preguntas discriminatorias no funcionan, qué falta en la base de conocimiento.

### 6.5 Interfaz y dispositivos

- **Dispositivo principal:** Tablet (uso en consulta, al lado de la camilla)
- **Dispositivo secundario:** Ordenador (configuración, revisión de logs, análisis)
- **Diseño mobile-first:** La interfaz de consulta debe funcionar perfectamente con interacción táctil
- **Modo consulta:** Interfaz limpia, sin distracciones, optimizada para toques rápidos mientras Marco está con el paciente
- **El paciente no interactúa con el sistema en Fase 0** — es una herramienta exclusiva del profesional

### 6.6 Consideraciones técnicas

**Modelos de IA:**
- No usar modelos genéricos (ChatGPT genérico) sino modelos especializados o prompting especializado en razonamiento clínico
- Capacidad de referenciar documentación médica (PDFs, imágenes, atlas anatómicos)
- Latencia baja: el recálculo del árbol debe ser perceptiblemente instantáneo (< 2 segundos)

**Datos y privacidad (preparación para Fase 1):**
- Aunque la Fase 0 no persiste datos de pacientes, el modelo de datos debe estar definido para no tener que migrar después
- Definir entidades desde ya: Paciente, Sesión, Evaluación, Hipótesis, Tratamiento, Ejercicio, Feedback
- Preparar la arquitectura para cumplimiento RGPD desde el diseño (privacy by design)
- Datos de salud = categoría especial bajo RGPD → consentimiento explícito, cifrado, medidas de seguridad reforzadas

**Offline y conectividad:**
- Evaluar la necesidad de funcionamiento offline parcial (consultas sin conexión estable)
- La base de conocimiento clínico podría cachearse localmente
- El razonamiento del agente requiere conexión (llamada a modelo de IA)

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El sistema no alcanza precisión suficiente en diagnóstico | Alto — invalida la propuesta de valor central | Fase 0 dedicada exclusivamente a validar esto antes de construir nada más |
| Scope creep — intentar construir todo a la vez | Alto — proyecto se eterniza sin entregar valor | Fases independientes con métricas de éxito claras. No se avanza sin validar |
| Marco deja de dar feedback por fricción | Medio — se pierde la capacidad de iterar informadamente | Feedback de máximo 30 segundos. Revisarlo es obligatorio en cada reunión |
| Problemas legales por datos de salud | Alto — multas RGPD, responsabilidad profesional | Privacy by design desde Fase 0. Asesoría legal antes de Fase 1 |
| El paciente percibe dependencia del profesional en la IA | Medio — pérdida de confianza | El sistema es invisible para el paciente en Fases 0-1. El profesional decide cuándo y cómo comunicar su uso |
| La base de conocimiento clínico tiene lagunas | Medio — el sistema falla en casos que debería cubrir | Construcción iterativa con Marco. El log de desarrollo identifica lagunas concretas |

---

## 8. Próximos pasos inmediatos

1. **Definir el modelo de datos** — Entidades, relaciones y atributos, incluso los que no se persisten en Fase 0 pero que necesitan estar diseñados
2. **Construir la base de conocimiento clínico inicial** — Empezar por 2-3 regiones corporales (hombro, rodilla, lumbar) con el input directo de Marco
3. **Prototipar la interfaz de consulta** — Mockup del flujo de uso en tablet (mapa corporal, panel de hipótesis, flujo de preguntas)
4. **Seleccionar el stack técnico** — Modelo de IA, arquitectura del agente, frontend, almacenamiento del log de desarrollo
5. **Definir el protocolo de testing** — Cómo Marco va a usar el sistema en consulta, con cuántos pacientes, durante cuánto tiempo, y cómo vais a revisar los resultados

---

*Este documento se actualizará después de cada reunión de proyecto y cada revisión del log de desarrollo.*
