const express = require('express')
const cors = require('cors')

const app = express()
const port = 3000

app.use(cors())

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

require('./routes/routes')(app)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})