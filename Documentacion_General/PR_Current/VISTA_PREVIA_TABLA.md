# Vista Previa - Nueva Tabla de Resultados de Búsqueda

## Diseño de la Tabla

La nueva tabla de resultados muestra la información de manera organizada y escalable:

### Estructura Visual

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Resultados de la búsqueda (X candidatos encontrados)                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │ Usuario        │ Nombre Completo    │ Total Docs │ Certificados │ Verificados │ Tipos de Documentos  │ │
│  ├───────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│  │ [IMG] @juanp   │ Juan Pérez López   │     5      │      2       │      3      │ [Licenciatura]       │ │
│  │                │                    │            │              │             │ [Maestría] +1 más    │ │
│  │                │                    │            │              │             │                      │ │
│  ├───────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│  │ [IMG] @marial  │ María López García │     8      │      5       │      7      │ [Certificado]        │ │
│  │                │                    │            │              │             │ [Diplomado] +3 más   │ │
│  ├───────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│  │ [IMG] @carlosm │ Carlos Martínez R. │     3      │      1       │      2      │ [Licenciatura]       │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Columnas de la Tabla

### 1. Usuario
- **Contenido**: Foto de perfil (40x40px, circular) + nombre de usuario
- **Ejemplo**: 🟣 @juanperez
- **Alineación**: Izquierda

### 2. Nombre Completo
- **Contenido**: Nombre completo del candidato en negrita
- **Ejemplo**: **Juan Pérez López**
- **Alineación**: Izquierda

### 3. Total Docs
- **Contenido**: Badge azul con el número total de documentos
- **Ejemplo**: 🔵 5
- **Alineación**: Centro
- **Estilo**: `badge bg-info`

### 4. Certificados
- **Contenido**: Badge verde con el número de certificados
- **Ejemplo**: 🟢 2
- **Alineación**: Centro
- **Estilo**: `badge bg-success`

### 5. Verificados
- **Contenido**: Badge azul con el número de documentos verificados
- **Ejemplo**: 🔵 3
- **Alineación**: Centro
- **Estilo**: `badge bg-primary`

### 6. Tipos de Documentos
- **Contenido**: Badges grises mostrando hasta 3 tipos de documentos + indicador si hay más
- **Ejemplo**: 
  - [Licenciatura] [Maestría] [Certificado]
  - [Diplomado] [Curso] +2 más
- **Alineación**: Izquierda
- **Estilo**: `badge bg-secondary` con `font-size: 0.7rem`

### 7. Acciones
- **Contenido**: Botón "Ver Detalles" con icono de usuario
- **Ejemplo**: 👤 Ver Detalles
- **Alineación**: Centro
- **Estilo**: `btn btn-sm btn-primary`

## Características Responsive

### Desktop (≥992px)
- Tabla completa visible con todas las columnas
- Ancho se adapta al contenedor principal
- Margen izquierdo para el sidebar

### Tablet (768px - 991px)
- Tabla con scroll horizontal si es necesario
- Todas las columnas visibles
- Sin margen para el sidebar (overlay)

### Mobile (<768px)
- Scroll horizontal habilitado automáticamente
- Tabla mantiene estructura pero requiere desplazamiento
- Contenedor con `.table-responsive` permite scroll suave

## Interactividad

### Hover en Filas
```css
.table tbody tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}
```
- Al pasar el mouse sobre una fila, cambia a color gris claro
- Cursor cambia a pointer indicando interactividad

### Click en "Ver Detalles"
- Navega a `/Usuarios/{id_personal}`
- Muestra el perfil completo del candidato

## Ventajas sobre el Diseño Anterior

### ✅ Antes (Cards)
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Usuario 1│ │ Usuario 2│ │ Usuario 3│
│          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘
```
- Los cards se mostraban en grid
- Con muchos usuarios, se extendía verticalmente
- Difícil comparar información entre usuarios
- Problemas de layout en desktop

### ✅ Ahora (Tabla)
```
┌──────────────────────────────────────┐
│ Usuario 1 │ Datos │ Info │ Acciones  │
├──────────────────────────────────────┤
│ Usuario 2 │ Datos │ Info │ Acciones  │
├──────────────────────────────────────┤
│ Usuario 3 │ Datos │ Info │ Acciones  │
└──────────────────────────────────────┘
```
- Información organizada en columnas
- Fácil comparar datos entre usuarios
- Escalable para muchos usuarios
- Layout predecible y consistente

## Código Clave

### Contenedor de la Tabla
```jsx
<div className="table-responsive">
  <table className="table table-hover align-middle">
    {/* ... */}
  </table>
</div>
```

### Fila de Usuario (Ejemplo)
```jsx
<tr key={usuario.id_personal}>
  <td>
    <div className="d-flex align-items-center">
      <img src="..." className="rounded-circle me-2" 
           style={{ width: "40px", height: "40px" }} />
      <span>@{usuario.usuario}</span>
    </div>
  </td>
  <td><strong>{usuario.nombre} {usuario.apellido_paterno}</strong></td>
  <td className="text-center">
    <span className="badge bg-info">{usuario.total_documentos || 0}</span>
  </td>
  {/* ... más columnas ... */}
</tr>
```

## Testing Manual Recomendado

Para verificar el correcto funcionamiento:

1. **Con 1 Usuario**: Verificar que se muestre correctamente sin extenderse
2. **Con 5-10 Usuarios**: Verificar scroll vertical suave
3. **Con 20+ Usuarios**: Verificar rendimiento y usabilidad
4. **En Desktop**: Verificar que no se rompa el layout
5. **En Tablet**: Verificar scroll horizontal si es necesario
6. **En Mobile**: Verificar `.table-responsive` funcionando

## Mejoras Futuras (Opcional)

- Paginación para grandes cantidades de resultados
- Ordenamiento por columnas (click en header)
- Filtros adicionales en tiempo real
- Exportar resultados a CSV/Excel
- Vista de detalle rápida (modal) sin navegación
