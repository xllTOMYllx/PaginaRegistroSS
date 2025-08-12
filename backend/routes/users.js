const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

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
  let {
    NOMBRE,
    APELLIDO_PATERNO,
    APELLIDO_MATERNO,
    USUARIO,
    CONTRASENA,
    CORREO,
    CURP,
    RFC,
  } = req.body;

  // Sanitización básica
  NOMBRE = typeof NOMBRE === 'string' ? NOMBRE.trim() : '';
  APELLIDO_PATERNO = typeof APELLIDO_PATERNO === 'string' ? APELLIDO_PATERNO.trim() : '';
  APELLIDO_MATERNO = typeof APELLIDO_MATERNO === 'string' ? APELLIDO_MATERNO.trim() : '';
  USUARIO = typeof USUARIO === 'string' ? USUARIO.trim() : '';
  CONTRASENA = typeof CONTRASENA === 'string' ? CONTRASENA : '';
  CORREO = typeof CORREO === 'string' ? CORREO.trim() : '';
  CURP = typeof CURP === 'string' ? CURP.trim().toUpperCase() : '';
  RFC = typeof RFC === 'string' ? RFC.trim().toUpperCase() : '';

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

  // Validar longitud y formato de los campos
  if (NOMBRE.length > 50 || APELLIDO_PATERNO.length > 50 || (APELLIDO_MATERNO && APELLIDO_MATERNO.length > 50)) {
    return res.status(400).json({ error: 'Nombre o apellidos demasiado largos.' });
  }
  if (!/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(NOMBRE) || !/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(APELLIDO_PATERNO)) {
    return res.status(400).json({ error: 'Nombre y apellido paterno solo deben contener letras.' });
  }
  if (APELLIDO_MATERNO && !/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(APELLIDO_MATERNO)) {
    return res.status(400).json({ error: 'Apellido materno solo debe contener letras.' });
  }
  if (!/^[a-zA-Z0-9_]{4,30}$/.test(USUARIO)) {
    return res.status(400).json({ error: 'Usuario inválido. Debe tener entre 4 y 30 caracteres alfanuméricos o guion bajo.' });
  }
  if (!validator.isStrongPassword(CONTRASENA, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.' });
  }
  if (!validator.isEmail(CORREO)) {
    return res.status(400).json({ error: 'Correo electrónico no válido.' });
  }
  if (!/^[A-Z]{4}\d{6}[A-Z0-9]{8}$/.test(CURP)) {
    return res.status(400).json({ error: 'CURP no válido.' });
  }
  if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(RFC)) {
    return res.status(400).json({ error: 'RFC no válido.' });
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com|outlook.com)$/;
  if (!emailRegex.test(CORREO)) {
    return res.status(400).json({ error: 'Solo se permiten correos de @gmail.com. @hotmail.com o @outlook.com' });
  }

   try {
    // Verificar si USUARIO, CORREO, CURP o RFC ya existen
    const checkQuery = `
      SELECT 1 FROM personal
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

// Actualizar datos personales
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    rfc,
    correo
  } = req.body;
 console.log('Datos recibidos para actualizar:', req.body);
  try {
    const updateQuery = `
      UPDATE personal
      SET nombre = $1,
          apellido_paterno = $2,
          apellido_materno = $3,
          correo = $4,
          curp = $5,
          rfc = $6
      WHERE id_personal = $7
      RETURNING id_personal, nombre, apellido_paterno, apellido_materno, usuario, correo, curp, rfc
    `;
    const result = await pool.query(updateQuery, [
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      curp,
      rfc,
      id
    ]);

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar los datos.' });
  }
});



// Login usuario
router.post('/login', async (req, res) => {
  let { USUARIO, CONTRASENA } = req.body;

  USUARIO = typeof USUARIO === 'string' ? USUARIO.trim() : '';
  CONTRASENA = typeof CONTRASENA === 'string' ? CONTRASENA : '';

  if (!USUARIO || !CONTRASENA) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  if (!/^[a-zA-Z0-9_]{4,30}$/.test(USUARIO)) {
    return res.status(400).json({ error: 'Usuario inválido.' });
  }

  try {
    console.log('Buscando usuario:', USUARIO);
    const query = 'SELECT * FROM personal WHERE USUARIO = $1';
    const result = await pool.query(query, [USUARIO]);

    console.log('Resultado de la consulta:', result.rows);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];
    console.log('Usuario encontrado:', user);

    const match = await bcrypt.compare(CONTRASENA, user.contrasena); // Cambia a CONTRASENA
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
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        usuario: user.usuario,
        correo: user.correo,
        curp: user.curp,
        rfc: user.rfc,
      },
    });
  } catch (error) {
    console.error('Error en login:', error.stack);
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
