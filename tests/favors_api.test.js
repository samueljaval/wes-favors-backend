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
    const favorObjects = helper.initialFavors.map(favor => new Favor(favor))
    const promiseArray = favorObjects.map(favor => favor.save())
    await Promise.all(promiseArray)
    const usersObject = helper.initialUsers.map(user => new User(user))
    const promiseArrayU = usersObject.map(user => user.save())
    await Promise.all(promiseArrayU)
})

describe('sign up users', () => {

    test('proper user sign up and no duplicates', async () => {

        await api
            .post('/api/users')
            .send({email: "piazza@wesleyan.edu",
                   password: "passworD23",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
               })
            .expect(201)

        await api
            .post('/api/users')
            .send({email: "javal@wesleyan.edu",
                   password: "passworD23",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
               })
            .expect(201)

        await api
            .post('/api/users')
            .send({email: "piazza@wesleyan.edu",
                   password: "passworD23",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
                })
            .expect(500)

    })

    test('wrong email at signup', async () => {
        await api
            .post('/api/users')
            .send({email: "sam_javal",
                   password: "password24E",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
                })
            .expect(400)
    })

    test('wrong password at signup', async () => {
        await api
            .post('/api/users')
            .send({email: "sam_javal@wesleyan.edu",
                   password: "password",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
                })
            .expect(400)
    })

    test('not enough info at signup', async () => {
        await api
            .post('/api/users')
            .send({email: "alpia3@wesleyan.edu",
                   password: "password35T",
                   name : 'AP',
                })
            .expect(500)
    })
})

describe("login", () => {
    test("successful login", async () => {
        await api
            .post('/api/login')
            // we can omit the @wesleyan.edu at login (see users.js)
            .send({
                email:"initial@wesleyan.edu",
                password:"initiaL123"
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test("no login when password wrong", async () => {
        await api
            .post('/api/login')
            .send({email: "initial", password: "password12M"})
            .expect(401)
    })
})

describe("posting favors", () => {

    test("get request of favors", async () => {
        const users = await helper.usersInDb()
        const initial = {email: users[0].email, id: users[0].id}
        const token = jwt.sign(initial, process.env.SECRET)

        await api
            .get('/api/favors')
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test("create favor", async () => {

        const users = await helper.usersInDb()
        const initial = {email: users[0].email, id: users[0].id}
        const token = jwt.sign(initial, process.env.SECRET)

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
        expect(favorsNow[1].requester.toString()).toBe(initial.id)

        // make sure alex's favors list now has that favor's i
        const id = favorsNow[1].id
        const usersNow = await helper.usersInDb()
        const newuser = usersNow[0].favors_requested
        expect(newuser[0].toString()).toBe(id)
    })
})

describe("commenting on favors", () => {

    test("cannot comment if not logged in", async () => {
        const favors = await helper.favorsInDb()
        const id = favors[0].id
        await api
            .post(`/api/favors/comments/${id}`)
            .send( {comment: 'fake comment 1'} )
            // not sure why this is 404 instead of 401 but ok
            .expect(404)
    })

    test("comment is successfully added to that favor", async () => {
        const favors = await helper.favorsInDb()
        const id = favors[0].id
        const users = await helper.usersInDb()
        const initial = {email: users[0].email, id: users[0].id}
        const token = jwt.sign(initial, process.env.SECRET)
        // make sure request goes through
        await api
            .put(`/api/favors/comment/${id}`)
            .send( {comment: 'fake comment 1'} )
            .set('Authorization', 'bearer ' + token)
            .expect(201)
        // make sure comment is added to this favor's comments
        const favorsNow = await helper.favorsInDb()
        expect(favorsNow[0].comments[0]).toBe('fake comment 1')
    })
})

describe("deleting favors", () => {
    // make sure can't delete if not logged in, can't delete if wrong user, successfully deletes if right user

    test("favor is successfully deleted if right user", async () => {

        const users = await helper.usersInDb()
        const initial = {email: users[0].email, id: users[0].id}
        const token = jwt.sign(initial, process.env.SECRET)

        await api
            .post('/api/favors')
            .send( {title: 'fake title 1', details: 'fake details 1'} )
            .set('Authorization', 'bearer ' + token)
            .expect(201)

        const favorsNow = await helper.favorsInDb()
        const id = favorsNow[1].id

        await api
            .delete(`/api/favors/${id}`)
            .set('Authorization', 'bearer ' + token)
            .expect(201)

        const favorsNow2 = await helper.favorsInDb()
        expect(favorsNow2.length).toEqual(1)

    })

})

describe("accepting favors", () => {
    // make sure you have to be logged in, can't accept your own favor, accepting it works and
    //currently it actually is the user accpeting his own favor

    test("favor is successfully accepted if user logged in", async () => {

        const users = await helper.usersInDb()
        const userId = users[0].id
        const initial = {email: users[0].email, id: userId}
        const token = jwt.sign(initial, process.env.SECRET)

        await api
            .post('/api/favors')
            .send( {title: 'fake title 1', details: 'fake details 1'} )
            .set('Authorization', 'bearer ' + token)
            .expect(201)

        const favorsNow = await helper.favorsInDb()
        const favorId = favorsNow[1].id

        await api
            .put(`/api/favors/accept/${favorId}`)
            .set('Authorization', 'bearer ' + token)
            .expect(201)

        const favorsNow2 = await helper.favorsInDb()
        expect(favorsNow2[1].completer.toString()).toBe(userId)
        expect(favorsNow2[1].accepted).toBe(true)

        const usersNow = await helper.usersInDb()
        expect(usersNow[0].favors_accepted.length).toEqual(1)
        expect(usersNow[0].favors_accepted[0].toString()).toBe(favorId)

    })

})

afterAll(() => {
  mongoose.connection.close()
})
