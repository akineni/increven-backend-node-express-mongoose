const auth = require('../_middlewares/auth')
const { userModel } = require('../_mongoose/models')
const bcrypt = require('bcrypt')
const async = require('async')

module.exports = app => {

    app.use('/auth', require('./routers/auth'))
    app.use('/dashboard', auth, require('./routers/dashboard')) //protected route
    app.use('/utilities', require('./routers/utilities'))

    app.get('/verify-account', (req, res) => {
        async.waterfall([
            cb => {
                userModel.findById(req.query.id, 'verificationToken', (error, document) => {
                    if(error) cb(error)
    
                    if(document) cb(null, document)
                })
            },
            (document, cb) => {
                bcrypt.compare(req.query.verificationToken, document.verificationToken, (error, result) => {
                    if (error) throw error
    
                    if(result) cb(null, document)
                })
            },
            document => {
                userModel.findByIdAndUpdate(document._id, { verified: true, $unset: {'verificationToken': ''} }, 
                () => {} )
            }
        ], error => { throw error })
    })
    
}