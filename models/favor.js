const mongoose = require("mongoose")

const favorSchema = mongoose.Schema({
	title: {
		type : String,
		required : true,
		minlength : 3
	},
	details: {
		type : String,
		required : true,
		minlength : 3
	},
	price: Number,
    likes: Number,
    location: String,
    date_time: Date,
    accepted: Boolean,
    completed: Boolean,
    paid: Boolean,
    completer_rating: Number,
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
