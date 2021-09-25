import supertest from 'supertest'
import app from '../app'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../models/user'
import helper from './test_helper'

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('password', 10)
  const user = new User({
    username: 'main',
    name: 'superuser',
    passwordHash,
    admin: true,
  })
  await user.save()
})

describe('User', () => {
  describe('with one user in the database', () => {
    test('creation succeeds with fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'testUser',
        name: 'john doe',
        password: 'basicPassword',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map((u) => u.username)
      expect(usernames).toContain('testUser')
    })
    test('creation fails with proper status code and message if username is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        name: 'invalid username',
        password: 'invalid',
      }

      const result = await api
        .post('/api/users')
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

    test('creation fails with proper status code and message if username is invalid', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'in',
        name: 'invalid username',
        password: 'invalid',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const error = result.body.errors[0].msg
      expect(error).toContain('username must be at least 3 characters')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)

      const usernames = usersAtEnd.map((u) => u.username)
      expect(usernames).not.toContain('in')
    })
    test('creation fails with proper status code and message if password is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'invalidPassword',
        name: 'invalid password',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const error = result.body.errors[0].msg
      expect(error).toContain('password is required')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)

      const usernames = usersAtEnd.map((u) => u.username)
      expect(usernames).not.toContain('invalidPassword')
    })

    test('creation fails with proper status code and message if password is invalid', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'invalidPassword',
        name: 'invalid password',
        password: 'in',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const error = result.body.errors[0].msg
      expect(error).toContain('password must be at least 6 characters')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)

      const usernames = usersAtEnd.map((u) => u.username)
      expect(usernames).not.toContain('in')
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
