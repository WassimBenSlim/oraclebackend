const nodemailer = require("nodemailer")

// Use your existing Mailtrap configuration - FIXED: createTransport (not createTransporter)
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
})

const sendNotificationMailForUpdatingForAllCollectionMembers = async (users) => {
  try {
    console.log(`Preparing to send notification emails to ${users.length} users`)

    // Your application URL - add this to your .env file
    const appUrl = process.env.APP_URL || "http://localhost:3000/profile"

    const emailPromises = users.map(async (user) => {
      const mailOptions = {
        from: process.env.OFFICIAL_Mail || process.env.MAILTRAP_USER, // Using your existing OFFICIAL_Mail
        to: user.email,
        subject: "Mise à jour de votre profil MyCV requise",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Bonjour ${user.prenom},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Nous vous prions de bien vouloir mettre à jour votre profil sur MyCV dans les plus brefs délais.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Voici le lien pour y accéder : 
              <a href="${appUrl}" style="color: #007bff; text-decoration: none;">
                ${appUrl}
              </a>
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Nous vous remercions pour votre compréhension et votre coopération.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #888; font-size: 12px;">
              Ceci est un e-mail automatique, merci de ne pas répondre.
            </p>
          </div>
        `,
        text: `
Bonjour ${user.prenom},

Nous vous prions de bien vouloir mettre à jour votre profil sur MyCV dans les plus brefs délais.

Voici le lien pour y accéder : ${appUrl}

Nous vous remercions pour votre compréhension et votre coopération.

Ceci est un e-mail automatique, merci de ne pas répondre.
        `.trim(),
      }

      return transport.sendMail(mailOptions)
    })

    // Send all emails in parallel
    await Promise.all(emailPromises)
    console.log(`Successfully sent notification emails to ${users.length} users`)

    return {
      success: true,
      message: `Notification emails sent to ${users.length} users`,
    }
  } catch (error) {
    console.error("Error sending notification emails:", error)
    throw new Error(`Failed to send notification emails: ${error.message}`)
  }
}

module.exports = {
  sendNotificationMailForUpdatingForAllCollectionMembers,
}
