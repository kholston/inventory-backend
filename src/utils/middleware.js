import logger from './logger'
import { validationResult } from 'express-validator'

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error('error name:', error.name, ' -> error message:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

const validate = (request, response, next) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    return response.status(400).json(errors)
  }
  next()
}

export default {
  validate,
  errorHandler,
  unknownEndpoint,
}
