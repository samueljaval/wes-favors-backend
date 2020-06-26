const usersRouter = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")

usersRouter.post("/", async (req,res,next) => {
	try {
		const saltRounds = 10
		if (req.body.password) {
			if (req.body.password.length > 2) {
				const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
				const user = new User({
					username : req.body.username,
					name : req.body.name,
					password : passwordHash,
				})
				result = await user.save()
				res.status(201).json(result)
			}
			else {return res.status(400).send({ error : "password needs to be at least 3 characters" })}
		}
		else {return res.status(400).send({ error : "password needs to be defined" })}
	}
	catch (error) {
		next(error)
	}

})

usersRouter.get("/", async (req, res) => {
	users = await User.find({})
	res.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter
