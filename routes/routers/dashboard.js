var router = require('express').Router()
const { userModel } = require('../../_mongoose/models')

router.get('/current-user/', (req, res) => {  
    userModel.findById(res.locals.uid, (err, user) => {
        if (err) throw err

        res.send(user)
    })
})

module.exports = router