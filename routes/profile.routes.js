const express = require('express');
const router = express.Router();
const { 
  addProfile,
  getUserProfile,
  updateUserProfile,
  deleteProfile,
  getProfilesWithName
} = require('../controllers/profile.controller');
const { authenticate } = require('../config/jwt.config');
const upload = require('../middlewares/multer');


// Create profile (for authenticated users)
router.post('/profil/add', authenticate, upload.none(), addProfile);

// Get user's profile
router.get('/profil', authenticate, getUserProfile);

// Update profile
router.put('/profil', authenticate, updateUserProfile);

// Delete profile
router.delete('/profil', authenticate, deleteProfile);

// Get Profile Name
router.get("/profilesWithName", authenticate, getProfilesWithName);

module.exports = router;