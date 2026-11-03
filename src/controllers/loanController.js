const { UniqueConstraintError } = require('sequelize');
const { sequelize, Equipment, Loan, User } = require('../models');

async function create(req, res, next) {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const equipment = await Equipment.findByPk(req.body.equipmentId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!equipment) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }
    if (equipment.condition !== 'operativo') {
      await transaction.rollback();
      return res.status(409).json({ error: 'El equipo no está en condición de préstamo.' });
    }

    const loan = await Loan.create({
      equipmentId: equipment.id,
      borrowerName: req.body.borrowerName,
      loanDate: req.body.loanDate,
      dueDate: req.body.dueDate,
      responsibleUserId: req.auth.userId,
      activeEquipmentId: equipment.id
    }, { transaction });
    await transaction.commit();
    return res.status(201).json({ message: 'Préstamo registrado correctamente.', loan });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'El equipo ya tiene un préstamo activo.' });
    }
    return next(error);
  }
}

async function listActive(req, res, next) {
  try {
    const loans = await Loan.findAll({
      where: { returnedAt: null },
      include: [
        { model: Equipment, as: 'equipment', attributes: ['id', 'code', 'name', 'category'] },
        { model: User, as: 'responsibleUser', attributes: ['id', 'name', 'email'] }
      ],
      order: [['dueDate', 'ASC']]
    });
    return res.json({ loans });
  } catch (error) {
    return next(error);
  }
}

async function returnLoan(req, res, next) {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const loan = await Loan.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!loan) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Préstamo no encontrado.' });
    }
    if (loan.returnedAt) {
      await transaction.rollback();
      return res.status(409).json({ error: 'Este préstamo ya fue devuelto.' });
    }
    await loan.update({
      returnedAt: new Date(),
      activeEquipmentId: null
    }, { transaction });
    await transaction.commit();
    return res.json({ message: 'Devolución registrada correctamente.', loan });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return next(error);
  }
}

module.exports = { create, listActive, returnLoan };
