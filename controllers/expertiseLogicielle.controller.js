const ExpertiseLogicielle = require('../models/expertiseLogicielle');

const createExpertiseLogicielle = async (req, res, next) => {
  try {
    const { expertiseName, expertiseName_en } = req.body;
    if (!expertiseName || !expertiseName_en) {
      return res.status(400).json({
        message: 'expertiseName and expertiseName_en are required',
        success: false
      });
    }

    try {
      const newExpertise = await ExpertiseLogicielle.create({ expertiseName, expertiseName_en });
      res.status(201).json({
        expertiseLogicielles: newExpertise,
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

const getAllExpertiseLogicielles = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const expertises = await ExpertiseLogicielle.findAll(searchTerm);

    res.json({
      expertiseLogicielles: expertises,
      success: true
    });
  } catch (error) {
    next(error);
  }
};

const updateExpertiseLogicielle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { expertiseName, expertiseName_en } = req.body;

    const updated = await ExpertiseLogicielle.updateById(id, { expertiseName, expertiseName_en });
    if (!updated) {
      return res.status(404).json({
        message: 'ExpertiseLogicielle not found or not updated',
        success: false
      });
    }

    res.json({
      message: 'ExpertiseLogicielle updated successfully',
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

const deleteExpertiseLogicielle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await ExpertiseLogicielle.deleteById(id);

    if (!deleted) {
      return res.status(404).json({
        message: 'ExpertiseLogicielle not found',
        success: false
      });
    }

    res.json({
      message: 'ExpertiseLogicielle deleted successfully',
      success: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpertiseLogicielle,
  getAllExpertiseLogicielles,
  updateExpertiseLogicielle,
  deleteExpertiseLogicielle
};
