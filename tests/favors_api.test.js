const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Favor = require('../models/favor')
const User = require('../models/user')
const jwt = require("jsonwebtoken")





beforeEach(async () => {
  await Favor.deleteMany({})
  await User.deleteMany({})


  const favorObjects = helper.initialFavors
    .map(favor => new Favor(favor))
  const promiseArray = favorObjects.map(favor => favor.save())
  await Promise.all(promiseArray)
})

test('creating users is successful', async () => {
    await api
    .post('/api/users')
    .send({username: "alpiazza13", password: "password"})
    .expect(201)

    await api
      .post('/api/users')
      .send({username: "sam_javal", password: "password2"})
      .expect(201)

      await api
        .post('/api/users')
        .send({username: "sam_javal", password: "password3"})
        .expect(500)

    const users = await helper.usersInDb()
    expect(users[0].username).toBe("alpiazza13")
    expect(users[1].username).toBe("sam_javal")
    expect(users.length).toEqual(2)

    await api
    .post('/api/login')
    .send({username: "alpiazza13", password: "password"})
    .expect(200)
    .expect('Content-Type', /application\/json/)

    await api
    .post('/api/login')
    .send({username: "alpiazza13", password: "password12"})
    .expect(401)

    const alex = {username: users[0].username, id: users[0].id}
    const token = jwt.sign(alex, process.env.SECRET)

    await api
    .get('/api/favors')
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    await api
    .post('/api/favors')
    .send( {title: 'fake title 1', details: 'fake title 2'} )
    .set('Authorization', 'bearer ' + token)
    .expect(201)

    const favorsNow = await helper.favorsInDb()
    expect(favorsNow.length).toEqual(2)


    const onlyTitles = favorsNow.map(favor => favor.title)
    expect(onlyTitles).toContain('fake title 1')

    //test if that favor has that user id in requester field, test if that user has that favor has favor_requested
    console.log(favorsNow[1].requester)

    const usersNow = await helper.usersInDb()
    console.log(usersNow[0].favors_requested)
})


afterAll(() => {
  mongoose.connection.close()
})
