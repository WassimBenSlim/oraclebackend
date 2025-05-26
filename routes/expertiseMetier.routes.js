const express = require('express');
const router = express.Router();
const expertiseMetierController = require('../controllers/expertiseMetier.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/expertiseMetier/getAllExpertiseMetiers', expertiseMetierController.getAllExpertiseMetiers);

// Admin only routes
router.post('/expertiseMetier/createExpertiseMetier', isAdmin, expertiseMetierController.createExpertiseMetier);
router.put('/expertiseMetier/updateExpertiseMetier/:id', isAdmin, expertiseMetierController.updateExpertiseMetier);
router.delete('/expertiseMetier/deleteExpertiseMetier/:id', isAdmin, expertiseMetierController.deleteExpertiseMetier);

module.exports = router;