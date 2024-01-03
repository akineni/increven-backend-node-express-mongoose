require('dotenv').config()
const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    //port: 465, //defaults to 587 if secure is false or 465 if true
    secure: true,
    auth: {
        user: process.env.FROM,
        pass: process.env.PASSWORD
    }
})