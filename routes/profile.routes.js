const express = require("express")
const router = express.Router()
const {
  addProfile,
  getUserProfile,
  updateUserProfile,
  deleteProfile,
  getProfilesWithName,
  sendEmailWithZip,
  notifyUpdateAllInCollection,
  notifyUpdate,
  updateUserFlag,
  getArchivedProfiles,
  restoreProfile,
  deleteProfilePermanently,
  getProfileForPreview, // Add this import
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

// Notify users to update their profiles (bulk)
router.post("/profil/notifyUpdateAllInCollection", authenticate, notifyUpdateAllInCollection)

// Single user notification
router.post("/profil/notifyUpdate", authenticate, notifyUpdate)

// Archive profile
router.put("/profil/:id/updateUserFlag", authenticate, updateUserFlag)

// NEW: Get archived profiles
router.get("/profilee/getArchived", authenticate, getArchivedProfiles)

// NEW: Restore archived profile
router.put("/profil/restore/:id", authenticate, restoreProfile)

// NEW: Delete profile permanently
router.delete("/profil/delete/:id", authenticate, deleteProfilePermanently)

// NEW: Get complete profile data for CV preview
router.get("/profil/preview/:profileId", authenticate, getProfileForPreview)

module.exports = router
