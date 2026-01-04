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

// Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Middleware para verificar roles administrativos (2, 3, 4)
function requireAdminRole(req, res, next) {
  if (![2, 3, 4].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado. Solo para roles administrativos.' });
  }
  next();
}

// Obtener notificaciones no leídas (contador)
router.get('/no-leidas/contador', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    // Filtrar por jerarquía: solo mostrar notificaciones de roles inferiores
    // Rol 4 ve de roles 1,2,3 | Rol 3 ve de roles 1,2 | Rol 2 ve solo de rol 1
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM notificaciones n
       JOIN personal p ON n.id_personal = p.id_personal
       WHERE n.leido = FALSE AND p.rol < $1`,
      [req.user.rol]
    );
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (error) {
    console.error('Error al obtener contador de notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Obtener todas las notificaciones recientes (últimas 50)
router.get('/', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    // Filtrar por jerarquía: solo mostrar notificaciones de roles inferiores
    // Rol 4 ve de roles 1,2,3 | Rol 3 ve de roles 1,2 | Rol 2 ve solo de rol 1
    const result = await pool.query(`
      SELECT 
        n.id,
        n.id_personal,
        n.mensaje,
        n.leido,
        n.fecha,
        n.usuario,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.rol as rol_origen
      FROM notificaciones n
      LEFT JOIN personal p ON n.id_personal = p.id_personal
      WHERE p.rol < $1
      ORDER BY n.fecha DESC
      LIMIT 50
    `, [req.user.rol]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Marcar una notificación como leída
router.patch('/:id/leer', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE notificaciones SET leido = TRUE WHERE id = $1',
      [id]
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

// Marcar todas como leídas
router.patch('/leer-todas', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    // Solo marcar las notificaciones que el usuario puede ver (jerarquía)
    await pool.query(
      `UPDATE notificaciones n
       SET leido = TRUE
       FROM personal p
       WHERE n.id_personal = p.id_personal 
       AND n.leido = FALSE 
       AND p.rol < $1`,
      [req.user.rol]
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas:', error);
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

// Eliminar una notificación
router.delete('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notificaciones WHERE id = $1', [id]);
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
});

// Eliminar todas las notificaciones (solo las que puede ver según jerarquía)
router.delete('/', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM notificaciones n
       USING personal p
       WHERE n.id_personal = p.id_personal 
       AND p.rol < $1`,
      [req.user.rol]
    );
    res.json({ message: 'Todas las notificaciones eliminadas' });
  } catch (error) {
    console.error('Error al eliminar todas:', error);
    res.status(500).json({ error: 'Error al eliminar notificaciones' });
  }
});

// Crear notificación (uso interno desde otros endpoints)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id_personal, mensaje, usuario } = req.body;
    
    const result = await pool.query(
      `INSERT INTO notificaciones (id_personal, mensaje, usuario)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_personal, mensaje, usuario || null]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
});

module.exports = router;
