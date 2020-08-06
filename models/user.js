const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = mongoose.Schema({
	email: {
		type : String,
		unique : true,
		required : true,
	},
	phone: {
		type : Number,
	},
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
