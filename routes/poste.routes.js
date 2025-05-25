const express = require('express');
const router = express.Router();
const posteController = require('../controllers/poste.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/poste/getAllPostes', posteController.getAllPostes);

// Admin only routes
router.post('/poste/createPoste', isAdmin, posteController.createPoste);
router.put('/poste/updatePoste/:id', isAdmin, posteController.updatePoste);
router.delete('/poste/deletePoste/:id', isAdmin, posteController.deletePoste);

module.exports = router;