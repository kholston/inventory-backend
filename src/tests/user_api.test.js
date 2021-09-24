import supertest from 'supertest'
import app from '../app'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../models/user'
import helper from './test_helper'

const api = supertest(app)

beforeAll(async () => {
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
    test.todo('creation succeeds with fresh username')
    test.todo(
      'creation fails with proper status code and message if username is missing'
    )
    test.todo(
      'creation fails with proper status code and message if username is invalid'
    )
    test.todo(
      'creation fails with proper status code and message if password is missing'
    )
    test.todo(
      'creation fails with proper status code and message if password is invalid'
    )
  })
})

afterAll(() => {
  mongoose.connection.close()
})