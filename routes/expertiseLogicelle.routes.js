const express = require('express');
const router = express.Router();
const expertiseLogicielleController = require('../controllers/expertiseLogicielle.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public route
router.get('/expertiseLogicielle/getAllExpertiseLogicielles', expertiseLogicielleController.getAllExpertiseLogicielles);

// Admin-only routes
router.post('/expertiseLogicielle/createExpertiseLogicielle', isAdmin, expertiseLogicielleController.createExpertiseLogicielle);
router.put('/expertiseLogicielle/updateExpertiseLogicielle/:id', isAdmin, expertiseLogicielleController.updateExpertiseLogicielle);
router.delete('/expertiseLogicielle/deleteExpertiseLogicielle/:id', isAdmin, expertiseLogicielleController.deleteExpertiseLogicielle);

module.exports = router;
