const nodemailer = require("nodemailer")

require("dotenv").config()

// Use your existing Mailtrap configuration
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
})

// Confirmation email for user registration
const sendConfirmationEmail = async (email, activationCode) => {
  try {
    await transport.sendMail({
      from: process.env.OFFICIAL_EMAIL,
      to: email,
      subject: "Confirmer votre compte",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Email de Confirmation</h1>
          <p style="color: #555; line-height: 1.6;">
            Pour activer votre compte, veuillez cliquer sur ce lien :
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:3000/api/confirm/${activationCode}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Activer mon compte
            </a>
          </div>
          <p style="color: #888; font-size: 12px;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
            <br>
            http://localhost:3000/api/confirm/${activationCode}
          </p>
        </div>
      `,
    })
    console.log("Confirmation email sent successfully.")
  } catch (err) {
    console.error("Error sending confirmation email:", err)
    throw err
  }
}

// Reset password email
const sendResetPasswordEmail = async (email, resetURL) => {
  try {
    await transport.sendMail({
      from: process.env.OFFICIAL_EMAIL,
      to: email,
      subject: "Reset password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Réinitialisation de mot de passe</h1>
          <p style="color: #555; line-height: 1.6;">
            Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetURL}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #888; font-size: 12px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
        </div>
      `,
    })
    console.log("Reset password email sent successfully.")
  } catch (err) {
    console.error("Error sending reset password email:", err)
    throw err
  }
}

// Contact us email
const contactUsEmail = async (email, name, subject, message) => {
  try {
    await transport.sendMail({
      from: process.env.OFFICIAL_EMAIL,
      to: email,
      subject: `Message from ${email} - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })
    console.log("Contact email sent successfully")
  } catch (error) {
    console.error("Error sending contact email:", error)
    throw error
  }
}

// Single user notification
const sendNotificationMailForUpdating = async (email, nom, prenom) => {
  const prenomCap = prenom.charAt(0).toUpperCase() + prenom.slice(1)
  const appUrl = process.env.APP_URL || "http://localhost:3000/profile"

  try {
    await transport.sendMail({
      from: process.env.OFFICIAL_EMAIL,
      to: email,
      subject: "MyCV: Mettez à jour votre profil",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Bonjour ${prenomCap},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Nous vous prions de bien vouloir mettre à jour votre profil sur MyCV dans les plus brefs délais.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Voici le lien pour y accéder : 
              <a href="${appUrl}" style="color: #007bff;">${appUrl}</a>
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Nous vous remercions pour votre compréhension et votre coopération.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Ceci est un e-mail automatique, merci de ne pas répondre.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <img src="https://i.imgur.com/HPW8as8.png" alt="Logo MyCV" style="max-width: 200px;">
          </div>
        </div>
      `,
    })
    console.log("Notification email sent successfully")
  } catch (err) {
    console.error("Error sending notification email:", err)
    throw err
  }
}

// Bulk notification for collection members
const sendNotificationMailForUpdatingForAllCollectionMembers = async (users) => {
  try {
    console.log(`Preparing to send notification emails to ${users.length} users`)
    const appUrl = process.env.APP_URL || "http://localhost:3000/profile"

    const emailPromises = users.map((user) => {
      const { email, nom, prenom } = user
      const prenomCap = prenom.charAt(0).toUpperCase() + prenom.slice(1)

      return transport.sendMail({
        from: process.env.OFFICIAL_EMAIL,
        to: email,
        subject: "MyCV - Mettez à jour votre profil",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Bonjour ${prenomCap},</p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Nous vous prions de bien vouloir mettre à jour votre profil sur MyCV dans les plus brefs délais.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Voici le lien pour y accéder : 
                <a href="${appUrl}" style="color: #007bff;">${appUrl}</a>
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Nous vous remercions pour votre compréhension et votre coopération.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Ceci est un e-mail automatique, merci de ne pas répondre.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <img src="https://i.imgur.com/HPW8as8.png" alt="Logo MyCV" style="max-width: 200px;">
            </div>
          </div>
        `,
      })
    })

    await Promise.all(emailPromises)
    console.log(`Successfully sent notification emails to ${users.length} users`)

    return {
      success: true,
      message: `Notification emails sent to ${users.length} users`,
    }
  } catch (err) {
    console.error("Une erreur est survenue lors de l'envoi des e-mails :", err)
    throw err
  }
}

module.exports = {
  sendConfirmationEmail,
  sendResetPasswordEmail,
  contactUsEmail,
  sendNotificationMailForUpdating,
  sendNotificationMailForUpdatingForAllCollectionMembers,
}
