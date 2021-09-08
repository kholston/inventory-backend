import supertest from 'supertest'
import mongoose from 'mongoose'
import app from '../app'
import Manufacturer from '../models/manufacturer'
import helper from './test_helper'

const api = supertest(app)

beforeEach(async () => {
  await Manufacturer.deleteMany({})
  await Manufacturer.insertMany(helper.intitialManufacturers)
})

describe.only('Manufacturer', () => {
  describe('when there are initially some manufacturers saved', () => {
    test('manufacturers are returned as json', async () => {
      await api
        .get('/api/manufacturers')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('all manufacturers are returned', async () => {
      const response = await api.get('/api/manufacturers')
      expect(response.body).toHaveLength(helper.initialManufacturers.length)
    })
    test('a specific manufacturer is within the returned manufacturers', async () => {
      const manufacturerToCheck = helper.initialManufacturers
      const response = await api.get('/api/manufacturers')
      const manufacturersNames = response.body.map((m) => m.name)
      expect(manufacturersNames).toContain(manufacturerToCheck[0].name)
    })
  })

  describe('viewing a specific manufacturer', () => {
    test('succeeds with a valid id', async () => {
      const manufacturersAtStart = await helper.manufacturersInDb()
      const manufacturerToView = manufacturersAtStart[0]
      const response = api
        .get(`/api/manufacturers/${manufacturerToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const processedManufacturer = JSON.parse(
        JSON.stringify(manufacturerToView)
      )
      expect(response.body).toEqual(processedManufacturer)
    })
    test('fails with status code 404 if manufacturer does not exist', async () => {
      const validNonExistingId = helper.nonExistingId()

      await api.get(`/api/manufacturers/${validNonExistingId}`).expect(404)
    })
  })

  describe('addition of new manufacturer', () => {
    test('success with valid data', async () => {
      const newManufacturer = {
        name: 'Test Manufacturer',
        description: 'A manufacturer used to test creation',
      }

      await api
        .post('/api/manufacturers')
        .send(newManufacturer)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const manufacturersAtEnd = await helper.manufacturersInDb()
      expect(manufacturersAtEnd).toHaveLength(
        helper.initialManufacturers.length + 1
      )

      const contents = manufacturersAtEnd.map((m) => m.name)
      expect(contents).toContain('Test Manufacturer')
    })
    test('fails with status code 400 if data is invalid', async () => {
      const invalidManufacturer = {
        name: 'Invalid Manufacturer',
      }

      await api.post('/api/manufacturers').send(invalidManufacturer).expect(400)

      const manufacturersAtEnd = await helper.manufacturersInDb()
      expect(manufacturersAtEnd).toHaveLength(
        helper.initialManufacturers.length
      )
    })
  })

  describe('deletion of manufacturer', () => {
    test('a manufacturer can be deleted', async () => {
      const manufacturersAtStart = await helper.manufacturersInDb()
      const manufacturerToDelete = manufacturersAtStart[0]

      await api
        .delete(`/api/manufacturers/${manufacturerToDelete.id}`)
        .expect(204)

      const manufacturersAtEnd = helper.manufacturersInDb()
      expect(manufacturersAtEnd).toHaveLength(
        helper.initialManufacturers.length - 1
      )

      const manufacturers = manufacturersAtEnd.map((m) => m.name)
      expect(manufacturers).not.toContain(manufacturerToDelete.name)
    })
    test.todo('fails with status code 400 if manufacturer is still in use')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
