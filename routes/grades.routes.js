const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grades.controller');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/grade/getAllGrades', gradeController.getAllGrades);
router.get('/grade/getAllGradesName', gradeController.getListeGradeName);

// Admin only routes
router.post('/grade/createGrade', isAdmin, gradeController.createGrade);
router.delete('/grade/deleteGradeById/:id', isAdmin, gradeController.deleteGradeById);
router.put('/grade/updateGradeById/:id', isAdmin, gradeController.updateGrade);

module.exports = router;
