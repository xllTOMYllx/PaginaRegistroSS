const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { sendDocumentUploadedEmail, sendDocumentVerifiedEmail, sendBulkDocumentsVerifiedEmail } = require('../utils/mailer');
require('dotenv').config();

// Config DB
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

/*
// Configuración Multer
const fs = require('fs');

// Configuración Multer con carpeta por usuario
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userFolder = path.join(__dirname, '../uploads/academico', `${req.user.id_personal}`);

    // Verifica si la carpeta existe, si no, la crea
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});*/

const fs = require('fs');

// Ayudante: sanitizar nombres de archivo y evitar caracteres peligrosos
function sanitizeFileName(name) {
  // Preservar el nombre de archivo original exacto con acentos y caracteres especiales
  // Solo eliminar caracteres verdaderamente peligrosos:
  // - separadores de ruta (/ y \)
  // - caracteres reservados de Windows: <>:"|?*
  // - bytes nulos y caracteres de control (\x00-\x1F)
  if (!name) return name;
  
  // Corregir mojibake: si el nombre se ve corrupto (texto UTF-8 mal interpretado como Latin-1),
  // re-codificarlo correctamente. Patrón común: "Ã©" (mojibake) -> "é" (correcto)
  let fixed = name;
  try {
    // Detectar patrones de mojibake: secuencias como Ã¡, Ã©, Ã­, Ã³, Ã¹, Ã±, Ã, etc.
    // Estos son bytes UTF-8 interpretados como Latin-1
    if (/Ã[¡-ÿ]|Ã‰|Ã¡|Ã©|Ã­|Ã³|Ã¹|Ã±/.test(name)) {
      // Intentar corregir re-codificando: Latin-1 -> Buffer -> UTF-8
      fixed = Buffer.from(name, 'latin1').toString('utf8');
    }
  } catch (e) {
    // Si la codificación falla, mantener el original
    fixed = name;
  }
  
  let sanitized = fixed;
  // Eliminar solo caracteres verdaderamente peligrosos
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
  // Colapsar secuencias de puntos (evitar travesía de directorios ..)
  sanitized = sanitized.replace(/\.{2,}/g, '.');
  // Eliminar espacios en blanco al inicio y final
  sanitized = sanitized.trim();
  // Si está vacío después de sanitizar, usar timestamp + extensión original como respaldo
  if (sanitized.length === 0) {
    const ext = path.extname(name) || '';
    return Date.now() + ext;
  }
  return sanitized;
}

// Configuración Multer con carpeta por usuario
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userFolder = path.join(__dirname, '../uploads/academico', `${req.user.id_personal}`);

    // Verifica si la carpeta existe, si no, la crea
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    try {
      const userFolder = path.join(__dirname, '../uploads/academico', `${req.user.id_personal}`);
      const original = path.basename(file.originalname);
      const sanitized = sanitizeFileName(original);

      const ext = path.extname(sanitized);
      const base = path.basename(sanitized, ext);

      // Si no existe, usar el nombre tal cual (sanitizado)
      let finalName = sanitized;
      let finalPath = path.join(userFolder, finalName);

      if (fs.existsSync(finalPath)) {
        // Buscar el siguiente sufijo disponible: Nombre(1).ext, Nombre(2).ext, ...
        let i = 1;
        while (true) {
          const candidate = `${base}(${i})${ext}`;
          const candidatePath = path.join(userFolder, candidate);
          if (!fs.existsSync(candidatePath)) {
            finalName = candidate;
            finalPath = candidatePath;
            break;
          }
          i += 1;
        }
      }

      cb(null, finalName);
    } catch (err) {
      // Respaldo: usar nombre con timestamp si algo falla
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }
});

// Solo PDF
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Solo se permiten archivos PDF"), false);
    }
    cb(null, true);
  }
});

// Middleware para corregir encoding UTF-8 en los nombres de archivo
router.use('/subir-academico', (req, res, next) => {
  // Interceptamos en el middleware para corregir encoding si Multer lo procesa después
  // Esta corrección real ocurre en sanitizeFileName
  next();
});

