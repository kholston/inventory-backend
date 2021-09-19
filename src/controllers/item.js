import express from 'express'
import { body, validationResult } from 'express-validator'
import Item from '../models/item'
import ItemInstance from '../models/itemInstance'
// item price regex: /^\d{1,10}\.\d{2}$/
//(price starts with 1-10 digits, then a decimal point and 2 more digits)

const itemRouter = express.Router()

const sanitizeInput = () => {
  body('name')
    .notEmpty()
    .withMessage('Item name required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Item name must be at least 3 characters')
    .escape()
  body('description')
    .notEmpty()
    .withMessage('Item description required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Item description must be at least 3 characters')
    .escape()
  body('category').notEmpty().withMessage('Item Category required').escape()
  body('price')
    .default(0)
    .notEmpty()
    .withMessage('Item price required')
    .escape()
  body('number_in_stock')
    .notEmpty()
    .trim()
    .isInt({ min: 0 })
    .withMessage('Item stock must be greater than zero')
  body('manufacturer').notEmpty().escape()
}

itemRouter.get('/', async (request, response) => {
  const items = await Item.find({})
    .populate('category', {
      name: 1,
      description: 1,
    })
    .populate('manufacturer', {
      name: 1,
      description: 1,
    })
  response.json(items)
})

itemRouter.get('/:id', async (request, response) => {
  const item = await Item.findById(request.params.id)
    .populate('category', { name: 1, description: 1 })
    .populate('manufacturer', { name: 1, description: 1 })
  if (item) {
    response.json(item)
  } else {
    response.status(404).send('item not found')
  }
})

itemRouter.post('/', async (request, response) => {
  sanitizeInput()
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    response.status(400).json(errors)
  } else {
    const item = new Item({
      ...request.body,
    })
    const savedItem = await item.save()
    response.json(savedItem)
  }
})

itemRouter.delete('/:id', async (request, response) => {
  const instanceCheck = await ItemInstance.find({ item: request.params.id })
  if (instanceCheck.length > 0) {
    return response.status(400).json({
      error: 'remove item instances before deletion',
      itemInstances: instanceCheck,
    })
  }

  await Item.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

export default itemRouter
