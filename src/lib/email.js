import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPatientCredentials(email, username, defaultPassword) {
  const message = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "FitBalance account created",
    text: `Your FitBalance account has been created.\n\nUsername: ${username}\nTemporary password: ${defaultPassword}\n\nPlease change your password upon first login.`,
    html: `<p>Your FitBalance account has been created.</p><p><strong>Username:</strong> ${username}<br/><strong>Temporary password:</strong> ${defaultPassword}</p><p>Please change your password upon first login.</p>`,
  }

  await transporter.sendMail(message)
}

export default transporter