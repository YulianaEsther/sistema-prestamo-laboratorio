const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authorization = req.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere un token Bearer válido.' });
  }

  const token = authorization.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'prestamos-laboratorio',
      audience: 'prestamos-laboratorio-api'
    });
    req.auth = { userId: Number(payload.sub) };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'El token es inválido o ha expirado.' });
  }
}

module.exports = authenticateToken;
