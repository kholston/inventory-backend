import supertest from 'supertest'
import mongoose from 'mongoose'
import app from '../app'
import Manufacturer from '../models/manufacturer'
import Category from '../models/category'
import Item from '../models/item'
import ItemInstance from '../models/itemInstance'
import helper from './test_helper'
import { describe } from '@jest/globals'

const api = supertest(app)

beforeEach(async () => {
  await Manufacturer.deleteMany({})
  const manufacturers = await Manufacturer.insertMany(
    helper.initialManufacturers
  )
  await Category.deleteMany({})
  const categories = await Category.insertMany(helper.intitialCategories)
  await Item.deleteMany({})
  await Item.insertMany(
    helper.initialItemsWithAllFields(manufacturers, categories)
  )
})
describe('Item', () => {
  describe('when there are initially some manufacturers saved', () => {
    test('items are returned as json', async () => {
      await api
        .get('/api/items')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('all items are returned', async () => {
      const response = await api.get('/api/items')
      expect(response.body).toHaveLength(helper.initialItems.length)
    })
    test('a specific item is within the returned items', async () => {
      const itemToCheck = helper.initialItems[0]
      const response = await api
        .get('/api/items')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const itemNames = response.body.map((i) => i.name)
      expect(itemNames).toContain(itemToCheck.name)
    })
  })
  describe('viewing a specific item', () => {
    test('succeeds with a valid id', async () => {
      const itemsAtStart = await helper.itemsInDb()
      const itemToView = itemsAtStart[0]
      const response = await api
        .get(`/api/items/${itemToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const processedItem = JSON.parse(JSON.stringify(itemToView))
      expect(response.body).toEqual(processedItem)
    })
    test('fails with invalid id', async () => {
      const validNonExistingId = await helper.nonExistingId()
      await api.get(`/api/items/${validNonExistingId}`).expect(404)
    })
  })
  describe('addition of new item', () => {
    test('succeeds with valid data', async () => {
      const manufacturers = await helper.manufacturersInDb()
      const categories = await helper.categoriesInDb()
      const newItem = {
        name: 'SM57 Cardioid Dynamic Microphone',
        description:
          'An industry standard microphone for live sound or studio recording',
        price: '99.99',
        number_in_stock: 0,
        category: [categories[2].id],
        manufacturer: manufacturers[4].id,
      }

      await api
        .post('/api/items')
        .send(newItem)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const itemsAtEnd = await helper.itemsInDb()
      expect(itemsAtEnd).toHaveLength(helper.initialItems.length + 1)
    })

    test('fails with status code 400 if data is invalid', async () => {
      const invalidItem = {
        name: 'Invalid Item',
        description: '',
        price: 'invalid',
      }

      await api.post('/api/items').send(invalidItem).expect(400)
      const itemsAtEnd = await helper.itemsInDb()
      expect(itemsAtEnd).toHaveLength(helper.initialItems.length)
    })
  })
  describe('deletion of item', () => {
    test('an item can be deleted', async () => {
      const itemsAtStart = await helper.itemsInDb()
      const itemToDelete = itemsAtStart[0]

      await api.delete(`/api/items/${itemToDelete.id}`).expect(204)

      const itemsAtEnd = await helper.itemsInDb()
      expect(itemsAtEnd).toHaveLength(helper.initialItems.length - 1)

      const items = itemsAtEnd.map((i) => i.name)
      expect(items).not.toContain(itemToDelete.name)
    })
    test('fails with status code if item is still referenced', async () => {
      const itemsAtStart = await helper.itemsInDb()
      const itemToDelete = itemsAtStart[0]
      const testInstance = await new ItemInstance({
        item: itemToDelete.id,
        serial_number: 'test serial',
      }).save()

      const response = await api
        .delete(`/api/items/${itemToDelete.id}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const body = response.body
      expect(body.error).toBe('remove item instances before deletion')
      const processedInstance = JSON.parse(JSON.stringify(testInstance))
      expect(body.itemInstances[0]).toEqual(processedInstance)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
