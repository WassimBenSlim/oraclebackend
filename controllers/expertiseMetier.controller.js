const ExpertiseMetier = require('../models/expertiseMetier');

const createExpertiseMetier = async (req, res, next) => {
  try {
    const { expertiseName, expertiseName_en } = req.body;
    if (!expertiseName || !expertiseName_en) {
      return res.status(400).json({ 
        message: 'expertiseName and expertiseName_en are required', 
        success: false 
      });
    }

    try {
      const newExpertise = await ExpertiseMetier.create({ expertiseName, expertiseName_en });
      res.status(201).json({ 
        expertiseMetiers: newExpertise,
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

const getAllExpertiseMetiers = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const expertises = await ExpertiseMetier.findAll(searchTerm);
    
    res.json({ 
      expertiseMetiers: expertises,
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

const updateExpertiseMetier = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { expertiseName, expertiseName_en } = req.body;

    const updated = await ExpertiseMetier.updateById(id, { expertiseName, expertiseName_en });
    if (!updated) {
      return res.status(404).json({ 
        message: 'ExpertiseMetier not found or not updated', 
        success: false 
      });
    }

    res.json({ 
      message: 'ExpertiseMetier updated successfully', 
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

const deleteExpertiseMetier = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await ExpertiseMetier.deleteById(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'ExpertiseMetier not found', 
        success: false 
      });
    }

    res.json({ 
      message: 'ExpertiseMetier deleted successfully', 
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpertiseMetier,
  getAllExpertiseMetiers,
  updateExpertiseMetier,
  deleteExpertiseMetier
};