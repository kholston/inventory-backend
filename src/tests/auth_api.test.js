import supertest from 'supertest'
import mongoose from 'mongoose'
import User from '../models/user'
import helper from './test_helper'
import app from '../app'

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const user = new User({
    username: 'main',
    name: 'superuser',
    passwordHash: 'password',
    admin: true,
  })

  await user.save()
})

describe('Passport Auth', () => {
  describe('with one user in the database', () => {
    describe('Signup', () => {
      test('signup succeeds with new user', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'testUser',
          name: 'john doe',
          password: 'basicPassword',
        }

        const response = await api
          .post('/api/auth/signup')
          .send(newUser)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        const result = response.body.message
        expect(result).toContain('signup successful')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).toContain('testUser')
      })

      test('signup fails with proper status code and message if username is missing', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          name: 'invalid username',
          password: 'invalid',
        }

        const result = await api
          .post('/api/auth/signup')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const error = result.body.errors[0].msg
        expect(error).toEqual('`username` is required')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const names = usersAtEnd.map((u) => u.name)
        expect(names).not.toContain('invalid username')
      })

      test('signup fails with proper status code and message if username in invalid', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'in',
          name: 'invalid username',
          password: 'invalid',
        }

        const result = await api
          .post('/api/auth/signup')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const error = result.body.errors[0].msg
        expect(error).toEqual('username must be at least 3 characters')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).not.toContain('in')
      })

      test('signup fails with proper status code and message if password is missing', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'invalid password',
          name: 'invalid password',
        }

        const result = await api
          .post('/api/auth/signup')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const error = result.body.errors[0].msg
        expect(error).toEqual('password is required')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).not.toContain('invalidPassword')
      })

      test('signup fails with proper status code and message if password is invalid', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'invalidPassword',
          name: 'invalid password',
          password: 'in',
        }

        const result = await api
          .post('/api/auth/signup')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const error = result.body.errors[0].msg
        expect(error).toEqual('password must be at least 6 characters')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).not.toContain('invalidPassword')
      })
    })
    describe('Login', () => {
      describe('with valid credentials', () => {
        test('login is successful', async () => {
          const login = { username: 'main', password: 'password' }

          await api
            .post('/api/auth/login')
            .send(login)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        })

        test('a token with user information is returned', async () => {
          const login = { username: 'main', password: 'password' }

          const response = await api
            .post('/api/auth/login')
            .send(login)
            .expect(200)
            .expect('Content-Type', /application\/json/)

          const result = response.body
          expect(result.token).toBeDefined()
        })
      })
      describe('with invalid credentials', () => {
        test('login fails if username is missing', async () => {
          const login = { password: 'missingUsername' }

          const response = await api
            .post('/api/auth/login')
            .send(login)
            .expect(400)
            .expect('Content-Type', /application\/json/)

          const error = response.body.errors[0].msg
          expect(error).toEqual('`username` is required')
        })
        test('login fails if password is missing', async () => {
          const login = { username: 'missingPassword' }

          const response = await api
            .post('/api/auth/login')
            .send(login)
            .expect(400)
            .expect('Content-Type', /application\/json/)

          const error = response.body.errors[0].msg
          expect(error).toEqual('password is required')
        })
        test('login fails if non-exisitng user', async () => {
          const login = { username: 'johnDoe', password: 'password' }

          const response = await api
            .post('/api/auth/login')
            .send(login)
            .expect(400)
            .expect('Content-Type', /application\/json/)

          const result = response.body.error
          expect(result).toContain('user not found')
        })
        test('login fails id password is incorrect', async () => {
          const login = { username: 'main', password: 'wrongPassword' }

          const response = await api
            .post('/api/auth/login')
            .send(login)
            .expect(400)
            .expect('Content-Type', /application\/json/)

          const result = response.body.error
          expect(result).toContain('incorrect password')
        })
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
