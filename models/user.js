// for users

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


// passportlocalmongoose automatically generates or sets username & password in salt n hashed form
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// passportlocalmongoose used as plugin bcoz it automatically 
// generates or sets username & password in salt n hash form
// and also provides various methods to use
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);


