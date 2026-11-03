const { UniqueConstraintError } = require('sequelize');
const { sequelize, Equipment, Loan, User } = require('../models');

const equipmentAttributes = ['id', 'code', 'name', 'category', 'condition', 'createdAt', 'updatedAt'];

async function addAvailability(equipment) {
  const activeLoan = await Loan.findOne({
    where: { equipmentId: equipment.id, returnedAt: null },
    attributes: ['id']
  });
  return { ...equipment.toJSON(), available: !activeLoan };
}

async function list(req, res, next) {
  try {
    const equipment = await Equipment.findAll({
      attributes: equipmentAttributes,
      order: [['id', 'ASC']]
    });
    const items = await Promise.all(equipment.map(addAvailability));
    return res.json({ equipment: items });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const equipment = await Equipment.findByPk(req.params.id, { attributes: equipmentAttributes });
    if (!equipment) return res.status(404).json({ error: 'Equipo no encontrado.' });
    return res.json({ equipment: await addAvailability(equipment) });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const equipment = await Equipment.create(req.body);
    return res.status(201).json({
      message: 'Equipo registrado correctamente.',
      equipment: { ...equipment.toJSON(), available: true }
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'Ya existe un equipo con ese código.' });
    }
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipo no encontrado.' });
    await equipment.update(req.body);
    return res.json({
      message: 'Equipo actualizado correctamente.',
      equipment: await addAvailability(equipment)
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'Ya existe un equipo con ese código.' });
    }
    return next(error);
  }
}

async function remove(req, res, next) {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const equipment = await Equipment.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!equipment) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }
    const loanCount = await Loan.count({ where: { equipmentId: equipment.id }, transaction });
    if (loanCount > 0) {
      await transaction.rollback();
      return res.status(409).json({ error: 'No se puede eliminar un equipo con historial de préstamos.' });
    }
    await equipment.destroy({ transaction });
    await transaction.commit();
    return res.json({ message: 'Equipo eliminado correctamente.' });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return next(error);
  }
}

async function history(req, res, next) {
  try {
    const equipment = await Equipment.findByPk(req.params.id, {
      attributes: ['id', 'code', 'name', 'category', 'condition']
    });
    if (!equipment) return res.status(404).json({ error: 'Equipo no encontrado.' });
    const loans = await Loan.findAll({
      where: { equipmentId: equipment.id },
      include: [
        { model: User, as: 'responsibleUser', attributes: ['id', 'name', 'email'] }
      ],
      order: [['loanDate', 'DESC'], ['id', 'DESC']]
    });
    return res.json({ equipment, history: loans });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, getById, create, update, remove, history };
