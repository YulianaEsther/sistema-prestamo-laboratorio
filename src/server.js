require('dotenv').config();

function validateEnvironment() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === 'replace-this-with-a-random-secret-at-least-32-characters') {
    throw new Error('JWT_SECRET debe configurarse con un valor aleatorio de al menos 32 caracteres.');
  }
}

async function start() {
  validateEnvironment();
  const app = require('./app');
  const sequelize = require('./config/database');
  await sequelize.authenticate();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`API lista en http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error);
  process.exitCode = 1;
});
