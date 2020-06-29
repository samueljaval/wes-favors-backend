const Favor = require('../models/favor')
const User = require('../models/user')


const initialFavors = [
    {title: "First favor", details: "first details", posted_date_time: new Date(), accepted: false, comments: [], price: 10}
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
  favorsInDb,
  usersInDb
}
