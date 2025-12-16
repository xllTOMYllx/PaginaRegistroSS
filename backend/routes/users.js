// variables de entorno
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const crypto = require('crypto');
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
router.post('/register', authenticateToken, async (req, res) => {

  let {
    NOMBRE,
    APELLIDO_PATERNO,
    APELLIDO_MATERNO,
    USUARIO,
    CONTRASENA,
    CORREO,
    CURP,
    RFC,
    ESTUDIOS,
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
  ESTUDIOS = typeof ESTUDIOS === 'string' ? ESTUDIOS.trim().toUpperCase() : '';

  //Revisar esto y lo de abajo(tomas)
  ROL = parseInt(ROL);

  // Permisos de creación según rol autenticado
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    // Rol 2 (Supervisor) solo puede crear usuarios de rol 1
    if (req.user.rol === 2) {
      ROL = 1; // forzar creación como rol 1 sin importar lo que envíe el cliente
    } else if (![3, 4].includes(req.user.rol)) {
      // Otros roles no pueden crear
      return res.status(403).json({ error: 'Acceso denegado: no tienes permisos para crear usuarios' });
    }
  } catch (permErr) {
    return res.status(500).json({ error: 'Error al validar permisos' });
  }

  //Validacion de que solo se inserten ROL 1, 2, 3 o 4
  if (![1, 2, 3, 4].includes(ROL)) {
    return res.status(400).json({ error: 'Rol inválido. Solo se permite 1, 2, 3 o 4.' });
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

  //Validacion de que solo se inserten ROL 1, 2, 3 o 4
  if (![1, 2, 3, 4].includes(ROL)) {
    return res.status(400).json({ error: 'Rol inválido. Solo se permite 1, 2, 3 o 4.' });
  }
  // Si hay errores, responder con todos los errores encontrados
  //if (errores.length > 0) {
  //return res.status(400).json({ error: errores.join(" | ") });
  //}

  // REGISTRO
  try {
    // Verificar si USUARIO, CORREO, CURP o RFC ya existen
    const checkQuery = `
      SELECT USUARIO, CORREO, CURP, RFC FROM personal
      WHERE USUARIO = $1 OR CORREO = $2 OR CURP = $3 OR RFC = $4
    `;

    // Consulta para verificar existencia
    const checkResult = await pool.query(checkQuery, [USUARIO, CORREO, CURP, RFC]);
    if (checkResult.rows.length > 0) {
      const row = checkResult.rows[0];
      let mensaje = 'No se puede registrar porque ya existe:';
      if (row.usuario === USUARIO) mensaje += ' el usuario,';
      if (row.correo === CORREO) mensaje += ' el correo,';
      if (row.curp === CURP) mensaje += ' la CURP,';
      if (row.rfc === RFC) mensaje += ' el RFC,';
      mensaje = mensaje.slice(0, -1) + '.'; // Quitar la última coma
      return res.status(400).json({ error: mensaje });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(CONTRASENA, 10);

    // Insertar usuario
    const insertQuery = `
      INSERT INTO personal (
  NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO,
  USUARIO, CONTRASENA, CORREO, CURP, RFC, ESTUDIOS, ROL
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id_personal, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, USUARIO, CORREO, CURP, RFC, ESTUDIOS, ROL
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
      ESTUDIOS || null,
      ROL
    ];

    // Ejecutar la consulta de inserción
    const insertResult = await pool.query(insertQuery, values);
    const user = insertResult.rows[0];

    // Respuesta exitosa o error según el resultado
    res.status(201).json({ message: 'Usuario registrado', user });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    // Manejar errores de duplicación
    if (error.code === '23505') { // Violación de restricción única
      let mensaje = 'No se puede registrar porque ya existe';
      if (error.constraint === 'personal_correo_key') {
        mensaje = `El correo ${error.detail.match(/\((.*?)\)/)[1]} ya está registrado.`;
      } else if (error.constraint === 'personal_usuario_key') {
        mensaje = 'El nombre de usuario ya está registrado.';
      } else if (error.constraint === 'personal_curp_key') {
        mensaje = 'La CURP ya está registrada.';
      } else if (error.constraint === 'personal_rfc_key') {
        mensaje = 'El RFC ya está registrado.';
      }
      return res.status(400).json({ error: mensaje });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar datos personales
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  let {
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    rfc,
    correo,
    estudios
  } = req.body;

  // Normalize fields to UPPERCASE for consistency
  nombre = typeof nombre === 'string' ? nombre.trim().toUpperCase() : nombre;
  apellido_paterno = typeof apellido_paterno === 'string' ? apellido_paterno.trim().toUpperCase() : apellido_paterno;
  apellido_materno = typeof apellido_materno === 'string' ? apellido_materno.trim().toUpperCase() : apellido_materno;
  curp = typeof curp === 'string' ? curp.trim().toUpperCase() : curp;
  rfc = typeof rfc === 'string' ? rfc.trim().toUpperCase() : rfc;
  estudios = typeof estudios === 'string' ? estudios.trim().toUpperCase() : estudios;

  // consulta para actualizar
  try {
    const updateQuery = `
      UPDATE personal
      SET nombre = $1,
          apellido_paterno = $2,
          apellido_materno = $3,
          correo = $4,
          curp = $5,
          rfc = $6,
          estudios = $7
      WHERE id_personal = $8
      RETURNING id_personal, nombre, apellido_paterno, apellido_materno, usuario, correo, curp, rfc, estudios
    `;
    // Consulta SQL para actualizar datos
    const result = await pool.query(updateQuery, [
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      curp,
      rfc,
      estudios,
      id
    ]);
    // mensaje si no se encuentra el usuario
    res.json({ user: result.rows[0] });
  } catch (error) { // Manejo de errores
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar los datos.' });
  }
});

// Actualizar contraseña (usuario mismo o admin)
router.put('/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // Obtener usuario
    const userResult = await pool.query('SELECT id_personal, contrasena FROM personal WHERE id_personal = $1', [id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = userResult.rows[0];

    // Permisos: el usuario puede cambiar su propia contraseña; rol 3/4 puede cambiar cualquiera
    if (req.user.id_personal !== user.id_personal && ![3, 4].includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Si no es admin (rol 3/4), se requiere currentPassword
    if (![3, 4].includes(req.user.rol)) {
      if (!currentPassword) return res.status(400).json({ error: 'Contraseña actual requerida' });
      const match = await bcrypt.compare(currentPassword, user.contrasena);
      if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Validar nueva contraseña
    if (!newPassword) return res.status(400).json({ error: 'Nueva contraseña requerida' });
    const validar = validarPassword(newPassword);
    if (validar) return res.status(400).json({ error: validar });

    // Hashear y actualizar
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE personal SET contrasena = $1 WHERE id_personal = $2', [hashed, id]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
    //console.log('Buscando usuario:', USUARIO);
    const query = 'SELECT * FROM personal WHERE USUARIO = $1';
    const result = await pool.query(query, [USUARIO]);

    // mensaje  si hay credenciales inválidas
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu usuario.' });
    }


    // Obtener el usuario encontrado
    const user = result.rows[0];



    // ✅ Verificar si el usuario está bloqueado
    if (user.status === false) {
      return res.status(403).json({ error: 'Usuario bloqueado. Contacta al administrador.' });
    }

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
        estudios: user.estudios,
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
  if (![2, 3, 4].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado: solo Jefe, Administrador (rol 4) o Usuario tipo 2' });
  }
  next();
}

// Middleware para verificar si el usuario es Jefe (rol 3) o Admin (rol 4)
function isJefeOAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (![3, 4].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado: solo Jefe (rol 3) o Administrador (rol 4)' });
  }
  next();
}

// Ruta para obtener datos del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const query = `SELECT id_personal, nombre, apellido_paterno, apellido_materno, 
    usuario, correo, curp, rfc, estudios, foto_perfil, rol
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

// 📌 Obtener usuarios por rol (solo Jefe y Supervisor)
router.get('/rol/:rol', authenticateToken, isJefeOUsuario2, async (req, res) => {
  let rolesPermitidos = [];
  // Determinar qué roles puede ver basándose SOLO en el usuario autenticado
  if (req.user.rol == 3) {
    rolesPermitidos = [1, 2]; // admin (rol 3) ve base (rol 1) y supervisores (rol 2)
  } else if (req.user.rol == 4) {
    rolesPermitidos = [1, 2, 3]; // admin (rol 4) ve base, supervisores y jefes
  } else if (req.user.rol == 2) {
    rolesPermitidos = [1]; // supervisor (rol 2) ve solo base (rol 1)
  } else {
    rolesPermitidos = [1]; // por defecto solo base
  }

  try {
    let query, queryParams;

    // Si es supervisor (rol 2), solo ver miembros de su grupo
    if (req.user.rol === 2) {
      query = `
        SELECT p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
               p.usuario, p.correo, p.curp, p.rfc, p.estudios, p.rol, p.foto_perfil, p.status,
               json_agg(json_build_object('id_grupo', g.id_grupo, 'nombre_grupo', g.nombre) 
                        ORDER BY g.nombre) FILTER (WHERE g.id_grupo IS NOT NULL) as grupos
        FROM personal p
        INNER JOIN grupo_miembros gm ON p.id_personal = gm.id_personal
        INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
        WHERE g.id_supervisor = $1 AND p.rol = ANY($2)
        GROUP BY p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
                 p.usuario, p.correo, p.curp, p.rfc, p.estudios, p.rol, p.foto_perfil, p.status
        ORDER BY p.apellido_paterno ASC, p.apellido_materno ASC, p.nombre ASC
      `;
      queryParams = [req.user.id_personal, rolesPermitidos];
    } else {
      // Admin/Jefe ve todos CON grupos
      // Necesita traer:
      // - Para supervisores (rol 2): los grupos que supervisa
      // - Para usuarios (rol 1): los grupos a los que pertenece
      query = `
        SELECT p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
               p.usuario, p.correo, p.curp, p.rfc, p.estudios, p.rol, p.foto_perfil, p.status,
               json_agg(json_build_object('id_grupo', g.id_grupo, 'nombre_grupo', g.nombre)
                        ORDER BY g.nombre) FILTER (WHERE g.id_grupo IS NOT NULL) AS grupos
        FROM personal p
        LEFT JOIN (
          SELECT id_supervisor AS id_personal, id_grupo, nombre FROM grupos          -- grupos que supervisa
          UNION ALL
          SELECT gm.id_personal, g.id_grupo, g.nombre
          FROM grupo_miembros gm INNER JOIN grupos g ON gm.id_grupo = g.id_grupo      -- grupos donde es miembro
        ) g ON p.id_personal = g.id_personal
        WHERE p.rol = ANY($1)
        GROUP BY p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
                 p.usuario, p.correo, p.curp, p.rfc, p.estudios, p.rol, p.foto_perfil, p.status
        ORDER BY p.apellido_paterno, p.apellido_materno, p.nombre;
      `;
      queryParams = [rolesPermitidos];
    }

    const result = await pool.query(query, queryParams);
    const usuariosConDocs = await Promise.all(result.rows.map(async (user) => {
      const docsQuery = `
        SELECT id, tipo, archivo, cotejado 
        FROM documentos_academicos 
        WHERE id_personal = $1
      `;
      const docsResult = await pool.query(docsQuery, [user.id_personal]);
      return {
        ...user,
        documentos: docsResult.rows
      };
    }));
    res.json(usuariosConDocs);
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Obtener información completa de un usuario (perfil + documentos)
router.get('/usuarios/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Si es supervisor (rol 2), verificar que el usuario pertenece a su grupo
    if (req.user.rol === 2) {
      const grupoCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM grupo_miembros gm
         INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
         INNER JOIN personal p ON gm.id_personal = p.id_personal
         WHERE gm.id_personal = $1 AND g.id_supervisor = $2`,
        [id, req.user.id_personal]
      );
      
      if (grupoCheck.rows[0].count == 0) {
        return res.status(403).json({ error: 'No tienes acceso a este usuario' });
      }
    }

    // Obtener datos del usuario
    const userResult = await pool.query(
      `SELECT id_personal, nombre, apellido_paterno, apellido_materno,
              usuario, correo, curp, rfc, estudios, rol, foto_perfil, status
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

    // Obtener grupos del usuario (si aplica)
    let grupos = [];
    if (user.rol === 1) {
      const gruposResult = await pool.query(
        `SELECT g.id_grupo, g.nombre AS nombre_grupo
         FROM grupos g
         INNER JOIN grupo_miembros gm ON g.id_grupo = gm.id_grupo
         WHERE gm.id_personal = $1
         ORDER BY g.nombre`,
        [id]
      );
      grupos = gruposResult.rows;
    } else if (user.rol === 2) {
      const gruposResult = await pool.query(
        `SELECT id_grupo, nombre AS nombre_grupo
         FROM grupos
         WHERE id_supervisor = $1
         ORDER BY nombre`,
        [id]
      );
      grupos = gruposResult.rows;
    }

    // Obtener documentos del usuario
    const docsResult = await pool.query(
      `SELECT id, tipo, archivo, cotejado, es_certificado, fecha_subida
       FROM documentos_academicos
       WHERE id_personal = $1`,
      [id]
    );
    // Responder con datos del usuario y sus documentos
    res.json({
      ...user,
      grupos: grupos,
      documentos: docsResult.rows
    });
  } catch (error) {// Manejo de errores
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Buscar usuarios por nombre o apellido
router.get("/buscar", authenticateToken, async (req, res) => {
  const { nombre } = req.query;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "Falta el parámetro 'nombre'" });
  }

  try {
    // Dividir el término en palabras individuales y eliminar espacios vacíos
    const palabras = nombre.trim().split(/\s+/).filter(p => p.length > 0);

    // Determinar qué roles puede ver el usuario autenticado (no confiar en params del cliente)
    let rolesPermitidos = [];
    if (req.user.rol == 3) {
      rolesPermitidos = [1, 2]; // rol 3 ve roles 1 y 2
    } else if (req.user.rol == 4) {
      rolesPermitidos = [1, 2, 3]; // rol 4 ve roles 1, 2 y 3
    } else if (req.user.rol == 2) {
      rolesPermitidos = [1]; // rol 2 ve solo rol 1
    } else {
      rolesPermitidos = [1]; // por defecto rol 1 ve solo rol 1
    }

    // Construir condiciones dinámicamente: cada palabra debe coincidir en alguno de los campos
    // Empezamos con rol = ANY($1) y pasamos rolesPermitidos como primer parámetro
    let whereCondition = "p.rol = ANY($1)";
    let params = [rolesPermitidos];
    let paramIndex = 2;

    // Para cada palabra, agregar una condición OR que busque en todos los campos
    palabras.forEach((palabra) => {
      const searchTerm = `%${palabra}%`;
      whereCondition += ` AND (
        p.nombre ILIKE $${paramIndex}
        OR p.apellido_paterno ILIKE $${paramIndex}
        OR p.apellido_materno ILIKE $${paramIndex}
        OR p.curp ILIKE $${paramIndex}
        OR p.rfc ILIKE $${paramIndex}
      )`;
      params.push(searchTerm);
      paramIndex++;
    });

    let query;
    // Si es supervisor (rol 2), solo buscar en su grupo
    if (req.user.rol === 2) {
      query = `
        SELECT p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
               p.usuario, p.correo, p.curp, p.rfc, p.estudios, 
               p.rol, p.foto_perfil, p.status,
               json_agg(json_build_object('id_grupo', g.id_grupo, 'nombre_grupo', g.nombre) 
                        ORDER BY g.nombre) FILTER (WHERE g.id_grupo IS NOT NULL) as grupos
        FROM personal p
        INNER JOIN grupo_miembros gm ON p.id_personal = gm.id_personal
        INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
        WHERE g.id_supervisor = $${paramIndex} AND ${whereCondition}
        GROUP BY p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
                 p.usuario, p.correo, p.curp, p.rfc, p.estudios, 
                 p.rol, p.foto_perfil, p.status
        ORDER BY p.apellido_paterno ASC, p.apellido_materno ASC, p.nombre ASC
        LIMIT 50
      `;
      params.push(req.user.id_personal);
    } else {
      // Admin busca en todos
      query = `
        SELECT * FROM personal p
        WHERE ${whereCondition}
        ORDER BY p.apellido_paterno ASC, p.apellido_materno ASC, p.nombre ASC
        LIMIT 50
      `;
    }

    const result = await pool.query(query, params);
    // Responder con resultados
    res.json(result.rows);
  } catch (error) {
    // Manejo de errores
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Búsqueda avanzada de usuarios por habilidades/documentos (solo rol 3 y 4)
router.get("/buscar-avanzado", authenticateToken, isJefeOAdmin, async (req, res) => {
  const { nombre, tipoDocumento, estudios, soloCertificados, soloVerificados } = req.query;

  try {
    // Determinar qué roles puede ver el usuario autenticado
    let rolesPermitidos = [];
    if (req.user.rol === 3) {
      rolesPermitidos = [1, 2]; // rol 3 ve roles 1 y 2
    } else if (req.user.rol === 4) {
      rolesPermitidos = [1, 2, 3]; // rol 4 ve roles 1, 2 y 3
    } else {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Construir la consulta base con JOIN a documentos_academicos
    let baseQuery = `
      SELECT DISTINCT 
        p.id_personal, 
        p.nombre, 
        p.apellido_paterno, 
        p.apellido_materno,
        p.usuario, 
        p.correo, 
        p.curp, 
        p.rfc, 
        p.estudios,
        p.rol, 
        p.foto_perfil, 
        p.status,
        ARRAY_AGG(DISTINCT d.tipo) FILTER (WHERE d.tipo IS NOT NULL) as tipos_documentos,
        COUNT(DISTINCT CASE WHEN d.es_certificado = true THEN d.id END) as num_certificados,
        COUNT(DISTINCT CASE WHEN d.cotejado = true THEN d.id END) as num_documentos_verificados,
        COUNT(DISTINCT d.id) as total_documentos
      FROM personal p
      LEFT JOIN documentos_academicos d ON p.id_personal = d.id_personal
      WHERE p.rol = ANY($1)
    `;
    
    let params = [rolesPermitidos];
    let paramIndex = 2;

    // Filtrar por nombre si se proporciona
    if (nombre && nombre.trim() !== "") {
      const palabras = nombre.trim().split(/\s+/).filter(p => p.length > 0);
      palabras.forEach((palabra) => {
        const searchTerm = `%${palabra}%`;
        baseQuery += ` AND (
          p.nombre ILIKE $${paramIndex}
          OR p.apellido_paterno ILIKE $${paramIndex}
          OR p.apellido_materno ILIKE $${paramIndex}
          OR p.curp ILIKE $${paramIndex}
          OR p.rfc ILIKE $${paramIndex}
        )`;
        params.push(searchTerm);
        paramIndex++;
      });
    }

    // Filtrar por tipo de documento académico si se proporciona (secundaria, preparatoria, licenciatura)
    // Este filtro busca en documentos_academicos y es independiente del nivel de estudios de personal.estudios
    // La columna es_certificado tiene DEFAULT false, por lo que no hay valores NULL
    if (tipoDocumento && tipoDocumento.trim() !== "") {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM documentos_academicos d2 
        WHERE d2.id_personal = p.id_personal 
        AND d2.tipo ILIKE $${paramIndex}
        AND d2.es_certificado = false
      )`;
      params.push(`%${tipoDocumento}%`);
      paramIndex++;
    }

    // Filtrar por nivel de estudios si se proporciona
    if (estudios && estudios.trim() !== "") {
      baseQuery += ` AND UPPER(p.estudios) = $${paramIndex}`;
      params.push(estudios.trim().toUpperCase());
      paramIndex++;
    }

    // Filtrar solo usuarios con certificados
    if (soloCertificados === 'true') {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM documentos_academicos d3 
        WHERE d3.id_personal = p.id_personal 
        AND d3.es_certificado = true
      )`;
    }

    // Filtrar solo usuarios con documentos verificados
    if (soloVerificados === 'true') {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM documentos_academicos d4 
        WHERE d4.id_personal = p.id_personal 
        AND d4.cotejado = true
      )`;
    }

    baseQuery += `
      GROUP BY p.id_personal, p.nombre, p.apellido_paterno, p.apellido_materno,
               p.usuario, p.correo, p.curp, p.rfc, p.estudios, p.rol, p.foto_perfil, p.status
      ORDER BY p.apellido_paterno ASC, p.apellido_materno ASC, p.nombre ASC
      LIMIT 100
    `;

    const result = await pool.query(baseQuery, params);
    
    // Obtener los documentos de cada usuario para información detallada
    const usuariosConDocs = await Promise.all(result.rows.map(async (user) => {
      const docsQuery = `
        SELECT id, tipo, archivo, cotejado, es_certificado, fecha_subida 
        FROM documentos_academicos 
        WHERE id_personal = $1
        ORDER BY fecha_subida DESC
      `;
      const docsResult = await pool.query(docsQuery, [user.id_personal]);
      return {
        ...user,
        documentos: docsResult.rows
      };
    }));

    res.json(usuariosConDocs);
  } catch (error) {
    console.error("Error en búsqueda avanzada:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// Bloquear usuario (rol 1)
router.put('/bloquear/:id', authenticateToken, isJefeOUsuario2, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que sea rol 1
    const usuario = await pool.query(
      "SELECT * FROM personal WHERE id_personal = $1 AND rol = 1",
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado o no es de rol 1" });
    }

    // Bloquear al usuario
    await pool.query(
      "UPDATE personal SET status = false WHERE id_personal = $1",
      [id]
    );

    res.json({ message: "Usuario bloqueado correctamente." });
  } catch (error) {
    console.error("Error al bloquear usuario:", error);
    res.status(500).json({ error: "Error al bloquear el usuario." });
  }
});

// Desbloquear usuario (rol 1)
router.put('/desbloquear/:id', authenticateToken, isJefeOUsuario2, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que sea rol 1
    const usuario = await pool.query(
      "SELECT * FROM personal WHERE id_personal = $1 AND rol = 1",
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado o no es de rol 1" });
    }

    // Desbloquear al usuario
    await pool.query(
      "UPDATE personal SET status = true WHERE id_personal = $1",
      [id]
    );

    res.json({ message: "Usuario desbloqueado correctamente." });
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    res.status(500).json({ error: "Error al desbloquear el usuario." });
  }
});
// Recuperar usuario y contraseña (solo rol 3/4)
router.get('/recuperar/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Permisos:
    // - Rol 3/4: puede consultar el usuario
    // - Rol 2: solo si el usuario objetivo (rol 1) pertenece a sus grupos
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (req.user.rol === 2) {
      const checkGrupo = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM grupo_miembros gm
         INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
         INNER JOIN personal p ON gm.id_personal = p.id_personal
         WHERE gm.id_personal = $1 AND g.id_supervisor = $2 AND p.rol = 1`,
        [id, req.user.id_personal]
      );
      if (checkGrupo.rows[0].count === 0) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    } else if (![3, 4].includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Buscar usuario por id
    const result = await pool.query(
      `SELECT USUARIO, CONTRASENA
       FROM personal
       WHERE id_personal = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No devolver la contraseña almacenada (hash). Solo el usuario.
    res.json({ usuario: result.rows[0].usuario });

  } catch (error) {
    console.error('Error al recuperar usuario/contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint: generar contraseña temporal para un id (solo rol 3/4)
router.post('/recuperar/generar-temporal/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Permisos:
    // - Rol 3 o 4: puede generar para cualquier usuario
    // - Rol 2 (supervisor): solo para usuarios de rol 1 que pertenezcan a sus grupos
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.rol === 2) {
      const checkGrupo = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM grupo_miembros gm
         INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
         INNER JOIN personal p ON gm.id_personal = p.id_personal
         WHERE gm.id_personal = $1 AND g.id_supervisor = $2 AND p.rol = 1`,
        [id, req.user.id_personal]
      );
      if (checkGrupo.rows[0].count === 0) {
        return res.status(403).json({ error: 'Acceso denegado: solo puedes recuperar contraseñas de tus usuarios (rol 1)' });
      }
    } else if (![3, 4].includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar existencia del usuario
    const uRes = await pool.query('SELECT id_personal, usuario FROM personal WHERE id_personal = $1', [id]);
    if (uRes.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const user = uRes.rows[0];

    // Generar contraseña temporal
    const tempPassword = crypto.randomBytes(6).toString('base64').replace(/\+/g, 'A').replace(/\//g, 'B'); // ~12 chars
    const hashed = await bcrypt.hash(tempPassword, 10);

    // Actualizar contraseña en DB
    await pool.query('UPDATE personal SET contrasena = $1 WHERE id_personal = $2', [hashed, id]);

    // Devolver contraseña temporal
    res.json({
      usuario: user.usuario,
      temporal: tempPassword
    });

  } catch (err) {
    console.error('Error generando contraseña temporal:', err);
    res.status(500).json({ error: 'Error interno al generar contraseña temporal' });
  }
});


module.exports = router;