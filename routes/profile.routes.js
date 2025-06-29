const express = require("express")
const router = express.Router()
const {
  addProfile,
  getUserProfile,
  updateUserProfile,
  deleteProfile,
  getProfilesWithName,
  sendEmailWithZip,
  notifyUpdateAllInCollection, // Add this new import
} = require("../controllers/profile.controller")
const { authenticate } = require("../config/jwt.config")
const upload = require("../middlewares/multer")

// Create profile (for authenticated users)
router.post("/profil/add", authenticate, upload.none(), addProfile)

// Get user's profile
router.get("/profil", authenticate, getUserProfile)

// Update profile
router.put("/profil", authenticate, updateUserProfile)

// Delete profile
router.delete("/profil", authenticate, deleteProfile)

// Get Profile Name
router.get("/profilesWithName", authenticate, getProfilesWithName)

// Send CVs via email
router.post("/profil/sendEmailWithZip", authenticate, sendEmailWithZip)

// NEW: Notify users to update their profiles
router.post("/profil/notifyUpdateAllInCollection", authenticate, notifyUpdateAllInCollection)

module.exports = router
