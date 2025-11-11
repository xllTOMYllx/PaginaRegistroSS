// variables de entorno
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Rutas
const documentosRoutes = require('./routes/documentos');
const usersRoutes = require('./routes/users');

// Middleware general
app.use(cors({
  origin: 'http://localhost:5173', // tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'CORS'],
  credentials: true
}));

// Configuración de encoding UTF-8 global
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Configuración de seguridad y encoding UTF-8
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));
app.use(helmet());

// Rutas API
app.use('/api/users', usersRoutes);
app.use('/api/documentos', documentosRoutes);

// Middleware personalizado para servir archivos estáticos con CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Servidor backend en funcionamiento!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
