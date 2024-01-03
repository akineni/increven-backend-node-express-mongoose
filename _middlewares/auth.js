const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
    jwt.verify(
        req.get('Authorization') && req.get('Authorization').split(' ')[1], 
        process.env.JWT_SECRET_KEY, 
        (error, payload) => {
            if(error) throw error //status 401
            res.locals.uid = payload.uid
            next()
        }
    )
}