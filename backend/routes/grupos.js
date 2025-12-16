const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';

// Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Middleware para verificar si es administrador
function isAdmin(req, res, next) {
  if (![3, 4].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores (rol 3 o 4)' });
  }
  next();
}

// 📌 Crear nuevo grupo (solo admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { nombre, descripcion, id_supervisor } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del grupo es requerido' });
  }

  try {
    // Verificar que el supervisor existe y es rol 2
    if (id_supervisor) {
      const supervisorCheck = await pool.query(
        'SELECT id_personal, rol FROM personal WHERE id_personal = $1',
        [id_supervisor]
      );
      if (supervisorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Supervisor no encontrado' });
      }
      if (supervisorCheck.rows[0].rol !== 2) {
        return res.status(400).json({ error: 'El usuario asignado no es supervisor' });
      }
    }

    const result = await pool.query(
      `INSERT INTO grupos (nombre, descripcion, id_supervisor) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [nombre, descripcion || null, id_supervisor || null]
    );

    res.status(201).json({ message: 'Grupo creado exitosamente', grupo: result.rows[0] });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un grupo con ese nombre' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Obtener todos los grupos (admin y supervisores)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT g.*, 
             p.nombre as supervisor_nombre, 
             p.apellido_paterno as supervisor_apellido_paterno,
             p.apellido_materno as supervisor_apellido_materno,
             COUNT(gm.id_personal) as total_miembros
      FROM grupos g
      LEFT JOIN personal p ON g.id_supervisor = p.id_personal
      LEFT JOIN grupo_miembros gm ON g.id_grupo = gm.id_grupo
    `;

    // Si es supervisor, solo ver su grupo
    if (req.user.rol === 2) {
      query += ` WHERE g.id_supervisor = $1`;
    }

    query += ` GROUP BY g.id_grupo, p.nombre, p.apellido_paterno, p.apellido_materno
               ORDER BY g.fecha_creacion DESC`;

    const result = req.user.rol === 2 
      ? await pool.query(query, [req.user.id_personal])
      : await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Obtener un grupo específico con sus miembros
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener datos del grupo
    const grupoResult = await pool.query(
      `SELECT g.*, 
              p.nombre as supervisor_nombre, 
              p.apellido_paterno as supervisor_apellido_paterno,
              p.apellido_materno as supervisor_apellido_materno,
              p.usuario as supervisor_usuario
       FROM grupos g
       LEFT JOIN personal p ON g.id_supervisor = p.id_personal
       WHERE g.id_grupo = $1`,
      [id]
    );

    if (grupoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const grupo = grupoResult.rows[0];

    // Verificar permisos: admin ve todo, supervisor solo su grupo
    if (req.user.rol === 2 && grupo.id_supervisor !== req.user.id_personal) {
      return res.status(403).json({ error: 'No tienes acceso a este grupo' });
    }

    // Obtener miembros del grupo
    const miembrosResult = await pool.query(
      `SELECT gm.id_miembro, gm.fecha_asignacion,
              p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
              p.usuario, p.correo, p.curp, p.rfc
       FROM grupo_miembros gm
       JOIN personal p ON gm.id_personal = p.id_personal
       WHERE gm.id_grupo = $1
       ORDER BY p.apellido_paterno, p.apellido_materno, p.nombre`,
      [id]
    );

    grupo.miembros = miembrosResult.rows;

    res.json(grupo);
  } catch (error) {
    console.error('Error al obtener grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Actualizar grupo (solo admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_supervisor, activo } = req.body;

  try {
    // Verificar supervisor si se proporciona
    if (id_supervisor) {
      const supervisorCheck = await pool.query(
        'SELECT id_personal, rol FROM personal WHERE id_personal = $1',
        [id_supervisor]
      );
      if (supervisorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Supervisor no encontrado' });
      }
      if (supervisorCheck.rows[0].rol !== 2) {
        return res.status(400).json({ error: 'El usuario asignado no es supervisor' });
      }
    }

    const result = await pool.query(
      `UPDATE grupos 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           id_supervisor = COALESCE($3, id_supervisor),
           activo = COALESCE($4, activo)
       WHERE id_grupo = $5
       RETURNING *`,
      [nombre, descripcion, id_supervisor, activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json({ message: 'Grupo actualizado exitosamente', grupo: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un grupo con ese nombre' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Eliminar grupo (solo admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM grupos WHERE id_grupo = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json({ message: 'Grupo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Agregar miembro al grupo (admin o supervisor del grupo)
router.post('/:id/miembros', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { id_personal } = req.body;

  if (!id_personal) {
    return res.status(400).json({ error: 'ID del personal es requerido' });
  }

  try {
    // Verificar permisos
    const grupoCheck = await pool.query(
      'SELECT id_supervisor FROM grupos WHERE id_grupo = $1',
      [id]
    );

    if (grupoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    // Solo admin o supervisor del grupo pueden agregar miembros
    if (req.user.rol !== 3 && grupoCheck.rows[0].id_supervisor !== req.user.id_personal) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este grupo' });
    }

    // Verificar que el personal existe y es rol 1
    const personalCheck = await pool.query(
      'SELECT id_personal, rol FROM personal WHERE id_personal = $1',
      [id_personal]
    );

    if (personalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (personalCheck.rows[0].rol !== 1) {
      return res.status(400).json({ error: 'Solo se pueden agregar usuarios con rol 1 (trabajadores)' });
    }

    // Agregar al grupo
    const result = await pool.query(
      `INSERT INTO grupo_miembros (id_grupo, id_personal) 
       VALUES ($1, $2) 
       RETURNING *`,
      [id, id_personal]
    );

    res.status(201).json({ message: 'Miembro agregado exitosamente', miembro: result.rows[0] });
  } catch (error) {
    console.error('Error al agregar miembro:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El usuario ya es miembro de este grupo' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Quitar miembro del grupo (admin o supervisor del grupo)
router.delete('/:id/miembros/:id_personal', authenticateToken, async (req, res) => {
  const { id, id_personal } = req.params;

  try {
    // Verificar permisos
    const grupoCheck = await pool.query(
      'SELECT id_supervisor FROM grupos WHERE id_grupo = $1',
      [id]
    );

    if (grupoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    // Solo admin o supervisor del grupo pueden quitar miembros
    if (req.user.rol !== 3 && grupoCheck.rows[0].id_supervisor !== req.user.id_personal) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este grupo' });
    }

    const result = await pool.query(
      `DELETE FROM grupo_miembros 
       WHERE id_grupo = $1 AND id_personal = $2 
       RETURNING *`,
      [id, id_personal]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'El usuario no es miembro de este grupo' });
    }

    res.json({ message: 'Miembro eliminado del grupo exitosamente' });
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Obtener usuarios disponibles para agregar al grupo (no están en el grupo)
router.get('/:id/disponibles', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
              p.usuario, p.correo, p.curp
       FROM personal p
       WHERE p.rol = 1 
         AND p.id_personal NOT IN (
           SELECT id_personal FROM grupo_miembros WHERE id_grupo = $1
         )
       ORDER BY p.apellido_paterno, p.apellido_materno, p.nombre`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
