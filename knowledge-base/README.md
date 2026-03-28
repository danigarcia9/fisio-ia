# Knowledge Base — Base de Conocimiento Clínico

Esta carpeta contiene la base de conocimiento clínico estructurada que el agente de IA utiliza para razonar sobre diagnósticos.

## Estructura

Cada región corporal tiene su propia carpeta con fichas de músculos/patologías:

```
/knowledge-base
  /muscles
    /shoulder
      deltoides.md
      supraespinoso.md
      infraespinoso.md
      ...
    /knee
      ...
    /lower-back
      ...
```

## Cómo añadir contenido

Crea un archivo `.md` por músculo/estructura con la siguiente plantilla:

```markdown
# [Nombre del músculo/estructura]

## Anatomía
- Origen:
- Inserción:
- Inervación:
- Función principal:

## Patologías comunes
### [Nombre de la patología]
- Presentación típica:
- Factores de riesgo:
- Diagnóstico diferencial:

## Tests clínicos
### [Nombre del test]
- Ejecución:
- Positivo indica:
- Negativo indica:
- Sensibilidad/Especificidad:

## Patrones de dolor referido
- Descripción:
- Zonas de irradiación:

## Protocolos de tratamiento
### [Línea de tratamiento]
- Técnica:
- Indicaciones:
- Contraindicaciones:
- Evidencia:
```

## Notas

- El contenido se construye iterativamente con el input de Marco
- Priorizar regiones por frecuencia de consulta: hombro, rodilla, lumbar
- Cada ficha debe ser revisada y validada por Marco antes de ser considerada fiable
