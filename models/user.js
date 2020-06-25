const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = mongoose.Schema({
	username: {
		type : String,
		unique : true,
		required : true,
		minlength : 3
	},
	name: String,
	password: {
		type : String,
		required : true
		// having a minlength here is useless because the password will be big after the hash
	},
})

userSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		// the passwordHash should not be rnevealed
		delete returnedObject.password
	}
})

userSchema.plugin(uniqueValidator)
const User = mongoose.model("User", userSchema)
module.exports = User
