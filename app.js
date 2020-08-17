const config = require("./utils/config")
const express = require("express")
const app = express()
const cors = require("cors")
const favorsRouter = require("./controllers/favors")
const middleware = require("./utils/middleware")
const logger = require("./utils/logger")
const mongoose = require("mongoose")
const googleRouter = require("./controllers/google")
const usersRouter = require("./controllers/users")


logger.info("connecting to", config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		logger.info("connected to MongoDB")
	})
	.catch((error) => {
		logger.error("error connection to MongoDB:", error.message)
	})

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use("/api/favors", favorsRouter)
app.use("/api/googleLogin", googleRouter)
app.use("/api/users", usersRouter)

module.exports = app
