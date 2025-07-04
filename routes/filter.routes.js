const express = require("express")
const router = express.Router()
const {
  getAllFilters,
  createFilter,
  deleteFilter,
  updateFilter,
  getFilterById,
  applyFilter,
} = require("../controllers/filter.controller")
const { authenticate } = require("../config/jwt.config")

// Get all saved filters
router.get("/filter/getAllFilters", authenticate, getAllFilters)

// Get single filter by ID
router.get("/filter/:id", authenticate, getFilterById)

// Create new filter
router.post("/filter/create", authenticate, createFilter)

// Update filter
router.put("/filter/update/:id", authenticate, updateFilter)

// Delete filter
router.delete("/filter/delete/:id", authenticate, deleteFilter)

// Apply filter (existing endpoint)
router.post("/filter/apply", authenticate, applyFilter)

module.exports = router
