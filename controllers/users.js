const usersRouter = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const dns = require('dns')


// checking if password is at least 8 char long,
// has at least one upperCase, one lowerCase and a digit
const passCheck = (str) => {
    return (/[a-z]/.test(str))
			&& (/[A-Z]/.test(str))
			&& (/[0-9]/.test(str))
			&& str.length >= 8
}

usersRouter.post("/", async (req, res, next) => {
	try {
		const saltRounds = 10
		if (req.body.password) {
			if (passCheck(req.body.password)) {
				if (req.body.email.includes("@wesleyan.edu")) {
					const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
					const user = new User({
						email: req.body.email,
						name: req.body.name,
						class: req.body.class,
						phone: req.body.phone,
						active: false,
						password: passwordHash
					})
					result = await user.save()
					// a confirmation email will be sent here
					// user should not be able to login as long as the email is not confirmed
					res.status(201).json(result)
				}
				else {
					return res.status(400).send({ error : "you need a wesleyan.edu email to create an account"})

				}
			}
			else {
				const message = "password should have at least 8 characters, one upper case, one lower case and one digit"
				return res.status(400).send({ error : message})
			}
		}
		else {return res.status(400).send({ error : "password needs to be defined" })}
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
