import supertest from 'supertest'
import mongoose from 'mongoose'
import app from '../app'
import Category from '../models/category'
import helper from './test_helper'

const api = supertest(app)

beforeEach(async () => {
  await Category.deleteMany({})
  await Category.insertMany(helper.intitialCategories)
})

describe('Category', () => {
  describe('when there is initially some notes saved', () => {
    test('categories are returned as json', async () => {
      await api
        .get('/api/categories')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all categories are returned', async () => {
      const response = await api.get('/api/categories')

      expect(response.body).toHaveLength(helper.intitialCategories.length)
    })

    test('a specific category in within the returned categories', async () => {
      const response = await api.get('/api/categories')
      const categoryNames = response.body.map((r) => r.name)
      expect(categoryNames).toContain('Guitars')
    })
  })

  describe('viewing a specific category', () => {
    test('succeeds with a valid id', async () => {
      const categoriesAtStart = await helper.categoriesInDb()
      const categoryToView = categoriesAtStart[0]
      const response = await api
        .get(`/api/categories/${categoryToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const processedCategoryToView = JSON.parse(JSON.stringify(categoryToView))
      expect(response.body).toEqual(processedCategoryToView)
    })

    test('fails with status code 404 if category does not exist', async () => {
      const validNonExistingId = await helper.nonExistingId()
      await api.get(`/api/categories/${validNonExistingId}`).expect(404)
    })
  })

  describe('addition of new note', () => {
    test('success with valid data', async () => {
      const newCategory = {
        name: 'Test Category',
        description: 'Category tto test creation',
      }

      await api
        .post('/api/categories')
        .send(newCategory)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const categoriesAtEnd = await helper.categoriesInDb()
      expect(categoriesAtEnd).toHaveLength(helper.intitialCategories.length + 1)

      const contents = categoriesAtEnd.map((c) => c.name)
      expect(contents).toContain('Test Category')
    })

    test('fails with status code 400 if data is invalid', async () => {
      const newCategory = {
        name: 'Invalid Category',
      }

      await api.post('/api/categories').send(newCategory).expect(400)

      const categoriesAtEnd = await helper.categoriesInDb()
      expect(categoriesAtEnd).toHaveLength(helper.intitialCategories.length)
    })
  })

  describe('deletion of note', () => {
    test('a category can be deleted', async () => {
      const categoriesAtStart = await helper.categoriesInDb()
      const categoryToDelete = categoriesAtStart[0]

      await api.delete(`/api/categories/${categoryToDelete.id}`).expect(204)

      const categoriesAtEnd = await helper.categoriesInDb()
      expect(categoriesAtEnd).toHaveLength(helper.intitialCategories.length - 1)

      const categories = categoriesAtEnd.map((c) => c.name)
      expect(categories).not.toContain(categoryToDelete.name)
    })

    test.todo('fails with status code 400 if category is still in use')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
