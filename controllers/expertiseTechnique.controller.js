const ExpertiseTechnique = require('../models/expertiseTechnique');

const createExpertiseTechnique = async (req, res, next) => {
  try {
    const { expertiseName, expertiseName_en } = req.body;
    if (!expertiseName || !expertiseName_en) {
      return res.status(400).json({ 
        message: 'expertiseName and expertiseName_en are required', 
        success: false 
      });
    }

    try {
      const newExpertise = await ExpertiseTechnique.create({ expertiseName, expertiseName_en });
      res.status(201).json({ 
        expertiseTechniques: newExpertise,
        success: true 
      });
    } catch (err) {
      if (err.errorNum === 1) {
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

const getAllExpertiseTechniques = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const expertises = await ExpertiseTechnique.findAll(searchTerm);

    res.json({ 
      expertiseTechniques: expertises,
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

const updateExpertiseTechnique = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { expertiseName, expertiseName_en } = req.body;

    const updated = await ExpertiseTechnique.updateById(id, { expertiseName, expertiseName_en });
    if (!updated) {
      return res.status(404).json({ 
        message: 'ExpertiseTechnique not found or not updated', 
        success: false 
      });
    }

    res.json({ 
      message: 'ExpertiseTechnique updated successfully', 
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

const deleteExpertiseTechnique = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await ExpertiseTechnique.deleteById(id);

    if (!deleted) {
      return res.status(404).json({ 
        message: 'ExpertiseTechnique not found', 
        success: false 
      });
    }

    res.json({ 
      message: 'ExpertiseTechnique deleted successfully', 
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpertiseTechnique,
  getAllExpertiseTechniques,
  updateExpertiseTechnique,
  deleteExpertiseTechnique
};
