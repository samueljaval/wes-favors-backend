require("dotenv").config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
let SECRET = process.env.MONGO_URI + "thisisthesecretkey" //should probably have it in .env

module.exports = {
	MONGODB_URI,
	PORT,
    SECRET
}
