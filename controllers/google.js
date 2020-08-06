const googleRouter = require("express").Router()
const User = require("../models/user")
const {OAuth2Client} = require('google-auth-library')
const jwt = require("jsonwebtoken")


const client = new OAuth2Client('626183638213-kr4tf348snk6v6sjm8bdl562hel7kfcd.apps.googleusercontent.com')

googleRouter.post("/", async (req, res) => {
    const tokenId = req.body.tokenId
    const response = await client.verifyIdToken({idToken : tokenId, audience : '626183638213-kr4tf348snk6v6sjm8bdl562hel7kfcd.apps.googleusercontent.com'})
    let email_verified = null
    let email = null
    if (response) {
        console.log(response.payload.email_verified)
        email_verified = response.payload.email_verified
        email = response.payload.email
    }
    else {
        return res.status(400).send({error : "problem with Google OAuth"})
    }
    if (email_verified) {
        if (email.includes("@wesleyan.edu") || true) {
            const user = await User.findOne({email})
            if (user) {
                const userForToken = {
    				email: email,
    				id: user._id,
    			}
    			const token = jwt.sign(userForToken, process.env.SECRET)
                res.status(200).send({ token, email })
            }
            else {
                const user = new User({
                    email: email,
                })
                const response = await user.save()
                if (response) {
                    const userForToken = {
        				email: email,
        				id: user._id,
        			}
        			const token = jwt.sign(userForToken, process.env.SECRET)
                    res.status(200).send({ token, email })
                }
                else {
                    res.status(400).send({ error : "problem creating new user" })
                }
            }
        }
        else {
            return res.status(400).send({ error : "You need a wesleyan.edu google account  " })
        }
    }
})

module.exports = googleRouter
