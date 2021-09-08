import express from 'express'
import { body, validationResult } from 'express-validator'
import Item from '../models/item'
import Category from '../models/category'

const categoryRouter = express.Router()

const sanitizeInput = () => {
  body('name')
    .notEmpty()
    .withMessage('Category name required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Category name length must be at least 3 characters')
    .escape()
  body('description')
    .notEmpty()
    .withMessage('Category description required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Category description length must be at least 3 characters')
    .escape()
}

categoryRouter.get('/', async (request, response) => {
  const categories = await Category.find({})
  response.json(categories)
})

categoryRouter.get('/:id', async (request, response) => {
  const category = await Category.findById(request.params.id)
  if (category) {
    response.json(category)
  } else {
    response.status(404).send('category not found')
  }
})
categoryRouter.delete('/:id', async (request, response) => {
  // prevent categories from being deleted before removal from item
  const itemCheck = await Item.find({ category: request.params.id })
  if (itemCheck.length > 0) {
    response.status(400).json({
      error: 'remove category from items before deletion',
      items: itemCheck,
    })
  }

  await Category.findByIdAndDelete(request.params.id)
  response.status(204).end()
})
categoryRouter.put('/:id', async (request, response) => {
  sanitizeInput()
  const errors = validationResult(request)

  if (!errors.isEmpty()) {
    response.status(400).json(errors)
  }

  const category = {
    ...request.body,
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    request.params.id,
    category,
    { new: true }
  )

  response.json(updatedCategory)
})
categoryRouter.post('/', async (request, response) => {
  sanitizeInput()
  const errors = validationResult(request)

  if (!errors.isEmpty()) {
    response.status(400).json(errors)
  }

  const category = new Category({
    ...request.body,
  })
  const savedCategory = await category.save()
  response.json(savedCategory)
})

export default categoryRouter
