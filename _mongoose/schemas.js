const mongoose = require('mongoose')

module.exports = {
    userSchema: new mongoose.Schema({
        name: {
            firstName: {
                type: String,
                required: true
            },
            lastName: {
                type: String,
                required: true
            }
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        verified: Boolean,
        verificationToken: String,
        resetPasswordToken: String,
        resetPasswordTokenExpires: Date
    })
}