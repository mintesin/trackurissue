import nodemailer from 'nodemailer'

// Setup transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // user: 'blockerapp01@gmail.com',
    // pass: 'tygp mltl tdps etyr' // Use Gmail app password (NOT your main password)
  }
});

// Function to send emails
export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'blockerapp01@gmail.com',
    to,
    subject,
    text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email error:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
};

export default {
  sendEmail
};
