function notFound(req, res) {
  res.status(404).json({ error: 'La ruta solicitada no existe.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  return res.status(500).json({ error: 'Ocurrió un error interno del servidor.' });
}

module.exports = { notFound, errorHandler };
