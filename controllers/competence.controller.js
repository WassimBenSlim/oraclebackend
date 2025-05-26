const Competence = require('../models/competence');

const createCompetence = async (req, res, next) => {
  try {
    const { competenceName, competenceName_en } = req.body;
    if (!competenceName || !competenceName_en) {
      return res.status(400).json({ 
        message: 'competenceName and competenceName_en are required', 
        success: false 
      });
    }

    try {
      const newCompetence = await Competence.create({ competenceName, competenceName_en });
      res.status(201).json({ 
        competences: newCompetence,
        success: true 
      });
    } catch (err) {
      if (err.errorNum === 1) { // Unique constraint violation
        return res.status(409).json({ 
          message: 'DUPLICATION_KEY', 
          success: false 
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const getAllCompetences = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const competences = await Competence.findAll(searchTerm);
    
    res.json({ 
      competences,
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

const updateCompetence = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { competenceName, competenceName_en } = req.body;

    const updated = await Competence.updateById(id, { competenceName, competenceName_en });
    if (!updated) {
      return res.status(404).json({ 
        message: 'Competence not found or not updated', 
        success: false 
      });
    }

    res.json({ 
      message: 'Competence updated successfully', 
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

const deleteCompetence = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await Competence.deleteById(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Competence not found', 
        success: false 
      });
    }

    res.json({ 
      message: 'Competence deleted successfully', 
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompetence,
  getAllCompetences,
  updateCompetence,
  deleteCompetence
};