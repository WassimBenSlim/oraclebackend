const {
  createUser,
  getUserByEmail,
  getAllUsers,
  confirmUser,
  updateUserById,
  deleteUserById,
  getUserById,
} = require("../models/user")
const { getProfileByUserId } = require("../models/profile") // NEW: Import getProfileByUserId
const { sendConfirmationEmail, sendResetPasswordEmail } = require("../services/emailService")
const { v4: uuidv4 } = require("uuid")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { secret } = require("../config/jwt.config")

// Registration endpoint
module.exports.register = async (req, res, next) => {
  try {
    const { prenom, nom, email, pays, telephone, password, type } = req.body

    // Check if the user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Generate activation code
    const activationCode = uuidv4()

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user (with flag = 0 by default)
    await createUser({
      id: uuidv4(),
      prenom,
      nom,
      email,
      pays,
      telephone,
      password: hashedPassword,
      type,
      flag: 0, // Unconfirmed by default
      activationCode,
    })

    // Send confirmation email with activation code
    await sendConfirmationEmail(email, activationCode)

    res.status(201).json({ message: "User registered successfully. Please check your email to confirm your account." })
  } catch (err) {
    next(err)
  }
}

// Login endpoint
module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(404).json({ message: "No account associated with this email" })
    }

    // Assuming user[8] is the flag for account activation
    if (user[8] === 0) {
      return res.status(403).json({ message: "Account not activated" })
    }

    // Assuming user[6] is the hashed password
    const passwordIsValid = await bcrypt.compare(password, user[6])
    if (!passwordIsValid) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Assuming user[0] is user ID, user[7] is user type
    const token = jwt.sign({ id: user[0], type: user[7] }, secret, { expiresIn: "1h" })

    // Set the JWT as a secure, HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "Lax", // or 'None' if using cross-site cookies
      maxAge: 3600000, // 1 hour
    })

    // Return success message
    res.json({
      message: "Login successful",
      token,
      userType: user[7], // Return user type
    })
  } catch (err) {
    next(err)
  }
}

// Confirm the account by activation code
module.exports.confirmAccount = async (req, res, next) => {
  try {
    const { activationCode } = req.params

    const result = await confirmUser(activationCode)
    if (!result) {
      return res.status(400).json({ message: "Invalid or already confirmed activation code" })
    }

    res.status(200).json({ message: "Account confirmed successfully" })
  } catch (err) {
    next(err)
  }
}

// Get all users (admin only)
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (err) {
    next(err)
  }
}

// Get a user by ID
module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
}

// Update user details
module.exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await updateUserById(req.params.id, req.body)
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ message: "User updated successfully", updatedUser })
  } catch (err) {
    next(err)
  }
}

// Delete user by ID
module.exports.deleteUser = async (req, res, next) => {
  try {
    const result = await deleteUserById(req.params.id)
    if (!result) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ message: "User deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// Get logged-in user's data
module.exports.getLoggedInUser = async (req, res, next) => {
  try {
    const userId = req.user.id // Comes from JWT payload
    const user = await getUserById(userId) // This returns an array-like object from Oracle

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Format basic user data from the array-like Oracle result
    const userData = {
      id: user[0],
      prenom: user[1],
      nom: user[2],
      email: user[3],
      pays: user[4],
      telephone: user[5],
      type: user[7],
      flag: user[8],
    }

    // NEW: Fetch user's profile
    const userProfile = await getProfileByUserId(userId)

    // NEW: If a profile exists, format it and add to the response
    if (userProfile) {
      // Oracle returns column names in uppercase by default
      const formattedProfile = {
        _id: userProfile.ID,
        user: {
          _id: userProfile.USER_ID,
          // You might want to fetch full user details here if not already available
          // or rely on the userData already constructed
        },
        cvLanguage: userProfile.CVLANGUAGE || "fr",
        description: userProfile.DESCRIPTION,
        experienceYears: userProfile.EXPERIENCEYEARS,
        images: userProfile.IMAGES,
        // Parse JSON string fields
        langues: userProfile.LANGUES ? JSON.parse(userProfile.LANGUES) : {},
        formations: userProfile.FORMATIONS ? JSON.parse(userProfile.FORMATIONS) : [],
        formations_en: userProfile.FORMATIONS_EN ? JSON.parse(userProfile.FORMATIONS_EN) : [],
        expSignificatives: userProfile.EXP_SIGNIFICATIVES ? JSON.parse(userProfile.EXP_SIGNIFICATIVES) : [],
        expSignificatives_en: userProfile.EXP_SIGNIFICATIVES_EN ? JSON.parse(userProfile.EXP_SIGNIFICATIVES_EN) : [],
        grade: userProfile.GRADE_ID
          ? {
              _id: userProfile.GRADE_ID,
              gradeName: userProfile.GRADE_NAME,
              gradeName_en: userProfile.GRADE_NAME_EN,
            }
          : null,
        metier: userProfile.METIER_ID
          ? {
              _id: userProfile.METIER_ID,
              metierName: userProfile.METIER_NAME,
              metierName_en: userProfile.METIER_NAME_EN,
            }
          : null,
        poste: userProfile.POSTE_ID
          ? {
              _id: userProfile.POSTE_ID,
              posteName: userProfile.POSTE_NAME,
              posteName_en: userProfile.POSTE_NAME_EN,
            }
          : null,
      }
      // Add the formatted profile to the response data under the 'profil' key
      userData.profil = formattedProfile
    }

    res.status(200).json(userData)
  } catch (err) {
    next(err)
  }
}

// Logout endpoint
module.exports.logout = async (req, res, next) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    })

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Logout failed",
    })
  }
}
