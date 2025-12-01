# Documentación General del Proyecto

Esta carpeta contiene toda la documentación relacionada con las Pull Requests completadas y en progreso del proyecto PaginaRegistroSS.

## Estructura

```
Documentacion_General/
├── README.md (este archivo)
├── PR_95/           # Documentación de PR #95 - Búsqueda Avanzada
└── PR_Current/      # Documentación del PR actual en desarrollo
```

## Organización de Documentación por PR

### Carpetas por PR Completadas

Cada Pull Request completada debe tener su propia subcarpeta nombrada con el formato `PR_#` donde `#` es el número del PR.

Ejemplo:
- `PR_95/` contiene documentación relacionada con el Pull Request #95
- `PR_96/` contendría documentación del Pull Request #96 (cuando se complete)

### Carpeta PR_Current

La carpeta `PR_Current/` contiene documentación del Pull Request actualmente en desarrollo. Una vez que el PR sea completado y mergeado, estos archivos deben moverse a una carpeta con el número de PR correspondiente.

## Tipos de Documentación Recomendados

Cada carpeta de PR puede contener (según sea relevante):

- `IMPLEMENTATION_SUMMARY.md` - Resumen de la implementación técnica
- `BUSQUEDA_AVANZADA.md` o nombre descriptivo - Descripción de la funcionalidad
- `README_FEATURE.md` - Guía rápida de uso de la funcionalidad
- `SECURITY_SUMMARY.md` - Análisis de seguridad
- `UI_PREVIEW.md` - Vistas previas de la interfaz
- `CAMBIOS_*.md` - Documentación de cambios específicos

## Flujo de Trabajo

1. **Durante el desarrollo**: Crea archivos `.md` en `PR_Current/`
2. **Al completar el PR**: Mueve los archivos de `PR_Current/` a `PR_#/` (donde # es el número del PR)
3. **Después del merge**: La carpeta `PR_#/` permanece como documentación histórica

## Convenciones

- Usar nombres descriptivos en español
- Incluir fecha en los documentos cuando sea relevante
- Mantener formato Markdown estándar
- Incluir ejemplos de código cuando sea posible
- Documentar tanto cambios de código como de configuración

## Historial

### PR #95 - Búsqueda Avanzada de Candidatos
- Implementación de búsqueda avanzada
- Filtros por habilidades y certificaciones
- Control de acceso por rol
- Archivos movidos: BUSQUEDA_AVANZADA.md, IMPLEMENTATION_SUMMARY.md, README_FEATURE.md, SECURITY_SUMMARY.md, UI_PREVIEW.md

### PR Actual - Corrección del Layout de Búsqueda Avanzada
- Corrección de problemas de layout en resultados de búsqueda
- Cambio de cards a tabla responsive
- Organización inicial de esta estructura de documentación
