const Poste = require('../models/poste');

const createPoste = async (req, res, next) => {
  try {
    const { posteName, posteName_en } = req.body;
    if (!posteName || !posteName_en) {
      return res.status(400).json({ 
        message: 'posteName and posteName_en are required', 
        success: false 
      });
    }

    try {
      const newPoste = await Poste.create({ posteName, posteName_en });
      res.status(201).json({ 
        message: 'Poste created successfully', 
        poste: newPoste,
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

const getAllPostes = async (req, res, next) => {
  try {
    const searchTerm = req.query.search || '';
    const postes = await Poste.findAll(searchTerm);
    
    res.json({ 
      postes,
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

const updatePoste = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { posteName, posteName_en } = req.body;

    const updated = await Poste.updateById(id, { posteName, posteName_en });
    if (!updated) {
      return res.status(404).json({ 
        message: 'Poste not found or not updated', 
        success: false 
      });
    }

    res.json({ 
      message: 'Poste updated successfully', 
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
    const id = req.params.id;
    const deleted = await Poste.softDeleteById(id);
    
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
  updatePoste,
  deletePoste
};