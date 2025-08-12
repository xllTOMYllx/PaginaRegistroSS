const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const documentosRoutes = require('./routes/documentos');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const helmet = require('helmet');
app.use(helmet());

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

//para los documentos académicos
app.use('/api/documentos', documentosRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('¡Servidor backend en funcionamiento!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
