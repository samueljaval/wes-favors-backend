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

const getUser = async req => {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    return user
}

favorsRouter.post("/", async (req, res, next) => {
    try {
        const body = req.body
        const user = await getUser(req)

        // the if user is to make sure the request was sent by an actual user through the app
        // only wesleyan students will be able to login so that protects us from non wes students
        if (user) {
            if (!body.title || !body.details) {
                return res.status(400).send({error: "either the title or the details of the favor is missing"})
            }

            const favor = new Favor({
                title: body.title,
                details: body.details,
                price: body.price,
                location: body.location,
                posted_date_time : new Date(),
                expiration_date_time : body.expiration_date_time,
                accepted: false,
                comments: [],
                requester: user._id
            })
                const savedFavor = await favor.save()
                user.favors_requested = user.favors_requested.concat(savedFavor._id)
                await user.save()
                res.status(201).json(savedFavor)
        }
    }
    catch (error) {
        next(error)
    }
})

favorsRouter.get("/", async (req, res, next) => {
  //   try {
  //       const user = await getUser(req)
  //   if (user) {
  //       favors = await Favor.find({})
  //   	res.json(favors.map(u => u.toJSON()))
  //   }  }
  // catch (error) {
  //     next(error)
  // }
    // only have these two lines to allow unauthenticated access
    favors = await Favor.find({})
    res.json(favors.map(u => u.toJSON()))
})

favorsRouter.delete('/:id', async (req, res) => {
    try {
        const user = await getUser(req)
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

favorsRouter.put('/accept/:id', async (req, res) => {
    try {
        const user = await getUser(req)
        if (user) {
            const favor = await Favor.findById(req.params.id)
            favor.accepted = true
            await favor.save()
            user.favors_accepted.push(req.params.id)
            console.log(user.favors_accepted)
            await user.save()
            res.status(201).json({ hooray : 'successfully accepted', favor : favor})
        }
    }
    catch (error){
        next(error)
    }
})

favorsRouter.put('/comment/:id', async (req, res) => {
    try {
        const user = await getUser(req)
        if (user) {
            const favor = await Favor.findById(req.params.id)
            favor.comments.push(req.body.comment)
            await favor.save()
            res.status(201).json({commentPosted : req.body.comment, favor : favor})
        }
    }
    catch (error) {
        next(error)
    }
})


favorsRouter.put('/:id', async (req, res, next) => {
    try {
        const user = await getUser(req)
        if (user) {
            const body = req.body
            const favor = {
              title: body.title,
              details: body.details,
              price: body.price,
              location: body.location
            }
            const updateFavor = await Favor.findByIdAndUpdate(req.params.id, favor, { new: true })
            res.json(updateFavor.toJSON())
        }
    }
    catch (error) {
        next(error)
    }
})
//
// title: body.title,
// details: body.details,
// price: body.price,
// location: body.location,
// posted_date_time : new Date(),
// expiration_date_time : body.expiration_date_time,
// accepted: false,
// comments: [],
// requester: user._id


module.exports = favorsRouter
