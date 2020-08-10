const usersRouter = require("express").Router()
const User = require("../models/user")
const Favor = require("../models/favor")
const Comment = require("../models/comments")
const bcrypt = require("bcrypt")
const crypto = require('crypto')
const Token = require("../models/emailToken")
const mailgun = require("mailgun-js")
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

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
	try {
        const user = await getUser(req)
        const idToDelete = req.params.id

        if (user.id != idToDelete) {
            return res.status(400).send({error: "to delete a user you must be logged in as that user"})
        }

        const found_user = await User.findById(idToDelete)
        if (!found_user) {
            return res.status(400).send({error: "no user exists with the id specified"})
        }

        await User.findByIdAndRemove(idToDelete)
        await Favor.deleteMany({ requester: idToDelete})
        await Comment.deleteMany({ user: idToDelete})
        const allFavorsBad = await Favor.find({})
        const allFavors = allFavorsBad.map(favor => favor.toJSON())
        const favorsToUpdate = allFavors.filter(favor => favor.completer == idToDelete)
        const onlyIds = favorsToUpdate.map(favor => favor.id)
        onlyIds.map(async (id) => {await Favor.findByIdAndUpdate(id, {completer: null})})
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
