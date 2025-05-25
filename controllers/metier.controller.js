const Metier = require('../models/metier');

const createMetier = async (req, res, next) => {
  try {
    const { metierName, metierName_en } = req.body;
    if (!metierName || !metierName_en) {
      return res.status(400).json({ message: 'metierName and metierName_en are required', success: false });
    }

    try {
      const newMetier = await Metier.create({ metierName, metierName_en });
      res.status(201).json({ message: 'Metier created successfully.', id: newMetier.id, success: true });
    } catch (err) {
      if (err.errorNum === 1) { // unique constraint violation
        return res.status(409).json({ message: 'DUPLICATION_KEY', success: false });
      }
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const getAllMetiers = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const metiers = await Metier.findAll(searchTerm);
    if (!metiers.length) {
      return res.status(404).json({ message: 'La liste des métiers est vide', success: false });
    }
    res.json({ message: metiers, success: true });
  } catch (error) {
    next(error);
  }
};

const deleteMetierById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const exists = await Metier.findById(id);
    if (!exists) return res.status(404).json({ message: 'Métier non trouvé', success: false });

    const deleted = await Metier.deleteById(id);
    if (!deleted) return res.status(500).json({ message: 'Erreur suppression métier', success: false });

    res.status(200).json({ message: 'Métier supprimé avec succès', success: true });
  } catch (error) {
    next(error);
  }
};

const updateMetierById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { metierName, metierName_en } = req.body;

    if (!metierName || !metierName_en) {
      return res.status(400).json({ message: 'metierName and metierName_en are required', success: false });
    }

    const exists = await Metier.findById(id);
    if (!exists) return res.status(404).json({ message: 'Métier non trouvé', success: false });

    try {
      const updated = await Metier.updateById(id, { metierName, metierName_en });
      if (!updated) {
        return res.status(500).json({ message: 'Métier non modifié', success: false });
      }
      res.status(200).json({ message: 'Métier updated successfully', success: true });
    } catch (err) {
      if (err.errorNum === 1) { // unique constraint violation
        return res.status(409).json({ message: 'DUPLICATION_KEY', success: false });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMetier,
  getAllMetiers,
  deleteMetierById,
  updateMetierById
};