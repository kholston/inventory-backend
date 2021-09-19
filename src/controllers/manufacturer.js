import express from 'express'
import { body, validationResult } from 'express-validator'
import Manufacturer from '../models/manufacturer'
import Item from '../models/item'

const manufacturerRouter = express.Router()

const sanitizeInput = () => {
  body('name')
    .notEmpty()
    .withMessage('Manufacturer name required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Manufacturer name length must be at least 3 characters')
    .escape()
  body('description')
    .notEmpty()
    .withMessage('Manufacturer description required')
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      'Manufacturer description length must be at least 3 characters'
    )
    .escape()
}

manufacturerRouter.get('/', async (request, response) => {
  const manufacturers = await Manufacturer.find({})
  response.json(manufacturers)
})
manufacturerRouter.get('/:id', async (request, response) => {
  const manufacturer = await Manufacturer.findById(request.params.id)
  if (manufacturer) {
    response.json(manufacturer)
  } else {
    response.status(404).send('manufacturer not found')
  }
})
manufacturerRouter.post('/', async (request, response) => {
  sanitizeInput()
  const errors = validationResult(request)

  if (!errors.isEmpty()) {
    response.status(400).json(errors)
  }

  const manufacturer = new Manufacturer({
    ...request.body,
  })

  const savedManufacturer = await manufacturer.save()
  response.json(savedManufacturer)
})
manufacturerRouter.put('/:id', async (request, response) => {
  sanitizeInput()
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    response.status(400).json(errors)
  }

  const manufacturer = new Manufacturer({
    ...request.body,
  })

  const updatedManufacturer = await Manufacturer.findByIdAndUpdate(
    request.params.id,
    manufacturer,
    { new: true }
  )

  response.json(updatedManufacturer)
})
manufacturerRouter.delete('/:id', async (request, response) => {
  const itemCheck = await Item.find({ manufacturer: request.params.id })
  if (itemCheck.length > 0) {
    return response.status(400).json({
      error: 'remove manufacturer from items before deletion',
      items: itemCheck,
    })
  }

  await Manufacturer.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

export default manufacturerRouter
