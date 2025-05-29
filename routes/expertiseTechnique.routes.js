const express = require('express');
const router = express.Router();
const expertiseTechniqueController = require('../controllers/expertiseTechnique.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/expertiseTechnique/getAllExpertiseTechniques', expertiseTechniqueController.getAllExpertiseTechniques);

// Admin only routes
router.post('/expertiseTechnique/createExpertiseTechnique', isAdmin, expertiseTechniqueController.createExpertiseTechnique);
router.put('/expertiseTechnique/updateExpertiseTechnique/:id', isAdmin, expertiseTechniqueController.updateExpertiseTechnique);
router.delete('/expertiseTechnique/deleteExpertiseTechnique/:id', isAdmin, expertiseTechniqueController.deleteExpertiseTechnique);

module.exports = router;
