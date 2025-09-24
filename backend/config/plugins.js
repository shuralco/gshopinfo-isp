module.exports = {
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USERNAME || 'your-email@gmail.com',
          pass: process.env.SMTP_PASSWORD || 'your-app-password',
        },
        secure: false, // true for 465, false for other ports
      },
      settings: {
        defaultFrom: process.env.SMTP_FROM || 'your-email@gmail.com',
        defaultReplyTo: process.env.SMTP_REPLY_TO || 'your-email@gmail.com',
      },
    },
  },
};