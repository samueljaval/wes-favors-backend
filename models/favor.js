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
	price: Number,
	comments: Array,
    // likes: Number,
    location: String,
    accepted: Boolean,
    // completed: Boolean,
    // paid_and_rated: Boolean,
    // completer_rating: Number,
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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
