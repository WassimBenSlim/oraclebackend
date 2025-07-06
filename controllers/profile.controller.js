const {
  createProfile,
  getProfileByUserId,
  getProfileById,
  updateProfile,
  deleteProfile,
  getProfilesWithName,
} = require("../models/profile")
const { getUserByEmail, getUserById } = require("../models/user")
const { sendNotificationMailForUpdatingForAllCollectionMembers } = require("../services/emailService")
const { v4: uuidv4 } = require("uuid")
const PDFDocument = require("pdfkit")
const archiver = require("archiver")
const fs = require("fs")
const path = require("path")
const nodemailer = require("nodemailer")
const connection = require("../config/oracle.config")

// Use your existing Mailtrap configuration
const transport = nodemailer.createTransporter({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
})

// NEW: Get complete profile data for CV preview
module.exports.getProfileForPreview = async (req, res, next) => {
  let conn
  try {
    const profileId = req.params.profileId

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required",
      })
    }

    conn = await connection()

    // Get complete profile data with user, grade, metier, and poste information
    const query = `
      SELECT 
        p.id as profile_id,
        p.user_id,
        p.cvlanguage,
        p.description,
        p.experienceyears,
        p.langues,
        p.formations,
        p.formations_en,
        p.expsignificatives,
        p.expsignificatives_en,
        p.images,
        p.createdat as profile_created,
        u.id as user_id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.flag,
        g.id as grade_id,
        g.gradename,
        g.gradename_en,
        m.id as metier_id,
        m.metiername,
        m.metiername_en,
        pos.id as poste_id,
        pos.postename,
        pos.postename_en
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN metiers m ON p.metier_id = m.id
      LEFT JOIN postes pos ON p.poste_id = pos.id
      WHERE p.id = :profileId AND u.flag = 1
    `

    const result = await conn.execute(query, { profileId })

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      })
    }

    const row = result.rows[0]

    // Format the response to match frontend expectations
    const profileData = {
      _id: row[0], // profile_id
      user_id: row[1],
      cvLanguage: row[2] || "fr",
      description: row[3],
      experienceYears: row[4],
      langues: row[5] ? JSON.parse(row[5]) : {},
      formations: row[6] ? JSON.parse(row[6]) : [],
      formations_en: row[7] ? JSON.parse(row[7]) : [],
      expSignificatives: row[8] ? JSON.parse(row[8]) : [],
      expSignificatives_en: row[9] ? JSON.parse(row[9]) : [],
      images: row[10],
      createdAt: row[11],
      user: {
        _id: row[12], // user_id
        nom: row[13],
        prenom: row[14],
        email: row[15],
        telephone: row[16],
        flag: row[17] === 1,
      },
      grade: row[18]
        ? {
            _id: row[18],
            gradeName: row[19],
            gradeName_en: row[20],
          }
        : null,
      metier: row[21]
        ? {
            _id: row[21],
            metierName: row[22],
            metierName_en: row[23],
          }
        : null,
      poste: row[24]
        ? {
            _id: row[24],
            posteName: row[25],
            posteName_en: row[26],
          }
        : null,
    }

    // Get additional profile data (competences, expertises) if they exist in your database
    // You might need to add these queries based on your database structure

    res.json({
      success: true,
      profile: profileData,
    })
  } catch (error) {
    console.error("Error fetching profile for preview:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  } finally {
    if (conn) await conn.close()
  }
}

module.exports.getProfilesWithName = async (req, res, next) => {
  try {
    const { search } = req.query

    // Validate search parameter
    if (search && typeof search !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search parameter must be a string",
      })
    }

    const profiles = await getProfilesWithName(search)

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No profiles found",
        profiles: [],
      })
    }

    return res.json({
      success: true,
      count: profiles.length,
      profiles,
    })
  } catch (err) {
    console.error("Error in getProfilesWithName:", err)

    if (err.errorNum === 904) {
      return res.status(500).json({
        success: false,
        message: "Database configuration error",
        details: "Please contact support",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profiles",
    })
  }
}

