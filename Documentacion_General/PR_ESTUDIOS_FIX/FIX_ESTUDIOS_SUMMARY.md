# Fix: Campo "Estudios" no se guardaba en la base de datos

## Problema Identificado

Al editar la información de un usuario con rol 1 desde otro usuario administrador, todos los campos se actualizaban correctamente **excepto el campo "estudios"**. El valor no se guardaba en la base de datos ni se actualizaba en la página Home del usuario.

## Causa Raíz

El endpoint de actualización de usuario en el backend (`PUT /api/users/:id`) no incluía el campo `estudios` en la consulta SQL UPDATE, a pesar de que:

1. ✅ El frontend enviaba el campo `estudios` en el cuerpo de la petición
2. ✅ La base de datos tiene la columna `estudios` en la tabla `personal`
3. ✅ La página Home muestra el campo `estudios` del usuario

## Solución Implementada

### Archivo Modificado: `backend/routes/users.js`

**Línea 174**: Se agregó `estudios` a la desestructuración del cuerpo de la petición:
```javascript
const {
  nombre,
  apellido_paterno,
  apellido_materno,
  curp,
  rfc,
  correo,
  estudios  // ← AGREGADO
} = req.body;
```

**Línea 186**: Se agregó `estudios` al UPDATE SET:
```javascript
UPDATE personal
SET nombre = $1,
    apellido_paterno = $2,
    apellido_materno = $3,
    correo = $4,
    curp = $5,
    rfc = $6,
    estudios = $7  // ← AGREGADO
WHERE id_personal = $8  // ← ACTUALIZADO de $7 a $8
```

**Línea 188**: Se agregó `estudios` a la cláusula RETURNING:
```javascript
RETURNING id_personal, nombre, apellido_paterno, apellido_materno, usuario, correo, curp, rfc, estudios
```

**Línea 199**: Se agregó el valor de `estudios` al array de parámetros:
```javascript
const result = await pool.query(updateQuery, [
  nombre,
  apellido_paterno,
  apellido_materno,
  correo,
  curp,
  rfc,
  estudios,  // ← AGREGADO
  id
]);
```

## Flujo de Datos Completo

### 1. Frontend - EditarUsuario.jsx
- El formulario incluye un campo select para "estudios" con opciones: Primaria, Secundaria, Preparatoria, Licenciatura, Maestría, Doctorado, Prefiero no decirlo
- Al enviar el formulario, se incluye `estudios` en el objeto `formData`
- Se envía la petición: `axios.put('/api/users/:id', formData)`

### 2. Backend - routes/users.js
- Recibe el campo `estudios` del body
- Actualiza la base de datos incluyendo el campo `estudios`
- Devuelve el usuario actualizado con el campo `estudios`

### 3. Base de Datos - PostgreSQL
- La tabla `personal` tiene la columna `estudios VARCHAR(50)`
- El valor se guarda correctamente en la base de datos

### 4. Frontend - Home.jsx
- Recibe el usuario actualizado con el campo `estudios`
- Muestra el valor actualizado en la interfaz

## Resultado

✅ Ahora cuando un usuario edita su información:
1. El campo "estudios" se guarda correctamente en la base de datos
2. El valor actualizado se muestra en la página Home
3. Los cambios persisten entre sesiones
4. No se afecta ninguna otra funcionalidad existente

## Verificaciones Realizadas

- ✅ Revisión de código: Sin problemas encontrados
- ✅ Escaneo de seguridad (CodeQL): Sin vulnerabilidades detectadas
- ✅ Flujo de datos verificado de extremo a extremo
- ✅ Sin cambios que rompan la funcionalidad existente

## Archivos Afectados

- `backend/routes/users.js` - Endpoint de actualización de usuario (líneas 164-205)

## Notas Adicionales

El campo `estudios` fue agregado a la base de datos mediante la migración `Database/migration_add_estudios.sql` y siempre ha estado disponible en el frontend. Esta corrección completa la funcionalidad permitiendo que los cambios se guarden correctamente en la base de datos.
