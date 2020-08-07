const favorsRouter = require("express").Router()
const Favor = require("../models/favor")
const User = require('../models/user')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const Comment = require("../models/comments")
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const getUser = async (req,res) => {
    const token = getTokenFrom(req)
    console.log("received", token)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    console.log(user)
    return user
}

// creating a favor
favorsRouter.post("/", async (req, res, next) => {
    try {
        const body = req.body
        const user = await getUser(req,res)

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
                category: body.category,
                comments: [],
                requester: user._id
            })
                const savedFavor = await favor.save()
                user.favors_requested = user.favors_requested.concat(savedFavor._id)
                await user.save()
                res.status(201).json(savedFavor)
        }
        else {
            return res.status(400).send({error : "we have a problem, try logging out and in again"})
        }
    }
    catch (error) {
        next(error)
    }
})

// getting list of favors
favorsRouter.get("/", async (req, res, next) => {
     try {
      const user = await getUser(req)
      if (user) {
        favors = await Favor.find({})
        res.json(favors.map(u => u.toJSON()))
      }
     }
   catch (error) {
      next(error)
   }
    // only have these two lines to allow unauthenticated access
    //favors = await Favor.find({})
    //res.json(favors.map(u => u.toJSON()))
})

//deleting favor
favorsRouter.delete('/:id', async (req, res, next) => {
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

// editing favor
favorsRouter.put('/:id', async (req, res, next) => {
    try {
        const user = await getUser(req)
        const favor = await Favor.findById(req.params.id)
        if (user.id == favor.requester) {
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

// accepting favor
favorsRouter.put('/accept/:id', async (req, res, next) => {
    try {
        const user = await getUser(req)
        if (user) {
            const favor = await Favor.findById(req.params.id)
            favor.accepted = true
            favor.completer = user.id
            const requester = await User.findById(favor.requester)
            console.log(requester.phone)
            //send text message
            await twilioClient.messages
              .create({
                 body: 'Hi ' + requester.name + '! ' + user.name + ' has accepted your favor titled: ' + favor.title + '! Here is their phone number: ' + user.phone.toString(),
                 from: process.env.TWILIO_PHONE_NUMBER,
                 to: requester.phone
               })
            await favor.save()
            user.favors_accepted.push(req.params.id)
            await user.save()
            res.status(201).json({ hooray : 'successfully accepted', favor : favor})
        }
    }
    catch (error){
        next(error)
    }
})

// commenting favor
favorsRouter.put('/comment/:id', async (req, res, next) => {
    try {
        const user = await getUser(req)
        if (user) {
            const favor = await Favor.findById(req.params.id)
            const comment = new Comment({
                favor : favor,
                details : req.body.comment,
                dateTime : new Date(),
                user : user.id
            })
            const commentSaved = await comment.save()
            favor.comments.push(commentSaved.id)
            await favor.save()
            res.status(201).json({commentPosted : req.body.comment, favor : favor})
        }
    }
    catch (error) {
        next(error)
    }
})


// deleting comment (the id is the comment id, not the favor id)
favorsRouter.delete('/comment/delete/:id', async (req, res, next) => {
    try {
        const user = await getUser(req)
        const comment = await Comment.findById(req.params.id)
        const favor = await Favor.findById(comment.favor)
        if (user.id == comment.user) {
            await Comment.findByIdAndRemove(req.params.id)
            favor.comments = favor.comments.filter(comment => comment.toString() !== req.params.id)
            await favor.save()
            res.status(201).json({ hooray: 'successfully deleted' })
        }
        else {
            return res.status(401).json({ error: 'this user does not own that comment or that comment just does not exist' })
        }
    }
    catch (error) {
        next(error)
    }
})

// editing a comment (the id is the comment id, not the favor id)
favorsRouter.put('/comment/edit/:id', async (req, res, next) => {
    try {
        const user = await getUser(req)
        const comment = await Comment.findById(req.params.id)
        if (user.id == comment.user) {
            const body = req.body
            comment.details = body.comment
            comment.dateTime = new Date()
            const updateComment = await Comment.findByIdAndUpdate(req.params.id, comment, { new: true })
            res.json(updateComment.toJSON())
        }
    }
    catch (error) {
        next(error)
    }
})

module.exports = favorsRouter
