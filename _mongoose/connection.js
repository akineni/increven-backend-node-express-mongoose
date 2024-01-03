const mongoose = require('mongoose')
require('dotenv').config()

//Set up mongoose connection
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

//Get default connection
const defaultConnection = mongoose.connection
defaultConnection.on('error', error => {
    console.error(error);
})
defaultConnection.on('open', () => {
    console.log("Database opened successfully")
})

module.exports = defaultConnection;