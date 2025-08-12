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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/academico/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id_personal}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

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

module.exports = router;
