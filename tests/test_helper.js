const Favor = require('../models/favor')
const User = require('../models/user')
const bcrypt = require("bcrypt")


const initialFavors = [
    {
        title: "First favor",
        details: "first details",
        posted_date_time: new Date(),
        accepted: false,
        comments: [],
        rice: 10
    }
]

const initialUsers = [
    {
        email:"initial@wesleyan.edu" ,
        name:"initial",
        phone:8976543444,
        class:2020,
        password: "$2b$10$6Y3tqnIIg7ybKdnxc/XfuuBXtaAAHxEBj7Rtm67Xgt3vbzks7fRMq" // hash of initiaL123
    }
]

// const nonExistingId = async () => {
//   const note = new Note({ content: 'willremovethissoon' })
//   await note.save()
//   await note.remove()
//
//   return note._id.toString()
// }
//

const favorsInDb = async () => {
  const favors = await Favor.find({})
  return favors.map(favor => favor.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialFavors,
  initialUsers,
  favorsInDb,
  usersInDb
}
