import express from 'express'
import { body, validationResult } from 'express-validator'
import ItemInstance from '../models/itemInstance'

const instanceRouter = express.Router()

const sanitizeInput = [
  body('item').exists().withMessage('Item required').trim().escape(),
  body('serial_number')
    .notEmpty()
    .withMessage('Serial Number required')
    .trim()
    .escape(),
]

instanceRouter.get('/', async (request, response) => {
  const instances = await ItemInstance.find({}).populate({
    path: 'item',
    populate: { path: 'manufacturer category' },
  })
  response.json(instances)
})

instanceRouter.get('/:id', async (request, response) => {
  const instance = await ItemInstance.findById(request.params.id).populate({
    path: 'item',
    populate: { path: 'manufacturer category' },
  })
  if (instance) {
    response.json(instance)
  } else {
    response.status(404).send('item instance not found')
  }
})

instanceRouter.post('/', sanitizeInput, async (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    response.status(400).json({ errors })
  } else {
    const newInstance = new ItemInstance({
      ...request.body,
    })
    const savedInstance = await newInstance.save()
    response.json(savedInstance)
  }
})
instanceRouter.put('/:id', sanitizeInput, async (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    response.status(400).json(errors)
  } else {
    const instance = new ItemInstance({
      ...request.body,
    })

    const updatedInstance = await ItemInstance.findByIdAndUpdate(
      request.params.id,
      instance,
      { new: true }
    )

    response.json(updatedInstance)
  }
})
instanceRouter.delete('/:id', async (request, response) => {
  const instance = await ItemInstance.findById(request.params.id)
  if (instance) {
    await ItemInstance.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    response.status(404).send('item instance does not exist')
  }
})

export default instanceRouter
