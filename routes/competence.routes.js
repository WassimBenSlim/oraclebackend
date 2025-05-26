const express = require('express');
const router = express.Router();
const competenceController = require('../controllers/competence.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/competence/getAllCompetences', competenceController.getAllCompetences);

// Admin only routes
router.post('/competence/createCompetence', isAdmin, competenceController.createCompetence);
router.put('/competence/updateCompetence/:id', isAdmin, competenceController.updateCompetence);
router.delete('/competence/deleteCompetence/:id', isAdmin, competenceController.deleteCompetence);

module.exports = router;