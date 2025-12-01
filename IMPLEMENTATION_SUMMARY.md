# Implementación: Búsqueda Avanzada de Candidatos

## Resumen

Este documento describe la implementación de la función de búsqueda avanzada que permite a los administradores (rol 3 y 4) filtrar usuarios según sus habilidades, conocimientos y certificaciones registradas en el sistema.

## Cambios Implementados

### 1. Backend (backend/routes/users.js)

#### Nuevo Middleware
```javascript
function isJefeOAdmin(req, res, next)
```
- Restringe el acceso solo a usuarios con rol 3 (Jefe) o rol 4 (Admin del Sistema)
- Retorna 403 si el usuario no tiene los permisos necesarios

#### Nuevo Endpoint
```
GET /api/users/buscar-avanzado
```

**Parámetros de consulta:**
- `nombre` (opcional): Búsqueda por nombre, apellido, CURP o RFC
- `tipoDocumento` (opcional): Filtra por tipo de documento (ej: "Licenciatura", "Certificado")
- `soloCertificados` (opcional): "true" para mostrar solo usuarios con certificados
- `soloVerificados` (opcional): "true" para mostrar solo usuarios con documentos verificados

**Respuesta:**
```json
[
  {
    "id_personal": 1,
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "usuario": "JPEREZ",
    "correo": "juan@example.com",
    "rol": 1,
    "tipos_documentos": ["Licenciatura", "Certificado"],
    "num_certificados": 2,
    "num_documentos_verificados": 1,
    "total_documentos": 3,
    "documentos": [...]
  }
]
```

**Características:**
- Utiliza agregación SQL para contar documentos por tipo
- Implementa búsqueda flexible con ILIKE para coincidencias parciales
- Protege contra inyección SQL con consultas parametrizadas
- Limita resultados a 100 usuarios por búsqueda
- Solo muestra usuarios de rol 1 y 2

### 2. Frontend

#### Nuevo Componente: BusquedaAvanzada.jsx
**Ubicación:** `frontend/src/components/BusquedaAvanzada.jsx`

**Características:**
- Formulario de búsqueda con múltiples filtros
- Validación de permisos (solo rol 3 y 4)
- Tarjetas de resultados con información relevante
- Navegación directa al detalle del usuario
- Indicadores visuales de carga
- Diseño responsivo

**Estructura del formulario:**
```
┌─────────────────────────────────────┐
│  Nombre del Usuario                 │
│  [________________]                 │
│                                     │
│  Tipo de Documento/Habilidad        │
│  [________________]                 │
│                                     │
│  ☐ Solo usuarios con certificados  │
│  ☐ Solo usuarios con documentos    │
│     verificados                     │
│                                     │
│  [Buscar] [Limpiar]                 │
└─────────────────────────────────────┘
```

#### Estilos: BusquedaAvanzada.css
**Ubicación:** `frontend/src/css/BusquedaAvanzada.css`

