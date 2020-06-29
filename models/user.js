const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = mongoose.Schema({
	email: {
		type : String,
		unique : true,
		required : true,
	},
	name: {
		type : String,
		required : true
	},
	class: {
		type : Number,			// ex : 2021
		required : true
	},
	password: {
		type : String,
		required : true
		// having a minlength here is useless because the password will be big after the hash
	},
	phone: {
		type : Number, 			// ex : 8603452333
		required : true
	},
	active : Boolean,  // this will be for account verification through email confirmation
    favors_requested: [
	    {
		    type: mongoose.Schema.Types.ObjectId,
		    ref: 'Favor'
	    }
    ],
	favors_accepted: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Favor'
		}
	]
})

userSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		// the passwordHash should not be revealed
		delete returnedObject.password
	}
})

userSchema.plugin(uniqueValidator)
const User = mongoose.model("User", userSchema)
module.exports = User
