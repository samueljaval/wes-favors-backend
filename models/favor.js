const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false)

const favorSchema = mongoose.Schema({
	title: {
		type : String,
		required : true,
	},
	details: {
		type : String,
		required : true,
	},
	posted_date_time: {
		type : Date,
		required : true,
	},
	expiration_date_time: {
		type : Date,
        // commenting this out for now because it's bothering me when testing
		// required : true,
	},
	category: String,
	price: Number,
	comments: Array,
    location: String,
    accepted: Boolean,
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completers: Array,
    minimum_completers_requested: Number,
    maximum_completers_requested: Number

})

favorSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Favor = mongoose.model("Favor", favorSchema)
module.exports = Favor
