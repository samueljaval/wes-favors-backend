const usersRouter = require("express").Router()
const User = require("../models/user")
const Favor = require("../models/favor")
const Comment = require("../models/comments")
const bcrypt = require("bcrypt")
const crypto = require('crypto')
const mailgun = require("mailgun-js")
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const getUser = async req => {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    return user
}

usersRouter.delete("/:id", async (req, res, next) => {
    console.log('BEGINNING OF TRYING TO DELETE USER')
	try {
        const user = await getUser(req)
        if (!user) {
            return res.status(400).send({error: "you must be logged in to delete a user"})
        }
        const idToDelete = req.params.id
        if (user.id != idToDelete) {
            return res.status(400).send({error: "you must be logged in as that user to delete it"})
        }
        const found_user = await User.findById(idToDelete)
        if (!found_user) {
            return res.status(400).send({error: "there was an error finding the user to delete"})
        }

        const allFavorsList = await Favor.find({})
        const allFavors = allFavorsList.map(favor => favor.toJSON())
        const allCommentsList = await Comment.find({})
        const allComments = allCommentsList.map(comment => comment.toJSON())

        // removing completers where necessary
        const favorsToBeUnaccepted = allFavors.filter(favor => favor.completers.includes(idToDelete))
        // not changing favor.accepted, since we currently have no way of knowing whether it's already been completed
        const favorsUnaccepted = favorsToBeUnaccepted.map(favor => {
            favor.completers = favor.completers.filter(completer => completer != idToDelete)
            return favor
        })
        favorsUnaccepted.map(async (favor) => {await Favor.findByIdAndUpdate(favor.id, favor)})

        // removing commenters where necesary
        const allFavorsList2 = await Favor.find({})
        const allFavors2 = allFavorsList2.map(favor => favor.toJSON())
        const favorsToDeleteComments = allFavors2.filter(favor => {
            const commenterUserIds = favor.comments.map(commentId => {
                const fullComment = allComments.filter(comment => comment.user == idToDelete)[0]
                const commentUserId = fullComment.user
                return commentUserId.toString()
            })
            return commenterUserIds.includes(idToDelete)
        })
        const favorsCommentsDeleted = favorsToDeleteComments.map(favor => {
            const commentsDeleted = favor.comments.filter(commentId => {
                const fullComment = allComments.filter(comment => comment.id.toString() == commentId)[0]
                return (fullComment.user != idToDelete)
            })
            favor.comments = commentsDeleted
            return favor
        })
        favorsCommentsDeleted.map(async (favor) => {await Favor.findByIdAndUpdate(favor.id, favor)})

        await Comment.deleteMany({ user: idToDelete})
        await Favor.deleteMany({ requester: idToDelete})
        await User.findByIdAndRemove(idToDelete)
        return res.status(201).send({success: "user successfully deleted"})
	}
	catch (error) {
		next(error)
	}

})

// if we don't really need this let's not have it so that no attacker can get the list of users
// usersRouter.get("/", async (req, res) => {
// 	users = await User.find({})
// 	res.json(users.map(u => u.toJSON()))
// })

module.exports = usersRouter
