const nodemailer = require("nodemailer");
require("dotenv").config();

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // <<< SANDBOX not live
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

module.exports.sendConfirmationEmail = async (email, activationCode) => {
  try {
    await transport.sendMail({
      from: process.env.OFFICIAL_EMAIL,
      to: email,
      subject: "Confirmer votre compte",
      html: `<h1>Email de Confirmation</h1>
        <p>Pour activer votre compte, veuillez cliquer sur ce lien :</p>
        <a href="http://localhost:3000/api/confirm/${activationCode}">Cliquer ici</a>`,
    });
    console.log("Confirmation email sent successfully.");
  } catch (err) {
    console.error("Error sending confirmation email:", err);
  }
};

module.exports.sendResetPasswordEmail = async (email, resetURL) => {
  try {
    await transport.sendMail({
      from: process.env.OFFICIAL_EMAIL,
      to: email,
      subject: "Reset password",
      html: `<a href=${resetURL}>Reset link</a>`,
    });
    console.log("Reset password email sent successfully.");
  } catch (err) {
    console.error("Error sending reset password email:", err);
  }
};


module.exports.contactUsEmail = async (email, name, subject, message) => {
  try {
      // Send email
      await transport.sendMail({
        from: process.env.OFFICIAL_EMAIL,
        to: email,
        subject: `Message from ${email} - ${subject}`,
        html: `<p>Name: ${name}</p><p>Message: ${message}</p>`
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Rethrow the error to handle it in the caller function
    }
}


module.exports.sendNotificationMailForUpdating = async (email,nom,prenom) => {
  const prenomCap = prenom.charAt(0).toUpperCase() + prenom.slice(1);
  await transport.sendMail({
          from : process.env.OFFICIAL_EMAIL,
          to : email,
          subject : "MyCV: Mettez à jour votre profil",
          html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">Bonjour ${prenomCap},</p>
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">Nous vous prions de bien vouloir mettre à jour votre profil sur MyCV dans les plus brefs délais.</p>
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">Voici le lien pour y accéder : ${URL}</p>
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">Nous vous remercions pour votre compréhension et votre coopération.</p>
                      <p style="font-size: 14px; color: #666; margin-top: 20px;">Ceci est un e-mail automatique, merci de ne pas répondre.</p>
                  </div>
                  <div style="text-align: center; margin-top: 20px;">
                      <img src="https://i.imgur.com/HPW8as8.png" alt="Logo MyCV" style="max-width: 200px;">
                  </div>
              </div>
              `
      }
  ).catch((err) => console.log(err));
};


module.exports.sendNotificationMailForUpdatingForAllCollectionMembers = async (users) => {
  try {
      const mailsToSend = users.map((user) => {
          const { email, nom, prenom } = user;
          const prenomCap = prenom.charAt(0).toUpperCase() + prenom.slice(1);
          return transport.sendMail({
              from: process.env.OFFICIAL_EMAIL,
              to: email,
              subject: "MyCV - Mettez à jour votre profil",
              html: `
                  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                          <p style="font-size: 16px; line-height: 1.6; color: #333;">Bonjour ${prenomCap},</p>
                          <p style="font-size: 16px; line-height: 1.6; color: #333;">Nous vous prions de bien vouloir mettre à jour votre profil sur MyCV dans les plus brefs délais.</p>
                          <p style="font-size: 16px; line-height: 1.6; color: #333;">Voici le lien pour y accéder : ${URL}</p>
                          <p style="font-size: 16px; line-height: 1.6; color: #333;">Nous vous remercions pour votre compréhension et votre coopération.</p>
                          <p style="font-size: 14px; color: #666; margin-top: 20px;">Ceci est un e-mail automatique, merci de ne pas répondre.</p>
                      </div>
                      <div style="text-align: center; margin-top: 20px;">
                          <img src="https://i.imgur.com/HPW8as8.png" alt="Logo MyCV" style="max-width: 200px;">
                      </div>
                  </div>
              `
          });
      });
      await Promise.all(mailsToSend);
  } catch (err) {
      console.error('Une erreur est survenue lors de l\'envoi des e-mails :', err);
  }
};

