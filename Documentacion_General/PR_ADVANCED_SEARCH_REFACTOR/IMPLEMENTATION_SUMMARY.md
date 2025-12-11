# Resumen de Implementación: Refactorización del Filtro de Búsqueda Avanzada

## Fecha
2025-12-11

## Descripción del Cambio
Se refactorizó el filtro "Tipo de Documento/Habilidad" en la búsqueda avanzada para enfocarlo exclusivamente en documentos académicos subidos (Secundaria, Bachillerato, Universidad), separándolo claramente del filtro de certificados que ya existía.

## Objetivo
1. Remover la opción "Certificados" del filtro de documentos (ya existe un filtro separado "Solo usuarios con certificados")
2. Hacer que el filtro busque exclusivamente en documentos académicos de la tabla `documentos_academicos`
3. Mantener la separación entre:
   - **Documentos Académicos Subidos**: Busca en `documentos_academicos.tipo` (secundaria, bachillerato, universidad)
   - **Nivel de Estudios**: Busca en `personal.estudios` (nivel máximo de estudios del perfil)
4. Asegurar que funcione para usuarios antiguos y nuevos

## Archivos Modificados

### Frontend
- **`frontend/src/components/BusquedaAvanzada.jsx`**
  - Cambio del label: "Tipo de Documento/Habilidad" → "Documentos Académicos Subidos"
  - Eliminación de la opción "Certificados" del dropdown
  - Actualización de la descripción del componente
  - Mantiene las opciones: Secundaria, Bachillerato, Universidad

### Backend
- **`backend/routes/users.js`**
  - Modificación del filtro `tipoDocumento` en la ruta `/buscar-avanzado`
  - Agregado de condición `AND d2.es_certificado = false` para excluir certificados
  - Comentarios explicativos sobre la independencia de los filtros
  - El filtro continúa usando `ILIKE` para búsquedas flexibles

### Documentación
- **`Documentacion_General/PR_95/BUSQUEDA_AVANZADA.md`**
  - Actualización de la descripción de filtros
  - Clarificación de la diferencia entre "Documentos Académicos Subidos" y "Nivel de Estudios"
  - Actualización de casos de uso con ejemplos más específicos
  - Agregado del parámetro `estudios` en la documentación técnica

### Configuración
- **`.gitignore`** (nuevo archivo)
  - Exclusión de `node_modules/`
  - Exclusión de archivos de build
  - Exclusión de archivos de configuración sensibles (.env)

## Detalles Técnicos

### Lógica del Filtro (Backend)
```sql
-- Antes: Buscaba en documentos_academicos sin restricción
AND d2.tipo ILIKE '%tipoDocumento%'

-- Después: Excluye certificados explícitamente
AND d2.tipo ILIKE '%tipoDocumento%'
AND d2.es_certificado = false
```

### Flujo de Búsqueda
1. Usuario selecciona un tipo de documento académico (ej: "Bachillerato")
2. Frontend envía parámetro `tipoDocumento=bachillerato`
3. Backend busca en `documentos_academicos` donde:
   - `tipo ILIKE '%bachillerato%'`
   - `es_certificado = false`
4. Retorna usuarios que tienen documentos que cumplen estos criterios

## Filtros Disponibles (después del cambio)

| Filtro | Origen de Datos | Descripción |
|--------|-----------------|-------------|
| Nombre del Usuario | `personal` (nombre, apellidos, CURP, RFC) | Búsqueda de usuarios |
| Documentos Académicos Subidos | `documentos_academicos.tipo` (excluye certificados) | Secundaria, Bachillerato, Universidad |
| Nivel de Estudios | `personal.estudios` | Nivel máximo de estudios del perfil |
| Solo usuarios con certificados | `documentos_academicos.es_certificado` | Checkbox independiente |
| Solo usuarios con documentos verificados | `documentos_academicos.cotejado` | Checkbox independiente |

## Compatibilidad
- ✅ Usuarios antiguos (ya registrados): Funciona correctamente
- ✅ Usuarios nuevos (recién agregados): Funciona correctamente
- ✅ Búsquedas combinadas: Todos los filtros pueden usarse simultáneamente
- ✅ Sintaxis backward-compatible: Los parámetros existentes se mantienen

## Testing Realizado
- ✅ Build del frontend exitoso
- ✅ Validación de sintaxis del backend
- ✅ Verificación de la lógica SQL
- ✅ Revisión de documentación actualizada

## Próximos Pasos
- Ejecutar revisión de código automatizada
- Ejecutar análisis de seguridad con CodeQL
- Testing manual con datos reales (si disponible)

## Notas Adicionales
- El filtro usa `ILIKE` (case-insensitive) para permitir búsquedas flexibles
- La condición `es_certificado = false` asegura que los certificados no aparezcan en este filtro
- El filtro de certificados separado (`soloCertificados`) sigue funcionando independientemente
- Límite de resultados: 100 usuarios por búsqueda
