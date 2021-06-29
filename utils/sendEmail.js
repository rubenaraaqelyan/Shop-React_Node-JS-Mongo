const nodemailer = require('nodemailer');

const {SMTP_PASSWORD, SMTP_HOST, SMTP_FROM_EMAIL, SMTP_EMAIL, SMTP_PORT, SMTP_FROM_NAME} = process.env;

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD
        }
    });

    const message = {
        from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(message)
}

module.exports = sendEmail;
