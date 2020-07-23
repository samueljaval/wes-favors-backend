const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    favor: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Favor'
    },
	details: {
		type : String,
		required : true
	},
    dateTime: {
        type : Date,
        required : true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

commentSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Comment = mongoose.model("Comment", commentSchema)
module.exports = Comment
