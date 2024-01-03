require('../../_mongoose/connection')
require('dotenv').config()
const { userModel } = require('../../_mongoose/models')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const async = require('async')
const { validationResult } = require('express-validator')
const { 
    registrationValidation,
    logInValidation, 
    accountCredentialRecoveryValidation 
} = require('../../_middlewares/validation')
const jwt = require('jsonwebtoken')
const sendMail = require('../../_nodemailer/send-mail')
var router = require('express').Router()

router.post('/log-in', logInValidation, (req, res) => {

    //if (errors) don't bother search database
    var validationErrors = validationResult(req).formatWith( ({ msg }) => {
        return msg
    })
    if(!validationErrors.isEmpty()) return res.send({ validationErrors: validationErrors.mapped() })

    userModel.findOne({ email: req.body.email }, 'password', (error, document) => {
        if(error) throw error

        if(!document) return res.status(401).end()
        
        //email found

        bcrypt.compare(req.body.password, document.password, (error, result) => {
            if (error) throw error
            
            if (result) { //user found
                var token = jwt.sign({ uid: document._id }, process.env.JWT_SECRET_KEY, {
                    expiresIn: process.env.JWT_EXPIRY
                })
                return res.json({ token })
            }
            res.status(401).end()
        })
    })
})

router.post('/register', registrationValidation, (req, res) => {

    var validationErrors = validationResult(req).formatWith( ({ msg }) => {
        return msg
    })
    if(!validationErrors.isEmpty()) return res.send({ validationErrors: validationErrors.mapped() })

    async.waterfall([
        cb => {
            bcrypt.hash(req.body.password, Number.parseInt(process.env.SALT_ROUNDS), (error, hash) => {
                if(error) cb(error)

                if(hash){
                    req.body.password = hash

                    /*no need to delete unnecessary fields like password2 and acceptance because
                    they are not defined in the schema*/

                    cb(null)
                }
            })    
        },
        cb => {
            userModel.create(req.body, (error, document) => {
                if(error) cb(error)

                if(document) cb(null, document)
            })
        },
        (document, cb) => {
            vToken = crypto.randomBytes(32).toString('hex')
            bcrypt.hash(vToken, Number.parseInt(process.env.SALT_ROUNDS), (error, hash) => {
                if(error) cb(error)

                if (hash) {
                    body = `Hi, ${ document.username },<br>you are welcome to Increven, an investment company that is committed to helping you achieve your long term financial goals. We are committed to "Increasing revenue".<p>We are excited to have you started. First, you need to verify your account. Just click the following link to verify your account.<br><a href="${ req.protocol + '://' + req.header('host') }/verify-account?verificationToken=${ vToken }&id=${ document._id }">Verify</a></p>` //read html body from file or http request
                    
                    sendMail(req.body.email, "You are welcome", body).then(
                        info => { if (info.accepted.length == 1) cb(null, document, hash) }, 
                        error => { throw error }
                    )

                    var token = jwt.sign({ uid: document._id }, process.env.JWT_SECRET_KEY, {
                        expiresIn: process.env.JWT_EXPIRY
                    })
                    return res.json({ token })
                }
            })
        },
        (document, verificationToken) => {
            userModel.findByIdAndUpdate(document._id, { verificationToken }, () => {})
        }
    ], error => { throw error })     
})

router.post('/account-credential-recovery', accountCredentialRecoveryValidation, (req, res) => {

    var validationErrors = validationResult(req).formatWith( ({ msg }) => {
        return msg
    })
    if(!validationErrors.isEmpty()) return res.send({ validationErrors: validationErrors.mapped() })

    //check if user exists
    userModel.findOne({email: req.body.email}, 'username', (error, document) => {
        if(error) throw error

        if (!document) return res.status(401).end() /* send respective response */

        var resetToken = crypto.randomBytes(32).toString('hex')
        var resetPasswordToken = bcrypt.hashSync(resetToken, Number.parseInt(process.env.SALT_ROUNDS))

        //store hash in database, expires in 30 minutes
        userModel.findByIdAndUpdate(
            document._id, 
            { resetPasswordToken, resetPasswordTokenExpires: Date.now() + 1800000 }, () => {} )

        var body = `Hi ${ document.username },<br>you requested to reset your password. Please click the link below to reset your password.<br><a href='${ process.env.FRONTEND_ROOT }/reset-password?resetToken=${ resetToken }&id=${ document._id }'>Reset password</a>`
        sendMail(req.body.email, "Account Credential Recovery", body).then(
            info => { if (info.accepted.length == 1) res.send('sent') }, 
            error => { throw error }
        )
        console.log(body)
    })
})

module.exports = router