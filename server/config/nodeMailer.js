import nodemailer from "nodemailer";

// Create a transporter instance using the SMTP configuration
const transporter = nodemailer.createTransport({
   host: "smtp-relay.brevo.com",
   port: 587,
   auth: {
      user: process.env.SMTP_USER, // SMTP user (email address or username from environment variables)
      pass: process.env.SMTP_PASS, // SMTP password (from environment variables)
   },
});

export default transporter;
