import supertest from 'supertest'
import mongoose from 'mongoose'
import app from '../app'
import Item from '../models/item'
import Manufacturer from '../models/manufacturer'
import Category from '../models/category'
import ItemInstance from '../models/itemInstance'
import helper from './test_helper'

const api = supertest(app)

beforeEach(async () => {
  await Manufacturer.deleteMany({})
  const manufacturers = await Manufacturer.insertMany(
    helper.initialManufacturers
  )
  await Category.deleteMany({})
  const categories = await Category.insertMany(helper.intitialCategories)
  await Item.deleteMany({})
  const items = await Item.insertMany(
    helper.initialItemsWithAllFields(manufacturers, categories)
  )
  await ItemInstance.deleteMany({})
  await ItemInstance.insertMany(helper.instancesWithItems(items))
})

describe('Item Instance', () => {
  describe('when there are initally some item instances saved', () => {
    test('item instances are retuned as json', async () => {
      await api
        .get('/api/iteminstances')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('all item instances are returned', async () => {
      const response = await api.get('/api/iteminstances')
      expect(response.body).toHaveLength(helper.initialItemInstances.length)
    })
    test('a specific item instance is within the returned item instances', async () => {
      const instances = helper.initialItemInstances
      const response = await api.get('/api/iteminstances')
      const serialNumbers = response.body.map((i) => i.serial_number)
      expect(serialNumbers).toContain(instances[0].serial_number)
    })
  })
  describe('viewing a specific item instance', () => {
    test('succeeds with a valid id', async () => {
      const instancesAtTheStart = await helper.itemInstancesInDb()
      const instanceToView = instancesAtTheStart[0]
      const response = await api
        .get(`/api/iteminstances/${instanceToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const processedInstance = JSON.parse(JSON.stringify(instanceToView))
      expect(response.body).toEqual(processedInstance)
    })
    test('fails with status code 404 if item instance does not exist', async () => {
      const validNonExistingId = await helper.nonExistingId()
      await api.get(`/api/iteminstances/${validNonExistingId}`).expect(404)
    })
  })
  describe('addition of new item instance', () => {
    test('success with valid data', async () => {
      const items = await helper.itemsInDb()
      const newInstance = {
        item: items[4],
        serial_number: 'POIU96325745',
      }
      await api
        .post('/api/iteminstaces')
        .send(newInstance)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const instancesAtEnd = await helper.itemInstancesInDb()
      expect(instancesAtEnd).toHaveLength(
        helper.initialItemInstances.length + 1
      )
    })
    test('fails with status code 400 if data is invalid', async () => {
      const invalidInstance = {
        serial_number: 'invalid instance',
      }

      await api.post('/api/iteminstances').send(invalidInstance).expect(400)
      const instancesAtEnd = await helper.itemInstancesInDb()
      expect(instancesAtEnd).toHaveLength(helper.initialItemInstances.length)
    })
  })
  describe('deletion of item instance', () => {
    test('an item instance can be deleted', async () => {
      const instancesAtStart = await helper.itemInstancesInDb()
      const instanceToDelete = instancesAtStart[0]

      await api.delete(`/api/iteminstances/${instanceToDelete.id}`).expect(204)

      const instancesAtEnd = await helper.itemInstancesInDb()
      expect(instancesAtEnd).toHaveLength(
        helper.initialItemInstances.length - 1
      )

      const instances = instancesAtEnd.map((i) => i.serial_number)
      expect(instances).not.toContain(instanceToDelete.serial_number)
    })
    test.todo('fails with status code 400 if item instance is still in use')
    test('fails with status code 404 if item instance does not exist', async () => {
      const validNonExistingId = helper.nonExistingId()

      await api.delete(`/api/iteminstances/${validNonExistingId}`).expect(404)
      const instancesAtEnd = await helper.itemInstancesInDb()
      expect(instancesAtEnd).toHaveLength(helper.initialItemInstances.length)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
