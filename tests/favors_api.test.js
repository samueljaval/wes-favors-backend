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


// still need to test deleting, commenting accepting

afterAll(() => {
  mongoose.connection.close()
})