module.exports.addProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const profileData = req.body

    const existingProfile = await getProfileByUserId(userId)
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user" })
    }

    const profileId = uuidv4()
    await createProfile({
      id: profileId,
      user_id: userId,
      cvLanguage: profileData.cvLanguage || "fr",
      description: profileData.description || null,
      experienceYears: profileData.experienceYears || null,
      langues: JSON.stringify(profileData.langues || { FR: false, IT: false, EN: false, DE: false, ES: false }),
      formations: JSON.stringify(profileData.formations || [{ type: "", libelle: "" }]),
      formations_en: JSON.stringify(profileData.formations_en || [{ type: "", libelle: "" }]),
      expSignificatives: JSON.stringify(profileData.expSignificatives || []),
      expSignificatives_en: JSON.stringify(profileData.expSignificatives_en || []),
      poste_id: profileData.poste_id || null,
      grade_id: profileData.grade_id || null,
      metier_id: profileData.metier_id || null,
      images: profileData.images || null,
    })

    res.status(201).json({
      message: "Profile created successfully",
      profileId,
    })
  } catch (err) {
    next(err)
  }
}

module.exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const profile = await getProfileByUserId(userId)

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    const formattedProfile = {
      ...profile,
      langues: profile.LANGUES ? JSON.parse(profile.LANGUES) : {},
      formations: profile.FORMATIONS ? JSON.parse(profile.FORMATIONS) : [],
      formations_en: profile.FORMATIONS_EN ? JSON.parse(profile.FORMATIONS_EN) : [],
      expSignificatives: profile.EXP_SIGNIFICATIVES ? JSON.parse(profile.EXP_SIGNIFICATIVES) : [],
      expSignificatives_en: profile.EXP_SIGNIFICATIVES_EN ? JSON.parse(profile.EXP_SIGNIFICATIVES_EN) : [],
    }

    res.json(formattedProfile)
  } catch (err) {
    next(err)
  }
}

module.exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const profile = await getProfileByUserId(userId)

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    const updated = await updateProfile(profile.ID, {
      ...req.body,
      langues: JSON.stringify(req.body.langues),
      formations: JSON.stringify(req.body.formations),
      formations_en: JSON.stringify(req.body.formations_en),
      expSignificatives: JSON.stringify(req.body.expSignificatives),
      expSignificatives_en: JSON.stringify(req.body.expSignificatives_en),
    })

    if (!updated) {
      return res.status(400).json({ message: "Failed to update profile" })
    }

    res.json({ message: "Profile updated successfully" })
  } catch (err) {
    next(err)
  }
}

