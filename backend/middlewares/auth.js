const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';
const { has: isBlacklisted } = require('../utils/tokenBlacklist');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  // Rechaza tokens que fueron "logout"
  if (isBlacklisted(token)) return res.status(401).json({ error: 'Token inválido (logout)' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    req.user = user; // info del token (id_usuario, tipo_usuario, etc)
    next();
  });
}

module.exports = authenticateToken;