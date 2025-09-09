// variables de entorno
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();
const { validarNombre, validarUsuario, validarCorreo, validarPassword, validarCURP, validarRFC
} = require("../utils/validations");

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';

// Middleware para evitar cacheo de respuestas
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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
    ROL
  } = req.body;

  // Sanitización básica
  NOMBRE = typeof NOMBRE === 'string' ? NOMBRE.trim().toUpperCase() : '';
  APELLIDO_PATERNO = typeof APELLIDO_PATERNO === 'string' ? APELLIDO_PATERNO.trim().toUpperCase() : '';
  APELLIDO_MATERNO = typeof APELLIDO_MATERNO === 'string' ? APELLIDO_MATERNO.trim().toUpperCase() : '';
  USUARIO = typeof USUARIO === 'string' ? USUARIO.trim().toUpperCase() : '';
  CONTRASENA = typeof CONTRASENA === 'string' ? CONTRASENA : '';
  CORREO = typeof CORREO === 'string' ? CORREO.trim() : '';
  CURP = typeof CURP === 'string' ? CURP.trim().toUpperCase() : '';
  RFC = typeof RFC === 'string' ? RFC.trim().toUpperCase() : '';

  //Revisar esto y lo de abajo(tomas)
  ROL = parseInt(ROL);

  //Validacion de que solo se inserten ROL 1, 2 o 3
  if (![1, 2, 3].includes(ROL)) {
    return res.status(400).json({ error: 'Rol inválido. Solo se permite 1 o 3.' });
  }

  // Validaciones
  const errores = [];
  if (validarNombre(NOMBRE)) errores.push(validarNombre(NOMBRE));
  if (validarNombre(APELLIDO_PATERNO)) errores.push(validarNombre(APELLIDO_PATERNO));
  if (APELLIDO_MATERNO && validarNombre(APELLIDO_MATERNO)) errores.push(validarNombre(APELLIDO_MATERNO));
  if (validarUsuario(USUARIO)) errores.push(validarUsuario(USUARIO));
  if (validarPassword(CONTRASENA)) errores.push(validarPassword(CONTRASENA));
  if (validarCorreo(CORREO)) errores.push(validarCorreo(CORREO));
  if (validarCURP(CURP)) errores.push(validarCURP(CURP));
  if (validarRFC(RFC)) errores.push(validarRFC(RFC));

  //Validacion de que solo se inserten ROL 1, 2 o 3
  if (![1, 2, 3].includes(ROL)) {
    return res.status(400).json({ error: 'Rol inválido. Solo se permite 1, 2 y 3.' });
  }
  // Si hay errores, responder con todos los errores encontrados
  //if (errores.length > 0) {
  //return res.status(400).json({ error: errores.join(" | ") });
  //}

  // REGISTRO
  try {
    // Verificar si USUARIO, CORREO, CURP o RFC ya existen
    const checkQuery = `
      SELECT 1 FROM personal
      WHERE USUARIO = $1 OR CORREO = $2 OR CURP = $3 OR RFC = $4
    `;

    // Consulta para verificar existencia
    const checkResult = await pool.query(checkQuery, [USUARIO, CORREO, CURP, RFC]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Usuario, correo, CURP o RFC ya existen, intente con otros datos.' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(CONTRASENA, 10);

    // Insertar usuario
    const insertQuery = `
      INSERT INTO personal (
  NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO,
  USUARIO, CONTRASENA, CORREO, CURP, RFC, ROL
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id_personal, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, USUARIO, CORREO, CURP, RFC, ROL
    `;

    // Arreglo de valores para la consulta
    const values = [
      NOMBRE,
      APELLIDO_PATERNO,
      APELLIDO_MATERNO || null,
      USUARIO,
      hashedPassword,
      CORREO,
      CURP,
      RFC,
      ROL
    ];

    // Ejecutar la consulta de inserción
    const insertResult = await pool.query(insertQuery, values);
    const user = insertResult.rows[0];

    // Respuesta exitosa o error según el resultado
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

  // consulta para actualizar
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
    // Consulta SQL para actualizar datos
    const result = await pool.query(updateQuery, [
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      curp,
      rfc,
      id
    ]);
    // mensaje si no se encuentra el usuario
    res.json({ user: result.rows[0] });
  } catch (error) { // Manejo de errores
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar los datos.' });
  }
});

// Login usuario
router.post('/login', async (req, res) => {
  let { USUARIO, CONTRASENA } = req.body;

  // Sanitización básica
  USUARIO = typeof USUARIO === 'string' ? USUARIO.trim().toUpperCase() : '';
  CONTRASENA = typeof CONTRASENA === 'string' ? CONTRASENA : '';

  // Validación de campos obligatorios
  if (!USUARIO) {
    return res.status(400).json({ error: 'El usuario es requerido.' });
  }
  if (!CONTRASENA) {
    return res.status(400).json({ error: 'La contraseña es requerida.' });
  }

  // Validar formato de USUARIO
  if (!/^[A-Z0-9_]{4,30}$/.test(USUARIO)) {
    return res.status(400).json({ error: 'Usuario inválido. Debe tener entre 4 y 30 caracteres alfanuméricos o guion bajo en mayúsculas.' });
  }

  // Proceso de login
  try { // consulta para obtener usuario
    console.log('Buscando usuario:', USUARIO);
    const query = 'SELECT * FROM personal WHERE USUARIO = $1';
    const result = await pool.query(query, [USUARIO]);

    // mensaje  si hay credenciales inválidas
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu usuario.' });
    }

    // Obtener el usuario encontrado
    const user = result.rows[0];

    // Comparar contraseñas
    const match = await bcrypt.compare(CONTRASENA, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu contraseña.' });
    }

    // Generar token JWT
    const tokenPayload = { id_personal: user.id_personal, rol: user.rol };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // Respuesta exitosa con token y datos del usuario
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
        rol: user.rol,
        foto_perfil: user.foto_perfil
      },
    });

    // si hay un error en el proceso
  } catch (error) {// Manejo de errores
    console.error('Error en login:', error.stack);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos.' });
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });
  // manejo del token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Middleware para verificar si el usuario es Jefe o Usuario tipo 2