module.exports.deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const profile = await getProfileByUserId(userId)

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    const deleted = await deleteProfile(profile.ID)

    if (!deleted) {
      return res.status(400).json({ message: "Failed to delete profile" })
    }

    res.json({ message: "Profile deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// Generate PDF CV for a single profile
const generateProfilePDF = async (profile, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument()
      const chunks = []

      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      // PDF Header with company branding
      doc.fontSize(20).text(`${user[1]} ${user[2]}`, 50, 50) // prenom nom
      doc.fontSize(12).text(`Email: ${user[3]}`, 50, 80) // email

      let yPosition = 120

      // Experience Years
      if (profile.EXPERIENCEYEARS) {
        doc.text(`Années d'expérience: ${profile.EXPERIENCEYEARS}`, 50, yPosition)
        yPosition += 20
      }

      // Description
      if (profile.DESCRIPTION) {
        doc.text("Description:", 50, yPosition)
        yPosition += 15
        doc.text(profile.DESCRIPTION, 50, yPosition, { width: 500 })
        yPosition += 60
      }

      // Languages
      if (profile.LANGUES) {
        try {
          const langues = JSON.parse(profile.LANGUES)
          const activeLanguages = Object.keys(langues).filter((lang) => langues[lang])
          if (activeLanguages.length > 0) {
            doc.text("Langues:", 50, yPosition)
            yPosition += 15
            doc.text(activeLanguages.join(", "), 50, yPosition)
            yPosition += 40
          }
        } catch (e) {
          console.error("Error parsing languages:", e)
        }
      }

      // Formations
      const formations = profile.CVLANGUAGE === "en" ? profile.FORMATIONS_EN : profile.FORMATIONS
      if (formations) {
        try {
          const formationsData = JSON.parse(formations)
          if (formationsData.length > 0 && formationsData[0].libelle) {
            doc.text("Formations:", 50, yPosition)
            yPosition += 15
            formationsData.forEach((formation) => {
              if (formation.libelle) {
                doc.text(`• ${formation.type}: ${formation.libelle}`, 50, yPosition)
                yPosition += 20
              }
            })
            yPosition += 20
          }
        } catch (e) {
          console.error("Error parsing formations:", e)
        }
      }

      // Significant Experience
      const experience = profile.CVLANGUAGE === "en" ? profile.EXPSIGNIFICATIVES_EN : profile.EXPSIGNIFICATIVES
      if (experience) {
        try {
          const expData = JSON.parse(experience)
          if (expData.length > 0) {
            doc.text("Expériences significatives:", 50, yPosition)
            yPosition += 15
            expData.forEach((exp) => {
              if (exp.description) {
                doc.text(`• ${exp.description}`, 50, yPosition, { width: 500 })
                yPosition += 30
              }
            })
          }
        } catch (e) {
          console.error("Error parsing experience:", e)
        }
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// Create ZIP file with multiple CV PDFs
const createCVZip = async (emails, zipTitle) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDir = path.join(__dirname, "../temp")
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const zipPath = path.join(tempDir, `${zipTitle || "CVs"}_${uuidv4()}.zip`)
      const output = fs.createWriteStream(zipPath)
      const archive = archiver("zip", { zlib: { level: 9 } })

      output.on("close", () => resolve(zipPath))
      archive.on("error", reject)
      archive.pipe(output)

      // Generate PDF for each email
      for (const email of emails) {
        try {
          const user = await getUserByEmail(email)
          if (user) {
            const profile = await getProfileByUserId(user[0]) // user[0] is the ID

            if (profile) {
              const pdfBuffer = await generateProfilePDF(profile, user)
              const fileName = `${user[1]}_${user[2]}_CV.pdf` // prenom_nom_CV.pdf
              archive.append(pdfBuffer, { name: fileName })
            }
          }
        } catch (error) {
          console.error(`Error generating PDF for email ${email}:`, error)
          // Continue with other profiles even if one fails
        }
      }

      archive.finalize()
    } catch (error) {
      reject(error)
    }
  })
}

// Send email with CV ZIP function
module.exports.sendEmailWithZip = async (req, res) => {
  try {
    const { recipients, subject, content, selectedProfile, titleJointe } = req.body

    if (!recipients || !selectedProfile || selectedProfile.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients and selected profiles are required",
      })
    }

    // Create ZIP file with CVs
    const zipPath = await createCVZip(selectedProfile, titleJointe)

    // Send email with ZIP attachment using your existing transport
    const mailOptions = {
      from: process.env.OFFICIAL_EMAIL,
      to: recipients,
      subject: subject || "CVs des collaborateurs",
      text: content || "Veuillez trouver ci-joint les CVs demandés.",
      attachments: [
        {
          filename: `${titleJointe || "CVs"}.zip`,
          path: zipPath,
        },
      ],
    }

    await transport.sendMail(mailOptions)

    // Clean up temporary ZIP file after 5 seconds
    setTimeout(() => {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath)
      }
    }, 5000)

    res.json({
      success: true,
      message: "Email sent successfully",
      profilesCount: selectedProfile.length,
    })
  } catch (error) {
    console.error("Error sending email with ZIP:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    })
  }
}

