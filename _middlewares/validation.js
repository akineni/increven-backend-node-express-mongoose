require('dotenv').config()
const { body } = require('express-validator')
const { userModel } = require('../_mongoose/models')
const bcrypt = require('bcrypt')
const async = require('async')

const passwordMinLength = JSON.parse(process.env.MINLENGTHS).password

module.exports = {
    logInValidation: [
        body(['email', 'password'])
        .trim()
        .notEmpty().withMessage((value, {path}) => {
            return path[0].toUpperCase() + path.substring(1) + " is required"
        }),

        body('email')
        .isEmail().withMessage('Invalid email'),
        
        body('password')
        .isLength({min: passwordMinLength}).withMessage(
            "Minimum length of '" + passwordMinLength + "'")
    ],

    registrationValidation: [
        body(['name.firstName', 'name.lastName', 'username', 'email', 'phoneNumber', 'password', 'password2',
    'acceptance'])
        .trim()
        .notEmpty().withMessage((value, {path}) => {
            return path + " is required"
        }),

        body('email')
        .isEmail().withMessage('Invalid email'),

        body('phoneNumber')
        .isNumeric({no_symbols: true}).withMessage('Invalid phone number'),
        
        body('password')
        .isLength({min: passwordMinLength}).withMessage(
            "Minimum length of '" + passwordMinLength + "'"),

        body('password2')
        .custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('Passwords mismatch')
            
            // Indicates the success of this synchronous custom validator
            return true;
        }),

        body('acceptance')
        .custom(value => {

            //another way of custom validation, different from above
            return value == "true"
        }).withMessage('Accept T&C and privacy policy')
    ],

    accountCredentialRecoveryValidation: [
        body('email')
        .isEmail().withMessage('Invalid email')
    ],

    resetPasswordValidation: [
        body('old_password')
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                async.waterfall([
                    cb => {
                        userModel.findById(req.body.id, 'password', (error, document) => {
                            if(error) cb(error)

                            if (document) cb(null, document)
                        })
                    },
                    (document, cb) => {
                        bcrypt.compare(value, document.password, (error, result) => {
                            if(error) cb(error)
                    
                            return result? resolve() : reject('Old password incorrect')
                        })
                    } 
                ], err => { throw err })
            })
        }),

        body('password')
        .isLength({min: passwordMinLength}).withMessage(
            "Minimum length of '" + passwordMinLength + "'"),

        body('password2')
        .custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('Passwords mismatch')
            
            // Indicates the success of this synchronous custom validator
            return true;
        })
    ]
}