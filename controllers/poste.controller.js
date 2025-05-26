const Poste = require('../models/poste');

const createPoste = async (req, res, next) => {
  try {
    const { posteName, posteName_en, competences, expertisesMetiers, expertisesTechniques, expertisesLogicielles } = req.body;

    if (!posteName || !posteName_en) {
      return res.status(400).json({
        message: 'posteName and posteName_en are required',
        success: false
      });
    }

    const newPoste = await Poste.createWithRelations({
      posteName,
      posteName_en,
      competences: competences || [],
      expertisesMetiers: expertisesMetiers || [],
      expertisesTechniques: expertisesTechniques || [],
      expertisesLogicielles: expertisesLogicielles || []
    });

    res.status(201).json({
      message: 'Poste created successfully',
      poste: newPoste,
      success: true
    });
  } catch (error) {
    if (error.errorNum === 1) { // Unique constraint
      return res.status(409).json({
        message: 'DUPLICATION_KEY',
        success: false
      });
    }
    next(error);
  }
};

const getAllPostes = async (req, res, next) => {
  try {
    const postes = await Poste.findAll(req.query.search || '');
    res.json({
      message: 'Postes retrieved successfully',
      postes,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

const getPosteById = async (req, res, next) => {
  try {
    const poste = await Poste.findById(req.params.id);
    if (!poste) {
      return res.status(404).json({
        message: 'Poste not found',
        success: false
      });
    }
    res.json({
      message: 'Poste retrieved successfully',
      poste,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

const updatePoste = async (req, res, next) => {
  try {
    const updated = await Poste.updateWithRelations(
      req.params.id,
      {
        posteName: req.body.posteName,
        posteName_en: req.body.posteName_en,
        competences: req.body.competences,
        expertisesMetiers: req.body.expertisesMetiers,
        expertisesTechniques: req.body.expertisesTechniques,
        expertisesLogicielles: req.body.expertisesLogicielles
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: 'Poste not found or not updated',
        success: false
      });
    }

    const poste = await Poste.findById(req.params.id);
    res.json({
      message: 'Poste updated successfully',
      poste,
      success: true
    });
  } catch (error) {
    if (error.errorNum === 1) {
      return res.status(409).json({
        message: 'DUPLICATION_KEY',
        success: false
      });
    }
    next(error);
  }
};

const deletePoste = async (req, res, next) => {
  try {
    const deleted = await Poste.softDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        message: 'Poste not found',
        success: false
      });
    }
    res.json({
      message: 'Poste deleted successfully',
      success: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPoste,
  getAllPostes,
  getPosteById,
  updatePoste,
  deletePoste
};