const mongoose = require("mongoose");
const { userSchema } = require("./schemas");

//The first argument is the singular name of the collection your model is for.
//Mongoose automatically looks for the plural, lowercased version of your model name.
module.exports = {
    userModel: mongoose.model('User', userSchema)
}