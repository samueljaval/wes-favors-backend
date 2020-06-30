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
})

describe('sign up users', () => {

    test('proper user sign up and no duplicates', async () => {

        await api
            .post('/api/users')
            .send({email: "alpggiaz3@wesleyan.edu",
                   password: "passworD23",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
               })
            .expect(201)
        const users = await helper.usersInDb()
        console.log(users)
        await api
            .post('/api/users')
            .send({email: "alpioioggiaz3@wesleyan.edu",
                   password: "passworD23",
                   name : 'AP',
                   class : 2020,
                   phone : 8609876789,
               })
            .expect(201)

        const users2 = await helper.usersInDb()
        console.log(users2)

        //
        // await api
        //     .post('/api/users')
        //     .send({email: "alpiazza13@wesleyan.edu",
        //            password: "passworD23",
        //            name : 'AP',
        //            class : 2020,
        //            phone : 8609876789,
        //         })
        //     .expect(500)
        //
        // const users = await helper.usersInDb()
        // expect(users[0].email).toBe("alpiazza13@wesleyan.edu")
        // expect(users[1].email).toBe("sam_javal@wesleyan.edu")
        // expect(users.length).toEqual(2)
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
//
// test('a lot of stuff', async () => {
//
//
//     // log in alpiazza13
//     await api
//     .post('/api/login')
//     .send({username: "alpiazza13", password: "password"})
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
//
//     // make sure wrong password fails
//     await api
//     .post('/api/login')
//     .send({username: "alpiazza13", password: "password12"})
//     .expect(401)
//
//     // get alex's info and token
//     const alex = {username: users[0].username, id: users[0].id}
//     const token = jwt.sign(alex, process.env.SECRET)
//
//     // make sure get request of favors works with alex's credentials
//     await api
//     .get('/api/favors')
//     .set('Authorization', 'bearer ' + token)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
//
//     // create favor using alex's account
//     await api
//     .post('/api/favors')
//     .send( {title: 'fake title 1', details: 'fake details 1'} )
//     .set('Authorization', 'bearer ' + token)
//     .expect(201)
//
//     // make sure favore was added to db
//     const favorsNow = await helper.favorsInDb()
//     expect(favorsNow.length).toEqual(2)
//
//     // make sure favor was added to database with the right title
//     const onlyTitles = favorsNow.map(favor => favor.title)
//     expect(onlyTitles).toContain('fake title 1')
//
//     // make sure alex's id was added to that favor as the requester
//     expect(favorsNow[1].requester.toString()).toBe(alex.id)
//
//     // make sure alex's favors list now has that favor's id
//     const id = favorsNow[1].id
//     const usersNow = await helper.usersInDb()
//     const alexFavors = usersNow[0].favors_requested
//     expect(alexFavors[0].toString()).toBe(id)
//
//     // still need to test deleting, commenting accepting
// })


afterAll(() => {
  mongoose.connection.close()
})
