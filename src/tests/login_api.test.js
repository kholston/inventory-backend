import supertest from 'supertest'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import helper from './test_helper'
import app from '../app'

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

describe('Login', () => {
  describe('with one user in the database', () => {
    describe('with valid credentials', () => {
      test('login is successful', async () => {
        const login = { username: 'main', password: 'password' }

        await api
          .post('/api/login')
          .send(login)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
      test('a token with user information is returned', async () => {
        const login = { username: 'main', password: 'password' }

        const response = await api
          .post('/api/login')
          .send(login)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        const result = response.body
        expect(result.token).toBeDefined()

        const users = await helper.usersInDb()
        const decodedToken = jwt.verify(result.token, process.env.SECRET)
        expect(decodedToken.username).toBe('main')
        expect(decodedToken.id).toBe(users[0].id)
      })
    })
    describe('with invalid credentials', () => {
      test('login fails with status code 401', async () => {
        const invalidLogin = {
          username: 'invalidUser',
          password: 'invalidPassword',
        }

        await api
          .post('/api/login')
          .send(invalidLogin)
          .expect(401)
          .expect('Content-Type', /application\/json/)
      })
      test('login fails if username is missing', async () => {
        const invalidLogin = { password: 'missingUsername' }

        const response = await api
          .post('/api/login')
          .send(invalidLogin)
          .expect(401)
          .expect('Content-Type', /application\/json/)

        expect(response.body.token).toBeUndefined()

        const error = response.body.errors[0].msg
        expect(error).toContain('username is required')
      })
      test('login fails if password is missing', async () => {
        const invalidLogin = { username: 'missingPassword' }

        const response = await api
          .post('/api/login')
          .send(invalidLogin)
          .expect(401)
          .expect('Content-Type', /application\/json/)

        expect(response.body.token).toBeUndefined()

        const error = response.body.errors[0].msg
        expect(error).toContain('password is required')
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
