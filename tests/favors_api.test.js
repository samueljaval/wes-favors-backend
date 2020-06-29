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

test('a lot of stuff', async () => {
    // create alpiazza 13 and sam_javal users, make sure it works
    await api
    .post('/api/users')
    .send({username: "alpiazza13", password: "password"})
    .expect(201)

    await api
      .post('/api/users')
      .send({username: "sam_javal", password: "password2"})
      .expect(201)

      // make sure you can't add new user with same username
      await api
        .post('/api/users')
        .send({username: "sam_javal", password: "password3"})
        .expect(500)

    // make sure 2 users were added to db and they have the right usernames
    const users = await helper.usersInDb()
    expect(users[0].username).toBe("alpiazza13")
    expect(users[1].username).toBe("sam_javal")
    expect(users.length).toEqual(2)

    // log in alpiazza13
    await api
    .post('/api/login')
    .send({username: "alpiazza13", password: "password"})
    .expect(200)
    .expect('Content-Type', /application\/json/)

    // make sure wrong password fails
    await api
    .post('/api/login')
    .send({username: "alpiazza13", password: "password12"})
    .expect(401)

    // get alex's info and token
    const alex = {username: users[0].username, id: users[0].id}
    const token = jwt.sign(alex, process.env.SECRET)

    // make sure get request of favors works with alex's credentials
    await api
    .get('/api/favors')
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    // create favor using alex's account
    await api
    .post('/api/favors')
    .send( {title: 'fake title 1', details: 'fake details 1'} )
    .set('Authorization', 'bearer ' + token)
    .expect(201)

    // make sure favore was added to db
    const favorsNow = await helper.favorsInDb()
    expect(favorsNow.length).toEqual(2)

    // make sure favor was added to database with the right title
    const onlyTitles = favorsNow.map(favor => favor.title)
    expect(onlyTitles).toContain('fake title 1')

    // make sure alex's id was added to that favor as the requester
    expect(favorsNow[1].requester.toString()).toBe(alex.id)

    // make sure alex's favors list now has that favor's id
    const id = favorsNow[1].id
    const usersNow = await helper.usersInDb()
    const alexFavors = usersNow[0].favors_requested
    expect(alexFavors[0].toString()).toBe(id)

    // still need to test deleting, commenting accepting
})


afterAll(() => {
  mongoose.connection.close()
})
