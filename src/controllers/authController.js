const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const { User } = require('../models');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
      issuer: 'prestamos-laboratorio',
      audience: 'prestamos-laboratorio-api'
    });
    return res.json({
      message: 'Inicio de sesión correcto.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
