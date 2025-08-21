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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// Configuración de seguridad
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Rutas API
app.use('/api/users', usersRoutes);
app.use('/api/documentos', documentosRoutes);

// Middleware personalizado para servir archivos estáticos con CORS
/*
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, 'uploads')));*/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Servidor backend en funcionamiento!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
