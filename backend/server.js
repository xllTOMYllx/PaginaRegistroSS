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
const gruposRoutes = require('./routes/grupos');

// Middleware general
app.use(cors({
  origin: 'http://localhost:5173', // tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'CORS'],
  credentials: true
}));

// Configuración de encoding UTF-8 global
// Nota: no establecer Content-Type globalmente aquí porque puede interferir
// con la entrega de archivos estáticos (PDF, imágenes). Los endpoints JSON
// deben establecer su propio Content-Type cuando sea necesario.

// Configuración de seguridad y encoding UTF-8
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));
app.use(helmet());

// Rutas API
app.use('/api/users', usersRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/grupos', gruposRoutes);

// Middleware personalizado para servir archivos estáticos con CORS
// Añadimos setHeaders para PDFs para sugerir apertura inline en el navegador
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    try {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf') {
        // Asegurar Content-Type correcto y sugerir apertura inline en el navegador
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
      }
    } catch (e) {
      // silenciar cualquier error al establecer cabeceras
    }
  }
}));


// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Servidor backend en funcionamiento!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
