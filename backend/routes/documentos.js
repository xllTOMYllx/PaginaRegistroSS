const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
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

// Configuración Multer para fotos de perfil (imágenes)
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    const userFolder = path.join(__dirname, '../uploads/profile', `${req.user.id_personal}`);

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

// Solo imágenes para perfil (JPEG, PNG, etc.)
const uploadProfile = multer({ 
  storage: storageProfile,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten archivos de imagen"), false);
    }
    cb(null, true);
  }
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

    await pool.query(
      `INSERT INTO documentos_academicos (id_personal, tipo, archivo)
       VALUES ($1, $2, $3)`,
      [req.user.id_personal, tipo, req.file.filename]
    );

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

// 📌 Ruta para subir foto de perfil
router.post('/subir-profile', authenticateToken, uploadProfile.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    await pool.query(
      `UPDATE personal SET profile_picture = $1 WHERE id_personal = $2`,
      [req.file.filename, req.user.id_personal]
    );

    res.json({
      message: 'Foto de perfil subida correctamente',
      file: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir foto de perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📌 Ruta para listar documentos del usuario autenticado
router.get('/mis-documentos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, tipo, archivo, fecha_subida
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

//Eliminar documento

router.delete('/eliminar/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT archivo FROM documentos_academicos WHERE id = $1 AND id_personal = $2`,
      [id, req.user.id_personal]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const archivo = result.rows[0].archivo;
    const filePath = path.join(__dirname, '../uploads/academico', `${req.user.id_personal}`, archivo);

    // Eliminar archivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar de la base de datos
    await pool.query(`DELETE FROM documentos_academicos WHERE id = $1`, [id]);

    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;
