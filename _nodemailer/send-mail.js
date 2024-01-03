require('dotenv').config()
const { htmlToText } = require('html-to-text')
const transporter = require('./transporter')

module.exports = (to, subject, message) => {
    return transporter.sendMail({
        from: process.env.FROM,
        to: to,
        subject: subject,
        html: message,
        text: htmlToText(message)
    })
}