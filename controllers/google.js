const googleRouter = require("express").Router()
const User = require("../models/user")
const {OAuth2Client} = require('google-auth-library')
const jwt = require("jsonwebtoken")


const client = new OAuth2Client(process.env.CLIENT_ID)

googleRouter.post("/", async (req, res) => {
    const tokenId = req.body.tokenId
    const response = await client.verifyIdToken({idToken : tokenId, audience : process.env.CLIENT_ID})
    let email_verified = null
    let email = null
    if (response) {
        email_verified = response.payload.email_verified
        email = response.payload.email
    }
    else {
        return res.status(400).send({error : "problem with Google OAuth"})
    }
    if (email_verified) {
        // || true is for testing
        // || true is for testing
        // || true is for testing
        if (email.includes("@wesleyan.edu") || true) {
            const user = await User.findOne({email})
            if (user) {
                 console.log('user')
                const userForToken = {
    				email: email,
    				id: user._id,
    			}
    			const token = jwt.sign(userForToken, process.env.SECRET)
                res.status(200).send({ token })
            }
            else {
                const newUser = new User({
                    email: email,
                    new_user: true
                })
                const response = await newUser.save()
                const user = await User.findOne({email})
                if (response) {
                    const userForToken = {
        				email: email,
        				id: user._id,
        			}
        			const token = jwt.sign(userForToken, process.env.SECRET)
                    res.status(200).send({ token })
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
