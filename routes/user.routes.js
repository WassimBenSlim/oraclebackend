const express = require("express")
const router = express.Router()
const { getAllUsers, confirmUser } = require("../models/user")
const { register, confirmAccount, login, getLoggedInUser, logout } = require("../controllers/user.controller") // Import the confirmAccount function
const { authenticate } = require("../config/jwt.config")

// Route to get all users
router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers() // Fetch users from the database
    res.json(users) // Return the list of users as JSON
  } catch (err) {
    res.status(500).json({ error: err.message }) // Handle errors
  }
})

// Route to register a new user
router.post("/register", register) // Add the register route

// Route to confirm the user's account via the activation code
router.get("/confirm/:activationCode", confirmAccount)

// Route to log in a user
router.post("/login", login) // Add the login route

// Add this route after the login route
router.post("/logout", authenticate, logout)

// Route to get logged-in user info with authentication
router.get("/users/getloggedinuser", authenticate, getLoggedInUser)

module.exports = router
