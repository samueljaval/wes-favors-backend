const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const loginRouter = require("express").Router()
const User = require("../models/user")
const Token = require("../models/emailToken")
const sgMail = require('@sendgrid/mail')
const mailgun = require("mailgun-js");

// logging in => getting session token
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
			error: "invalid email or invalid password"
		})
	}

	else {
		if (user.active){
			const userForToken = {
				// username: user.username,
				email: email,
				id: user._id,
			}
			const token = jwt.sign(userForToken, process.env.SECRET)

			response
				.status(200)
				.send({ token })
		}
		else {
			return response.status(401).json({
				error: "account not verified"
			})
		}
	}
})

// verfying that the token entered matches with the token created at signup
loginRouter.post("/verifyToken", async (req,res) => {
	const token = await Token.findOne({ token: req.body.token })
	if (!token) {
		return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' })
	}
	const user = await User.findOne({email : req.body.Email})
	if (!user) {
		return res.status(400).send({ msg: 'We were unable to find a user for this token.' })
	}
	if (user.id == token.user) {
		if (user.active) {
			return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' })
		}
		user.active = true
		user.save(function (err) {
			if (err) { return res.status(500).send({ msg: err.message }) }
			res.status(200).send("The account has been verified")
		})
	}
})

// sending a new token
loginRouter.post("/resendToken", async (req, res) => {
	const user = await User.findOne({email : req.body.email})
	if (user) {
		const token = await Token.findOne({user : user.id})
		let tokenToSend = token
		if (!token) {
			const newToken = new Token({
				user: user.id,
				token: crypto.randomBytes(16).toString('hex')
			})
			newToken.save()
			tokenToSend = newToken
		}
		sgMail.setApiKey(process.env.SENDGRID_API_KEY)
		const msg = {
			to: user.email,
			from: 'wesfavorsapp@gmail.com',
			subject: 'Account Verification Token',
			text: 'Your verification token is the following : \n\n' + tokenToSend.token
		}
		const DOMAIN = "wesfavors.me"
		const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});
		const data = {
			from: 'WesFavors <notification@wesfavors.me>',
			to: user.email,
			subject: 'New confirmation token',
			text: 'Your verification token is the following : \n\n' + tokenToSend.token
		};
		mg.messages().send(data, function (error, body) {
			console.log(body);
		});
		return res.status(200).send({msg : "The token was sent to " + user.email})
	}
	else {
		return res.status(400).send({msg : "No account with this email address"})
	}
})

module.exports = loginRouter