// NEW: Notify users to update their profiles
module.exports.notifyUpdateAllInCollection = async (req, res, next) => {
  try {
    const { users } = req.body

    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Users array is required and cannot be empty",
      })
    }

    // Validate user objects have required fields
    const invalidUsers = users.filter((user) => !user.email || !user.nom || !user.prenom)
    if (invalidUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All users must have email, nom, and prenom fields",
        invalidUsers,
      })
    }

    // Use your existing email service function
    await sendNotificationMailForUpdatingForAllCollectionMembers(users)

    res.json({
      success: true,
      message: "Notification emails sent successfully",
      usersNotified: users.length,
    })
  } catch (error) {
    console.error("Error sending notification emails:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send notification emails",
      error: error.message,
    })
  }
}

// Single user notification (what frontend expects)
module.exports.notifyUpdate = async (req, res, next) => {
  try {
    const { email, nom, prenom } = req.body

    // Validate input
    if (!email || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: "Email, nom et prénom sont requis",
      })
    }

    // Use your existing email service function - same as collection notifications
    const { sendNotificationMailForUpdating } = require("../services/emailService")
    await sendNotificationMailForUpdating(email, nom, prenom)

    res.status(200).json({
      success: true,
      message: `Notification envoyée avec succès à ${prenom.charAt(0).toUpperCase() + prenom.slice(1)} ${nom.toUpperCase()}`,
      data: {
        email: email,
        nom: nom,
        prenom: prenom,
      },
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de la notification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Archive profile (what frontend expects)
module.exports.updateUserFlag = async (req, res, next) => {
  let conn
  try {
    const profileId = req.params.id

    conn = await connection()

    const result = await conn.execute(
      `UPDATE users SET flag = 0, updatedAt = CURRENT_TIMESTAMP 
             WHERE id = (SELECT user_id FROM profiles WHERE id = :profileId)`,
      { profileId },
      { autoCommit: true },
    )

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Profile not found" })
    }

    res.json({ message: "Profile archived successfully" })
  } catch (error) {
    console.error("Error archiving profile:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// Get archived profiles
module.exports.getArchivedProfiles = async (req, res, next) => {
  let conn
  try {
    const { search = "" } = req.query

    conn = await connection()

    let query = `
      SELECT DISTINCT
        p.id as profile_id,
        u.id as user_id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.flag,
        g.gradeName,
        pos.posteName,
        p.createdAt
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN postes pos ON p.poste_id = pos.id
      WHERE u.flag = 0
    `

    const binds = {}

    if (search) {
      query += ` AND (LOWER(u.nom) LIKE :search OR LOWER(u.prenom) LIKE :search)`
      binds.search = `%${search.toLowerCase()}%`
    }

    query += ` ORDER BY p.createdAt DESC`

    const result = await conn.execute(query, binds)

    const profiles = result.rows.map((row) => ({
      _id: row[0],
      user: {
        id: row[1],
        nom: row[2],
        prenom: row[3],
        email: row[4],
        telephone: row[5],
        flag: row[6] === 1,
      },
      grade: {
        gradeName: row[7],
      },
      poste: {
        name: row[8],
      },
      createdAt: row[9],
    }))

    res.json(profiles)
  } catch (error) {
    console.error("Error getting archived profiles:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// Restore profile
module.exports.restoreProfile = async (req, res, next) => {
  let conn
  try {
    const profileId = req.params.id

    conn = await connection()

    const result = await conn.execute(
      `UPDATE users SET flag = 1, updatedAt = CURRENT_TIMESTAMP 
             WHERE id = (SELECT user_id FROM profiles WHERE id = :profileId)`,
      { profileId },
      { autoCommit: true },
    )

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Profile not found" })
    }

    res.json({ message: "Profile restored successfully" })
  } catch (error) {
    console.error("Error restoring profile:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}

// Permanently delete profile
module.exports.deleteProfilePermanently = async (req, res, next) => {
  let conn
  try {
    const profileId = req.params.id

    conn = await connection()

    // Delete the profile and user permanently
    const result = await conn.execute(
      `DELETE FROM users WHERE id = (SELECT user_id FROM profiles WHERE id = :profileId)`,
      { profileId },
      { autoCommit: true },
    )

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Profile not found" })
    }

    res.json({ message: "Profile deleted permanently" })
  } catch (error) {
    console.error("Error deleting profile permanently:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    if (conn) await conn.close()
  }
}
