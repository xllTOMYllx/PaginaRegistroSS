# Búsqueda Avanzada de Candidatos

## Descripción
Esta función permite a los administradores (rol 3 y 4) buscar y filtrar usuarios basándose en sus habilidades, conocimientos y certificaciones registradas en el sistema.

## Acceso
- **Roles permitidos**: Rol 3 (Jefe de Departamento) y Rol 4 (Administrador del Sistema)
- **Ubicación**: Menú lateral → "🔍 Búsqueda Avanzada"
- **Ruta**: `/busqueda-avanzada`

## Características

### Filtros de Búsqueda
1. **Nombre del Usuario**: Busca por nombre, apellido, CURP o RFC del usuario
2. **Tipo de Documento/Habilidad**: Filtra usuarios que tengan documentos específicos (ej: "Licenciatura", "Maestría", "Certificado en...")
3. **Solo usuarios con certificados**: Muestra únicamente usuarios que hayan subido certificados
4. **Solo usuarios con documentos verificados**: Muestra únicamente usuarios cuyos documentos han sido cotejados

### Resultados
Los resultados muestran:
- Foto de perfil del usuario
- Nombre completo y nombre de usuario
- Total de documentos subidos
- Número de certificados
- Número de documentos verificados
- Lista de tipos de documentos (hasta 3 visibles, con indicador de más)
- Botón para ver detalles completos del usuario

## Implementación Técnica

### Backend
- **Endpoint**: `GET /api/users/buscar-avanzado`
- **Middleware**: `authenticateToken`, `isJefeOAdmin`
- **Parámetros de consulta**:
  - `nombre`: String opcional para búsqueda por nombre
  - `tipoDocumento`: String opcional para filtrar por tipo de documento
  - `soloCertificados`: Boolean opcional ('true' para filtrar)
  - `soloVerificados`: Boolean opcional ('true' para filtrar)

### Frontend
- **Componente**: `BusquedaAvanzada.jsx`
- **Estilos**: `BusquedaAvanzada.css`
- **Protección de ruta**: Verifica que el usuario sea rol 3 o 4 antes de permitir acceso

## Casos de Uso

### Ejemplo 1: Buscar usuarios con Maestría
1. Acceder a "Búsqueda Avanzada"
2. En "Tipo de Documento/Habilidad" escribir "Maestría"
3. Hacer clic en "Buscar"

### Ejemplo 2: Buscar usuarios certificados en un área específica
1. Acceder a "Búsqueda Avanzada"
2. En "Tipo de Documento/Habilidad" escribir el nombre de la certificación
3. Marcar la casilla "Solo usuarios con certificados"
4. Hacer clic en "Buscar"

### Ejemplo 3: Buscar por nombre con documentos verificados
1. Acceder a "Búsqueda Avanzada"
2. En "Nombre del Usuario" escribir el nombre o parte del nombre
3. Marcar la casilla "Solo usuarios con documentos verificados"
4. Hacer clic en "Buscar"

## Notas Importantes
- La búsqueda está limitada a usuarios de rol 1 (trabajadores) y rol 2 (supervisores)
- Los resultados se ordenan alfabéticamente por apellido
- Se pueden combinar múltiples filtros para búsquedas más específicas
- El límite de resultados es de 100 usuarios por búsqueda
