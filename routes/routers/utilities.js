require('dotenv').config()
var router = require('express').Router()
const { userModel } = require('../../_mongoose/models')
const bcrypt = require('bcrypt')
const async = require('async')
const { validationResult } = require('express-validator')
const { resetPasswordValidation } = require('../../_middlewares/validation')

router.get('/unique/:field/:value', (req, res) => {
    var document = {}
    document[req.params.field] = req.params.value
    
    userModel.findOne(document, (err, user) => {
        if (err) throw err

        res.send(user ? false : true)
    })
})

router.get('/reset-password', (req, res) => {

    async.waterfall([
        cb => {
            userModel.findById(req.query.id, (err, document) => {
                if(err) cb(err) //halt execution here and jump to completion callback

                if(document.resetPasswordTokenExpires > Date.now())
                    cb(null, document)
                else
                    return res.status(401).send("Expired")
            })
        },
        (doc) => {
            bcrypt.compare(req.query.resetToken, doc.resetPasswordToken, (error, result) => {
                if(error) throw error
                
                if(result) return res.status(200).end() //show the reset form
                res.status(401).end()
            })
        }
    ], err => { throw err })
    
})

router.post('/reset-password', resetPasswordValidation, (req, res) => {

    var validationErrors = validationResult(req).formatWith( ({ msg }) => {
        return msg
    })
    if(!validationErrors.isEmpty()) return res.send({ validationErrors: validationErrors.mapped() })

    async.waterfall([
        cb => {
            bcrypt.hash(req.body.password, Number.parseInt(process.env.SALT_ROUNDS), (error, hash) => {
                if(error) cb(error)

                if(hash) cb(null, hash)
            })
        },
        (password) => {
            userModel.findByIdAndUpdate(req.body.id, {
                password,
                $unset: { 'resetPasswordToken': '', 'resetPasswordTokenExpires': '' }
            }, (error, document) => {
                if (error) throw error

                if (document) return res.send('password-change-success')
            })
        }
    ], err => { throw err })
})

module.exports = router