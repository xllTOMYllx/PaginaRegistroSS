const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Render y otros servicios que usan SSL auto-firmado
  }
});

pool.connect()
  .then(() => console.log('Conectado a la base de datos PostgreSQL'))
  .catch(err => console.error('Error conectando a PostgreSQL:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
};