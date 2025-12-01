# 🔍 Búsqueda Avanzada de Candidatos - Guía Rápida

## 📋 Resumen de la Implementación

Esta función permite a los administradores (rol 3 y 4) buscar y filtrar usuarios basándose en sus habilidades, conocimientos y certificaciones registradas en el sistema.

## 🚀 Inicio Rápido

### Para Usuarios (Administradores)

1. **Acceder a la función:**
   - Iniciar sesión con un usuario de rol 3 (Jefe) o rol 4 (Admin)
   - En el sidebar, hacer click en "🔍 Búsqueda Avanzada"

2. **Realizar una búsqueda:**
   - Llenar uno o más campos de filtro
   - Click en "Buscar"
   - Revisar los resultados
   - Click en "Ver Detalles" para ver el perfil completo de un candidato

### Para Desarrolladores

1. **Verificar la implementación:**
   ```bash
   chmod +x test-implementation.sh
   ./test-implementation.sh
   ```

2. **Compilar el proyecto:**
   ```bash
   # Backend
   cd backend && npm install && node -c routes/users.js
   
   # Frontend
   cd frontend && npm install && npm run build
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## 📁 Archivos Importantes

### Código
- `backend/routes/users.js` - Endpoint de búsqueda avanzada
- `frontend/src/components/BusquedaAvanzada.jsx` - Componente principal
- `frontend/src/css/BusquedaAvanzada.css` - Estilos
- `frontend/src/utils/config.js` - Configuración de API

### Documentación
- `BUSQUEDA_AVANZADA.md` - Guía de usuario y documentación técnica
- `IMPLEMENTATION_SUMMARY.md` - Resumen detallado de la implementación
- `SECURITY_SUMMARY.md` - Análisis de seguridad
- `UI_PREVIEW.md` - Vista previa de la interfaz
- `README_FEATURE.md` - Este archivo (guía rápida)

### Pruebas
- `test-implementation.sh` - Script de verificación automática

## 🔐 Seguridad

### Controles de Acceso
- ✅ JWT Authentication requerida
- ✅ Restricción a rol 3 y 4 solamente
- ✅ Verificación en frontend Y backend
- ✅ Consultas SQL parametrizadas (sin inyección)

### Datos Protegidos
- ✅ No expone contraseñas
- ✅ Solo muestra usuarios de rol 1 y 2
- ✅ Requiere autenticación para cada request

## 📊 Funcionalidades

### Filtros Disponibles
1. **Nombre del Usuario** - Búsqueda por nombre, apellido, CURP o RFC
2. **Tipo de Documento/Habilidad** - Filtra por tipo de documento
3. **Solo Certificados** - Muestra solo usuarios con certificados
4. **Solo Verificados** - Muestra solo usuarios con documentos cotejados

### Información Mostrada
- Foto de perfil
- Nombre completo y usuario
- Total de documentos
- Número de certificados
- Número de documentos verificados
- Tipos de documentos (hasta 3 visibles)

## 🎯 Casos de Uso

### Ejemplo 1: Buscar ingeniero certificado
```
Tipo de Documento: "Ingeniero"
☑ Solo usuarios con certificados
→ Buscar
```

### Ejemplo 2: Buscar por nombre con verificación
```
Nombre: "Juan"
☑ Solo usuarios con documentos verificados
→ Buscar
```

### Ejemplo 3: Buscar todos los candidatos
```
(dejar todos los campos vacíos)
→ Buscar
```

## 🔧 API Endpoint

### Request
```http
GET /api/users/buscar-avanzado?nombre=Juan&tipoDocumento=Licenciatura&soloCertificados=true&soloVerificados=true
Authorization: Bearer <JWT_TOKEN>
```

### Response
```json
[
  {
    "id_personal": 1,
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "tipos_documentos": ["Licenciatura", "Maestría"],
    "num_certificados": 2,
    "num_documentos_verificados": 3,
    "total_documentos": 5,
    "documentos": [...]
  }
]
```

## ✅ Verificación

### Checklist de Implementación
- [x] Backend endpoint creado
- [x] Middleware de autorización implementado
- [x] Frontend component creado
- [x] Ruta agregada a App.jsx
- [x] Botón agregado al Sidebar
- [x] CSS y estilos aplicados
- [x] Configuración de API centralizada
- [x] Documentación completa
- [x] Análisis de seguridad
- [x] Script de pruebas
- [x] Build exitoso (frontend y backend)

### Estado de Pruebas
```
✓ Backend syntax check: PASS
✓ Frontend build: PASS
✓ All files present: PASS
✓ Routes configured: PASS
✓ Security analysis: PASS
```

## 📞 Soporte

### Problemas Comunes

**P: No veo el botón "Búsqueda Avanzada"**
R: Verifica que tu usuario tenga rol 3 o 4. Solo estos roles tienen acceso.

**P: Obtengo error 403 al buscar**
R: Tu sesión puede haber expirado. Cierra sesión y vuelve a iniciar sesión.

**P: No aparecen resultados**
R: Intenta ampliar los criterios de búsqueda o usa menos filtros.

**P: El backend no responde**
R: Verifica que el servidor backend esté corriendo en puerto 5000.

## 🔄 Versiones

- **v1.0.0** - Implementación inicial (2024)
  - Búsqueda por nombre
  - Filtro por tipo de documento
  - Filtro por certificados
  - Filtro por documentos verificados
  - Restricción de acceso a rol 3 y 4

## 🤝 Contribuciones

Este proyecto está en desarrollo activo. Para contribuir:

1. Revisar la documentación existente
2. Probar cambios localmente
3. Ejecutar el script de pruebas
4. Documentar nuevas funcionalidades
5. Crear pull request

## 📝 Notas Adicionales

- La búsqueda está limitada a 100 resultados por query
- Solo se pueden buscar usuarios de rol 1 (trabajadores) y rol 2 (supervisores)
- Los filtros se aplican con operador AND (todos deben cumplirse)
- La búsqueda por nombre usa ILIKE (insensible a mayúsculas)

---

**Última actualización:** 2024-12-01
**Autor:** Copilot Agent
**Revisión:** Pendiente