function isJefeOUsuario2(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (![2, 3].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado: solo Jefe o Usuario tipo 2' });
  }
  next();
}

// Ruta para obtener datos del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {// consulta para obtener datos del usuario
    const query = `SELECT id_personal, nombre, apellido_paterno, apellido_materno, 
    usuario, correo, curp, rfc, foto_perfil
                   FROM personal WHERE id_personal = $1`;
    const result = await pool.query(query, [req.user.id_personal]);
    // mensaje si no se encuentra el usuario
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // manejo de errores
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear Jefe (solo bootstrap inicial o si ya hay un jefe logueado)
router.post('/crear-jefe', async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, usuario, contrasena, correo, curp, rfc } = req.body;

  try {
    // Verificar si ya existe un jefe
    const jefeExistente = await pool.query(`SELECT * FROM personal WHERE rol = 3 LIMIT 1`);
    if (jefeExistente.rows.length > 0) {
      return res.status(403).json({ error: 'Ya existe un Jefe, use el login para autenticarse.' });
    }
    // Validaciones mínimas (puedes agregar más si quieres)
    if (!usuario || !contrasena || !correo) {
      return res.status(400).json({ error: 'Usuario, contraseña y correo son requeridos.' });
    }
    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar como rol = 3
    const query = `
      INSERT INTO personal (nombre, apellido_paterno, apellido_materno, usuario, contrasena, correo, curp, rfc, rol)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,3)
      RETURNING id_personal, nombre, apellido_paterno, apellido_materno, usuario, correo, curp, rfc, rol
    `;// Consulta SQL para insertar jefe
    const result = await pool.query(query, [
      nombre, apellido_paterno, apellido_materno || null, usuario, hashedPassword, correo, curp, rfc
    ]);
    // Respuesta exitosa o error según el resultado
    res.status(201).json({ message: 'Jefe creado con éxito', jefe: result.rows[0] });
  } catch (error) {
    console.error('Error al crear Jefe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Obtener usuarios por rol (solo Jefe)
router.get('/rol/:rol', authenticateToken, isJefeOUsuario2, async (req, res) => {
  const { rol } = req.params;

  try { // consulta para obtener usuarios por rol
    const query = `
      SELECT id_personal, nombre, apellido_paterno, apellido_materno,
             usuario, correo, curp, rfc, rol, foto_perfil
      FROM personal
      WHERE rol = $1 
      ORDER BY apellido_paterno ASC, apellido_materno ASC, nombre ASC
    `;
    // Ejecutar consulta
    const result = await pool.query(query, [rol]);
    // Agregar documentos académicos a cada usuario
    const usuariosConDocs = await Promise.all(result.rows.map(async (user) => {
      const docsQuery = `
        SELECT id, tipo, archivo, cotejado 
        FROM documentos_academicos 
        WHERE id_personal = $1
      `;
      // Consulta para obtener documentos
      const docsResult = await pool.query(docsQuery, [user.id_personal]);
      return {
        ...user,
        documentos: docsResult.rows // objetos con id, tipo, archivo, cotejado
      };
    }));
    // Responder con usuarios y sus documentos
    res.json(usuariosConDocs);
  } catch (error) {// Manejo de errores
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Obtener información completa de un usuario (perfil + documentos)
router.get('/usuarios/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener datos del usuario
    const userResult = await pool.query(
      `SELECT id_personal, nombre, apellido_paterno, apellido_materno,
              usuario, correo, curp, rfc, rol, foto_perfil
       FROM personal
       WHERE id_personal = $1`,
      [id]
    );
    // mensaje si no se encuentra el usuario
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Obtener el usuario
    const user = userResult.rows[0];

    // Obtener documentos del usuario
    const docsResult = await pool.query(
      `SELECT id, tipo, archivo, cotejado, fecha_subida
       FROM documentos_academicos
       WHERE id_personal = $1`,
      [id]
    );
    // Responder con datos del usuario y sus documentos
    res.json({
      ...user,
      documentos: docsResult.rows
    });
  } catch (error) {// Manejo de errores
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Buscar usuarios por nombre o apellido
router.get("/buscar", async (req, res) => {
  const { nombre } = req.query;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "Falta el parámetro 'nombre'" });
  }

  try {// consulta para buscar usuarios
    const searchTerm = `%${nombre}%`;

    const result = await pool.query(
      `SELECT * FROM PERSONAL
   WHERE rol = 1 AND (
     nombre ILIKE $1
     OR apellido_paterno ILIKE $1
     OR apellido_materno ILIKE $1
     OR curp ILIKE $1
     OR rfc ILIKE $1
   )
   ORDER BY apellido_paterno ASC, apellido_materno ASC, nombre ASC
   LIMIT 50`,
      [searchTerm]
    );
    // Responder con resultados
    res.json(result.rows);
  } catch (error) {// Manejo de errores
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router;