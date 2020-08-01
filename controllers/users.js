const usersRouter = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const crypto = require('crypto')
const Token = require("../models/emailToken")
const mailgun = require("mailgun-js");

// checking if password is at least 8 char long,
// has at leastno one upperCase, one lowerCase and a digit
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
            if (req.body.name) {
                if (req.body.Class) {
                    if (req.body.phone) {
                        if (passCheck(req.body.password)) {
            				if (req.body.email.includes("@wesleyan.edu")) {
            					const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
            					const user = new User({
            						email: req.body.email,
            						name: req.body.name,
            						Class: req.body.Class,
            						phone: req.body.phone,
            						active: false,
            						password: passwordHash
            					})
            					result = await user.save()


                                // Create a verification token for this user
                                const token = new Token({
                                    user: user.id,
                                    token: crypto.randomBytes(16).toString('hex')
                                })

                                // sending the verification email with the sendgrid api
                                // we could consider using the mailgun api for which we get 1 year free with github
                                const DOMAIN = "wesfavors.me"
                                const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});
                                const data = {
                                	from: 'WesFavors <notification@wesfavors.me>',
                                	to: user.email,
                                	subject: 'confirmation email',
                                	text: 'Your verification token is the following : \n\n' + token.token
                                };
                                mg.messages().send(data, function (error, body) {
                                	console.log(body);
                                });
                                token.save()

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
                    else {
                        return res.status(400).send({ error : "phone number is required"})
                    }
                }
                else {
                    return res.status(400).send({ error : "Class year is required"})
                }
            }
            else {
                return res.status(400).send({ error : "Name is required"})
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
