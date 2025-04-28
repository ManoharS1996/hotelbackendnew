const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.APP_USER,
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendEmail };