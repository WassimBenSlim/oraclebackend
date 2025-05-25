const Grade = require('../models/grades');

const createGrade = async (req, res, next) => {
  try {
    const { gradeName, gradeName_en } = req.body;
    if (!gradeName || !gradeName_en) {
      return res.status(400).json({ message: 'gradeName and gradeName_en are required' });
    }

    // Try to create grade, catch unique constraint violation
    try {
      const newGrade = await Grade.create({ gradeName, gradeName_en });
      res.status(201).json({ message: 'Grade created successfully.', id: newGrade.id });
    } catch (err) {
      if (err.errorNum === 1) { // unique constraint violation in Oracle
        return res.status(409).json({ message: 'DUPLICATION_KEY', success: false });
      }
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const getAllGrades = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const grades = await Grade.findAll(searchTerm);
    if (!grades.length) {
      return res.status(404).json({ message: 'La liste des grades est vide', success: false });
    }
    res.json({ message: grades, success: true });
  } catch (error) {
    next(error);
  }
};

const getListeGradeName = async (req, res, next) => {
  try {
    const grades = await Grade.findAllNames();
    if (!grades.length) {
      return res.status(404).json({ message: 'La Base est vide', success: false });
    }
    const listeGradeName = grades.map((g) => g.gradeName);
    res.status(200).json({ message: listeGradeName, success: true });
  } catch (error) {
    next(error);
  }
};

const deleteGradeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const exists = await Grade.findById(id);
    if (!exists) return res.status(404).json({ message: 'Grade non trouvé', success: false });

    const deleted = await Grade.deleteById(id);
    if (!deleted) return res.status(500).json({ message: 'Erreur suppression grade', success: false });

    res.status(200).json({ message: 'Grade supprimé avec succès', success: true });
  } catch (error) {
    next(error);
  }
};

const updateGrade = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { gradeName, gradeName_en } = req.body;

    if (!gradeName || !gradeName_en) {
      return res.status(400).json({ message: 'gradeName and gradeName_en are required', success: false });
    }

    const exists = await Grade.findById(id);
    if (!exists) return res.status(404).json({ message: 'Grade non trouvé', success: false });

    try {
      const updated = await Grade.updateById(id, { gradeName, gradeName_en });
      if (!updated) {
        return res.status(500).json({ message: 'Grade non modifié', success: false });
      }
      res.status(200).json({ message: 'grade updated successfully', success: true });
    } catch (err) {
      if (err.errorNum === 1) { // unique constraint violation in Oracle
        return res.status(409).json({ message: 'DUPLICATION_KEY', success: false });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGrade,
  getAllGrades,
  getListeGradeName,
  deleteGradeById,
  updateGrade,
};
