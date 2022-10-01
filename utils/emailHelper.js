const nodemailer = require('nodemailer')

const mailHelper = async (option) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
              user: process.env.SMTP_USER, 
              pass: process.env.SMTP_PASS, 
            }
          })
          
          const mailOptions = {
            from: 'noreply@gmail.com',
            to: option.email, 
            subject: option.subject, 
            text: option.message
          }

          // send mail with defined transport object
          await transporter.sendMail(mailOptions)
    } catch(err) {
        console.log(err)
    }
}

module.exports = mailHelper