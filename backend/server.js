const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('¡Servidor backend en funcionamiento!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