// 📌 Ruta para subir documento académico
router.post('/subir-academico', authenticateToken, upload.single('archivo'), async (req, res) => {
  try {
    const { tipo } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    if (!tipo) {
      return res.status(400).json({ error: 'Debes indicar el tipo de documento' });
    }
    // Insertar en la base de datos (@Irvinglez12 si se madrea algo al subir un documento aqui esta el cambio que hice)
    await pool.query(
      `INSERT INTO documentos_academicos (id_personal, tipo, archivo, es_certificado)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id_personal, tipo, req.file.filename, tipo === 'certificados']
    );
    // Obtener nombre del usuario desde la tabla personal
// Obtener el email del usuario
const userResult = await pool.query(
  `SELECT usuario, correo FROM personal WHERE id_personal = $1`,
  [req.user.id_personal]
);
const { usuario, correo } = userResult.rows[0];

// Enviar correo de notificación
if (correo) {
  try {
        await sendDocumentUploadedEmail(
          correo,
          usuario,
          tipo
        );
  } catch (emailError) {
    console.error('Error al enviar correo de notificación:', emailError);
    // Continuamos con la ejecución aunque falle el envío del correo
  }
}
    // Mensaje de respuesta al cliente
    res.json({
      message: 'Documento académico subido correctamente',
      tipo,
      file: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir documento académico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Ruta para listar documentos del usuario autenticado
router.get('/mis-documentos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, tipo, archivo, cotejado, fecha_subida
       FROM documentos_academicos
       WHERE id_personal = $1`,
      [req.user.id_personal]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar documento
router.delete('/eliminar/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Obtener datos del documento (archivo y tipo)
    const result = await pool.query(
      `SELECT archivo, tipo FROM documentos_academicos 
       WHERE id = $1 AND id_personal = $2`,
      [id, req.user.id_personal]
    );
    // Si no se encuentra el documento
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    // Extraer nombre del archivo y tipo
    const { archivo, tipo } = result.rows[0];

    const filePath = path.join(__dirname, '../uploads/academico', `${req.user.id_personal}`, archivo);

    // 2️⃣ Eliminar archivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3️⃣ Eliminar de la base de datos
    await pool.query(`DELETE FROM documentos_academicos WHERE id = $1`, [id]);

    // 4️⃣ Obtener nombre del usuario desde la tabla personal
    const userResult = await pool.query(
      `SELECT usuario FROM personal WHERE id_personal = $1`,
      [req.user.id_personal]
    );
    // Si no se encuentra el usuario, usar "Desconocido"
    const nombreUsuario = userResult.rows[0]?.usuario || "Desconocido";

    
    // Mensaje de respuesta al cliente
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// IMÁGENES
// Configuración Multer para imágenes
const storageFoto = multer.diskStorage({
  destination: (req, file, cb) => {
    const userFolder = path.join(__dirname, '../uploads/fotos', `${req.user.id_personal}`);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Solo imágenes JPG y PNG
const uploadFoto = multer({
  storage: storageFoto,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Solo se permiten imágenes JPG o PNG"), false);
    }
    cb(null, true);
  }
});

// Subir foto de perfil
router.post('/subir-foto', authenticateToken, uploadFoto.single('foto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    // Obtener la foto anterior del usuario
    const result = await pool.query(
      `SELECT foto_perfil FROM personal WHERE id_personal = $1`,
      [req.user.id_personal]
    );
    // Si no hay foto anterior, se asigna null
    const fotoAnterior = result.rows[0]?.foto_perfil;
    const carpetaUsuario = path.join(__dirname, '../uploads/fotos', `${req.user.id_personal}`);

    // Eliminar la foto anterior si existe
    if (fotoAnterior) {
      const rutaFotoAnterior = path.join(carpetaUsuario, fotoAnterior);
      if (fs.existsSync(rutaFotoAnterior)) {
        fs.unlinkSync(rutaFotoAnterior);
      }
    }

    // Guardar la nueva foto en la base de datos
    await pool.query(
      `UPDATE personal SET foto_perfil = $1 WHERE id_personal = $2`,
      [req.file.filename, req.user.id_personal]
    );
    // Mensaje de respuesta al cliente
    res.json({
      message: 'Foto de perfil subida correctamente',
      file: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir foto de perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// 📌 Marcar documento como cotejado
router.patch('/:id/cotejado', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { emailPassword, fromEmail } = req.body;

  if (!emailPassword || !fromEmail) {
    return res.status(400).json({ error: 'Se requieren el correo y la contraseña de Gmail para enviar la notificación' });
  }

  try {
    // Obtener información del documento y su propietario
    const docResult = await pool.query(
      `SELECT d.tipo, d.id_personal, p.usuario, p.correo 
       FROM documentos_academicos d
       JOIN personal p ON d.id_personal = p.id_personal
       WHERE d.id = $1`,
      [id]
    );


    // 📌 Cotejar TODOS los documentos de un usuario
    router.patch('/usuario/:id_personal/cotejar-todos', authenticateToken, async (req, res) => {
      const { id_personal } = req.params;
      const { emailPassword, fromEmail } = req.body;

      if (!emailPassword || !fromEmail) {
        return res.status(400).json({ error: 'Se requieren el correo y la contraseña de Gmail para enviar las notificaciones' });
      }

      try {
        // Datos del propietario de los documentos
        const ownerRes = await pool.query(
          `SELECT usuario, correo FROM personal WHERE id_personal = $1`,
          [id_personal]
        );
        if (ownerRes.rows.length === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const { usuario, correo } = ownerRes.rows[0];

        // Supervisores (rol 2): validar pertenencia a su grupo
        if (req.user.rol === 2) {
          const grupoCheck = await pool.query(
            `SELECT COUNT(*) as count
             FROM grupo_miembros gm
             INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
             WHERE gm.id_personal = $1 AND g.id_supervisor = $2`,
            [id_personal, req.user.id_personal]
          );
          if (grupoCheck.rows[0].count == 0) {
            return res.status(403).json({ error: 'No tienes permiso para cotejar documentos de este usuario' });
          }
        }

        // Documentos pendientes de cotejo
        const docsRes = await pool.query(
          `SELECT id, tipo FROM documentos_academicos WHERE id_personal = $1 AND cotejado = FALSE`,
          [id_personal]
        );
        const pendientes = docsRes.rows;

        if (pendientes.length === 0) {
          return res.json({ message: 'No hay documentos pendientes de cotejo para este usuario', updated: 0 });
        }

        // Actualizar en lote
        await pool.query(
          `UPDATE documentos_academicos
           SET cotejado = TRUE,
               verificado_por = $2,
               fecha_verificacion = CURRENT_TIMESTAMP
           WHERE id_personal = $1 AND cotejado = FALSE`,
          [id_personal, req.user.id_personal]
        );

        /*
        // Notificaciones por documento
        for (const d of pendientes) {
          await pool.query(
            `INSERT INTO notificaciones (id_personal, usuario, mensaje)
             VALUES ($1, $2, $3)`,
            [id_personal, usuario, `Tu documento "${d.tipo}" ha sido cotejado`] 
          );
        }
          */

        // Envío de un único correo resumen
        let emailSent = false;
        let emailError = null;
        if (correo) {
          try {
            const tipos = pendientes.map(d => d.tipo);
            const emailResult = await sendBulkDocumentsVerifiedEmail(
              correo,
              usuario,
              req.user.usuario || 'Verificador',
              tipos,
              fromEmail,
              emailPassword,
              req.body.smtpHost,
              req.body.smtpPort,
              req.body.smtpSecure
            );
            emailSent = !!emailResult.success;
            emailError = emailResult.success ? null : emailResult.error;
          } catch (err) {
            emailError = err.message || String(err);
          }
        }

        return res.json({ 
          message: `Documentos cotejados: ${pendientes.length}`,
          updated: pendientes.length,
          emailSent,
          emailError
        });
      } catch (error) {
        console.error('Error al cotejar todos los documentos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    });

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const { tipo, id_personal, usuario, correo } = docResult.rows[0];

    // Si es supervisor (rol 2), verificar que el usuario pertenece a su grupo
    if (req.user.rol === 2) {
      const grupoCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM grupo_miembros gm
         INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
         WHERE gm.id_personal = $1 AND g.id_supervisor = $2`,
        [id_personal, req.user.id_personal]
      );
      
      if (grupoCheck.rows[0].count == 0) {
        return res.status(403).json({ error: 'No tienes permiso para cotejar documentos de este usuario' });
      }
    }

    // Obtener información del verificador
    const verificadorResult = await pool.query(
      `SELECT usuario, correo FROM personal WHERE id_personal = $1`,
      [req.user.id_personal]
    );
    const verificadorData = verificadorResult.rows[0];

  // Información del verificador para el correo
  const verificadorInfo = {
    nombre: verificadorData.usuario,
    correo: verificadorData.correo
  };

    // Actualizar el estado del documento
    await pool.query(
      `UPDATE documentos_academicos
       SET cotejado = TRUE,
           verificado_por = $2,
           fecha_verificacion = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id, req.user.id_personal]
    );

    // Insertar notificación en la base de datos
    /*
    await pool.query(
      `INSERT INTO notificaciones (id_personal, usuario, mensaje) 
       VALUES ($1, $2, $3)`,
      [
        id_personal,
        usuario,
        `Tu documento "${tipo}" ha sido cotejado por ${verificadorData.usuario}`
      ]
    );
    */

    // Enviar notificación por correo
    if (correo) {
      try {
        console.log('Intentando enviar correo con Gmail:', {
          to: correo,
          from: fromEmail
        });

        const emailResult = await sendDocumentVerifiedEmail(
          correo,
          usuario,
          tipo,
          verificadorInfo.nombre,
          fromEmail,
          emailPassword,
          req.body.smtpHost,
          req.body.smtpPort,
          req.body.smtpSecure
        );

        if (!emailResult.success) {
          console.error('Error al enviar correo:', emailResult.error);
          return res.status(500).json({
            error: `Error al enviar el correo: ${emailResult.error}`,
            details: emailResult.error,
            emailError: true
          });
        }

        console.log('Correo enviado exitosamente');
      } catch (emailError) {
        console.error('Error en el envío de correo:', emailError);
        return res.status(500).json({
          error: `Error al enviar el correo: ${emailError.message}`,
          details: emailError.message,
          emailError: true
        });
      }
    }

    res.json({ message: 'Documento marcado como cotejado correctamente' });
  } catch (error) {
    console.error('Error al actualizar cotejado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Alias con POST por compatibilidad si algún entorno bloquea PATCH
router.post('/usuario/:id_personal/cotejar-todos', authenticateToken, async (req, res) => {
  const { id_personal } = req.params;
  const { emailPassword, fromEmail } = req.body;

  if (!emailPassword || !fromEmail) {
    return res.status(400).json({ error: 'Se requieren el correo y la contraseña de Gmail para enviar las notificaciones' });
  }

  try {
    const ownerRes = await pool.query(
      `SELECT usuario, correo FROM personal WHERE id_personal = $1`,
      [id_personal]
    );
    if (ownerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const { usuario, correo } = ownerRes.rows[0];

    if (req.user.rol === 2) {
      const grupoCheck = await pool.query(
        `SELECT COUNT(*) as count
         FROM grupo_miembros gm
         INNER JOIN grupos g ON gm.id_grupo = g.id_grupo
         WHERE gm.id_personal = $1 AND g.id_supervisor = $2`,
        [id_personal, req.user.id_personal]
      );
      if (grupoCheck.rows[0].count == 0) {
        return res.status(403).json({ error: 'No tienes permiso para cotejar documentos de este usuario' });
      }
    }

    const docsRes = await pool.query(
      `SELECT id, tipo FROM documentos_academicos WHERE id_personal = $1 AND cotejado = FALSE`,
      [id_personal]
    );
    const pendientes = docsRes.rows;

    if (pendientes.length === 0) {
      return res.json({ message: 'No hay documentos pendientes de cotejo para este usuario', updated: 0 });
    }

    await pool.query(
      `UPDATE documentos_academicos
       SET cotejado = TRUE,
           verificado_por = $2,
           fecha_verificacion = CURRENT_TIMESTAMP
       WHERE id_personal = $1 AND cotejado = FALSE`,
      [id_personal, req.user.id_personal]
    );

    /*
    for (const d of pendientes) {
      await pool.query(
        `INSERT INTO notificaciones (id_personal, usuario, mensaje)
         VALUES ($1, $2, $3)`,
        [id_personal, usuario, `Tu documento "${d.tipo}" ha sido cotejado`]
      );
    }
      */

    let emailSent = false;
    let emailError = null;
    if (correo) {
      try {
        const tipos = pendientes.map(d => d.tipo);
        const emailResult = await sendBulkDocumentsVerifiedEmail(
          correo,
          usuario,
          req.user.usuario || 'Verificador',
          tipos,
          req.body.fromEmail,
          req.body.emailPassword,
          req.body.smtpHost,
          req.body.smtpPort,
          req.body.smtpSecure
        );
        emailSent = !!emailResult.success;
        emailError = emailResult.success ? null : emailResult.error;
      } catch (err) {
        emailError = err.message || String(err);
      }
    }

    return res.json({ 
      message: `Documentos cotejados: ${pendientes.length}`,
      updated: pendientes.length,
      emailSent,
      emailError
    });
  } catch (error) {
    console.error('Error al cotejar todos los documentos (POST):', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;
module.exports = router;