const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
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

// Registro de usuario con validaciones y contraseña hasheada
router.post('/register', async (req, res) => {
  const {
    NOMBRE,
    APELLIDO_PATERNO,
    APELLIDO_MATERNO,
    USUARIO,
    CONTRASENA,
    CORREO,
    CURP,
    RFC,
  } = req.body;

  // Validación de campos obligatorios
  if (
    !NOMBRE ||
    !APELLIDO_PATERNO ||
    !USUARIO ||
    !CONTRASENA ||
    !CORREO ||
    !CURP ||
    !RFC
  ) {
    return res.status(400).json({ error: 'Por favor completa todos los campos obligatorios.' });
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(CORREO)) {
    return res.status(400).json({ error: 'Correo electrónico no válido.' });
  }

  try {
    // Verificar si USUARIO, CORREO, CURP o RFC ya existen
    const checkQuery = `
      SELECT * FROM personal
      WHERE USUARIO = $1 OR CORREO = $2 OR CURP = $3 OR RFC = $4
    `;
    const checkResult = await pool.query(checkQuery, [USUARIO, CORREO, CURP, RFC]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Usuario, correo, CURP o RFC ya existen.' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(CONTRASENA, 10);

    // Insertar usuario
    const insertQuery = `
      INSERT INTO personal (NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, USUARIO, CONTRASENA, CORREO, CURP, RFC)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_personal, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, USUARIO, CORREO, CURP, RFC
    `;
    const values = [
      NOMBRE,
      APELLIDO_PATERNO,
      APELLIDO_MATERNO || null,
      USUARIO,
      hashedPassword,
      CORREO,
      CURP,
      RFC,
    ];

    const insertResult = await pool.query(insertQuery, values);
    const user = insertResult.rows[0];

    res.status(201).json({ message: 'Usuario registrado', user });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login usuario
router.post('/login', async (req, res) => {
  const { USUARIO, CONTRASENA } = req.body;

  if (!USUARIO || !CONTRASENA) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const query = 'SELECT * FROM personal WHERE USUARIO = $1';
    const result = await pool.query(query, [USUARIO]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(CONTRASENA, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const tokenPayload = { id_personal: user.id_personal };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id_personal: user.id_personal,
        nombre: user.nombre,
        usuario: user.usuario,
        correo: user.correo,
        curp: user.curp,
        rfc: user.rfc,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


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

// Ruta para obtener datos del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const query = `SELECT id_personal, nombre, apellido_paterno, apellido_materno, usuario, correo, curp, rfc 
                   FROM personal WHERE id_personal = $1`;
    const result = await pool.query(query, [req.user.id_personal]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
