const express = require('express');
const router = express.Router();
const metierController = require('../controllers/metier.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/metier/getAllMetiers', metierController.getAllMetiers);

// Admin only routes
router.post('/metier/createMetier', isAdmin, metierController.createMetier);
router.delete('/metier/deleteMetierById/:id', isAdmin, metierController.deleteMetierById);
router.put('/metier/updateMetierById/:id', isAdmin, metierController.updateMetierById);

module.exports = router;