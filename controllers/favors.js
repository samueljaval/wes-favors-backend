const favorsRouter = require("express").Router()
const Favor = require("../models/favor")
const User = require('../models/user')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

favorsRouter.post("/", async (req, res, next) => {
    try {
        const body = req.body
        const token = getTokenFrom(req)
        const decodedToken = jwt.verify(token, process.env.SECRET)

          if (!token || !decodedToken.id) {
          return res.status(401).json({ error: 'token missing or invalid' })
        }
        const user = await User.findById(decodedToken.id)

        if (!body.title || !body.details) {
            return res.status(400).send({error: "either the title or the details of the favor is missing"})
        }

        const favor = new Favor({
            title: body.title,
            details: body.details,
            price: body.price,
            // likes: 0,
            location: body.location,
            posted_date_time : new Date(),
            expiration_date_time : body.expiration_date_time,
            accepted: false,
            comments: [],
            // completed: false,
            // paid: false,
            // completer_rating: -1,
            requester: user._id
        })
            const savedFavor = await favor.save()
            // uncomment once we start keeping track of each user's favors
            user.favors_requested = user.favors_requested.concat(savedFavor._id)
            await user.save()
            res.status(201).json(savedFavor)
    }
    catch (error) {
        next(error)
    }
})

favorsRouter.get("/", async (req, res) => {
	favors = await Favor.find({})
	res.json(favors.map(u => u.toJSON()))
})

favorsRouter.delete('/:id', async (req, res) => {
    try {
        // might want to make the next 4/5 lines into a helper function since we do it multiple times
        const token = getTokenFrom(req)
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
          return res.status(401).json({ error: 'token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id)
        if (user.favors_requested.includes(req.params.id)) {
            await Favor.findByIdAndRemove(req.params.id)
            user.favors_requested = user.favors_requested.filter(favor => favor.toString() !== req.params.id)
            await user.save()
            res.status(201).json({ hooray: 'successfully deleted' })
        }
        else {
            return res.status(401).json({ error: 'this user does not own that favor or that favor just does not exist' })
        }
    }
    catch (error) {
        next(error)
    }

})

module.exports = favorsRouter
