-- Tabla de notificaciones existente - No ejecutar, ya está creada
-- Estructura actual:
-- id (PK)
-- id_personal (FK a personal)
-- mensaje (TEXT)
-- fecha (TIMESTAMP)
-- leido (BOOLEAN)
-- usuario (TEXT)

-- Si necesitas crear índices para mejorar rendimiento:
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON notificaciones(leido);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(fecha DESC);
