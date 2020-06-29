const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const loginRouter = require("express").Router()
const User = require("../models/user")

loginRouter.post("/", async (request, response) => {
	const body = request.body
	let email = ""
	// allowing to omit the @wesleyan.edu of the email at login
	body.email.includes("@wesleyan.edu") ? email = body.email
										 : email = body.email + "@wesleyan.edu"
	const user = await User.findOne({email})
	const passwordCorrect = user === null
		? false
		: await bcrypt.compare(body.password, user.password)

	if (!(user && passwordCorrect)) {
		return response.status(401).json({
			error: "invalid email or password"
		})
	}

	const userForToken = {
		// username: user.username,
		email: user.email,
		id: user._id,
	}
	const token = jwt.sign(userForToken, process.env.SECRET)

	response
		.status(200)
		// .send({ token, username: user.username, name: user.name })
		.send({ token, email: user.email, name: user.name })

})

module.exports = loginRouter