**Características:**
- Efectos hover en tarjetas de usuarios
- Colores corporativos (#7A1737)
- Transiciones suaves
- Diseño de tarjetas consistente

#### Configuración de API: config.js
**Ubicación:** `frontend/src/utils/config.js`

**Propósito:**
- Centraliza URLs de API
- Soporta variables de entorno
- Facilita cambios de configuración

#### Actualización de Rutas: App.jsx
```javascript
<Route path="/busqueda-avanzada" element={
  <ProtectedRoute>
    <BusquedaAvanzada />
  </ProtectedRoute>
} />
```

#### Actualización de Navegación: Sidebar.jsx
```javascript
{currentAdmin && [3, 4].includes(currentAdmin.rol) && (
  <button onClick={() => navigate('/busqueda-avanzada')}>
    🔍 Búsqueda Avanzada
  </button>
)}
```

## Arquitectura de Seguridad

### Capas de Protección

1. **Frontend (Primera línea)**
   - Verificación de rol antes de renderizar
   - Redirección si no tiene permisos
   - Ocultamiento de navegación para usuarios no autorizados

2. **Backend (Defensa definitiva)**
   - Middleware `authenticateToken` (autenticación JWT)
   - Middleware `isJefeOAdmin` (autorización por rol)
   - Consultas parametrizadas (prevención de SQL injection)

3. **Base de Datos**
   - Solo consulta usuarios de rol 1 y 2
   - No expone contraseñas u otros campos sensibles
   - Usa PostgreSQL nativo para seguridad

### Flujo de Autenticación/Autorización

```
Usuario → Frontend
    ↓
¿Tiene rol 3 o 4? → No → Redirect a /homeadmin
    ↓ Sí
Muestra página de búsqueda
    ↓
Usuario hace búsqueda
    ↓
Request → Backend (con JWT token)
    ↓
authenticateToken → ¿Token válido? → No → 401 Unauthorized
    ↓ Sí
isJefeOAdmin → ¿Rol 3 o 4? → No → 403 Forbidden
    ↓ Sí
Ejecuta búsqueda → Retorna resultados
```

## Flujo de Usuario

### Acceso a la función

1. Usuario inicia sesión con rol 3 o 4
2. En el sidebar, aparece el botón "🔍 Búsqueda Avanzada"
3. Click en el botón navega a `/busqueda-avanzada`

### Uso de la búsqueda

1. **Búsqueda simple:**
   - Dejar todos los filtros vacíos
   - Click en "Buscar"
   - Muestra todos los usuarios de rol 1 y 2

2. **Búsqueda por nombre:**
   - Escribir nombre/apellido en "Nombre del Usuario"
   - Click en "Buscar"
   - Muestra usuarios que coincidan

3. **Búsqueda por habilidad:**
   - Escribir tipo de documento en "Tipo de Documento/Habilidad"
   - Ejemplo: "Licenciatura", "Maestría", "Certificado en Python"
   - Click en "Buscar"
   - Muestra solo usuarios con ese tipo de documento

4. **Búsqueda combinada:**
   - Llenar múltiples campos
   - Marcar checkboxes según necesidad
   - Click en "Buscar"
   - Resultados cumplen TODOS los criterios

### Interpretación de resultados

Cada tarjeta muestra:
- **Foto de perfil**: Identificación visual
- **Nombre completo**: Nombre y apellidos
- **Usuario**: Nombre de usuario (@usuario)
- **Total documentos**: Cantidad total de documentos subidos
- **Certificados**: Cuántos son certificados
- **Verificados**: Cuántos han sido cotejados
- **Tipos de documentos**: Lista de hasta 3 tipos (+ indicador si hay más)
- **Botón "Ver Detalles"**: Navega al perfil completo del usuario

## Casos de Uso Reales

### Caso 1: Buscar ingeniero con certificación
**Objetivo:** Encontrar un empleado con certificación en un área específica

**Pasos:**
1. Ir a Búsqueda Avanzada
2. Tipo de Documento: "Ingeniero"
3. Marcar "Solo usuarios con certificados"
4. Buscar
5. Revisar resultados y seleccionar candidato

### Caso 2: Buscar personal con estudios verificados
**Objetivo:** Encontrar candidatos con documentación validada

**Pasos:**
1. Ir a Búsqueda Avanzada
2. Marcar "Solo usuarios con documentos verificados"
3. Buscar
4. Obtener lista de usuarios con documentos cotejados

### Caso 3: Buscar por nombre y especialidad
**Objetivo:** Encontrar un empleado específico con cierta formación

**Pasos:**
1. Ir a Búsqueda Avanzada
2. Nombre del Usuario: "Juan"
3. Tipo de Documento: "Maestría"
4. Buscar
5. Filtrar resultados por nombre y formación

## Pruebas Realizadas

### Pruebas de Integración
✅ Build del frontend exitoso
✅ Sintaxis del backend correcta
✅ Todas las rutas configuradas
✅ Navegación agregada al sidebar
✅ Documentación completa

### Pruebas de Seguridad (CodeQL)
✅ Sin inyección SQL (uso de consultas parametrizadas)
✅ Autenticación y autorización correctas
✅ Sin exposición de datos sensibles
⚠️ Rate limiting pendiente (issue pre-existente del proyecto)

### Pruebas Manuales Recomendadas
- [ ] Probar búsqueda sin filtros
- [ ] Probar búsqueda por nombre
- [ ] Probar búsqueda por tipo de documento
- [ ] Probar checkboxes de certificados y verificados
- [ ] Probar combinación de múltiples filtros
- [ ] Verificar que rol 1 y 2 NO pueden acceder
- [ ] Verificar que rol 3 SÍ puede acceder
- [ ] Verificar navegación al detalle de usuario

## Archivos Modificados/Creados

### Backend
- ✏️ `backend/routes/users.js` (modificado)

### Frontend
- ➕ `frontend/src/components/BusquedaAvanzada.jsx` (nuevo)
- ➕ `frontend/src/css/BusquedaAvanzada.css` (nuevo)
- ➕ `frontend/src/utils/config.js` (nuevo)
- ✏️ `frontend/src/App.jsx` (modificado)
- ✏️ `frontend/src/components/Sidebar.jsx` (modificado)

### Documentación
- ➕ `BUSQUEDA_AVANZADA.md` (nuevo)
- ➕ `SECURITY_SUMMARY.md` (nuevo)
- ➕ `IMPLEMENTATION_SUMMARY.md` (nuevo - este archivo)
- ➕ `test-implementation.sh` (nuevo)

## Próximos Pasos (Opcional)

### Mejoras Futuras
1. **Búsqueda por contenido de PDF**: Implementar OCR o extracción de texto
2. **Filtros adicionales**: Fecha de subida, estado del documento
3. **Exportación de resultados**: CSV, Excel
4. **Guardar búsquedas**: Permitir guardar criterios de búsqueda frecuentes
5. **Ordenamiento personalizado**: Por nombre, fecha, cantidad de documentos

### Optimizaciones
1. **Cache de resultados**: Implementar Redis para búsquedas frecuentes
2. **Paginación**: Para manejar más de 100 resultados
3. **Rate limiting**: Implementar proyecto-wide

## Conclusión

La función de búsqueda avanzada ha sido implementada exitosamente con:
- ✅ Restricción de acceso a rol 3 y 4
- ✅ Múltiples filtros de búsqueda
- ✅ Interfaz intuitiva y responsiva
- ✅ Seguridad robusta
- ✅ Documentación completa
- ✅ Código limpio y mantenible

El sistema permite a los administradores encontrar rápidamente candidatos óptimos basándose en sus habilidades y conocimientos registrados.
