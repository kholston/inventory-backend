import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user'
import { body, validationResult } from 'express-validator'

const userRouter = express.Router()

const sanitizeInput = [
  body('username')
    .notEmpty()
    .withMessage('`username` is required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be at least 3 characters')
    .escape(),
  body('name').notEmpty().withMessage('name is required').trim().escape(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters')
    .trim()
    .escape(),
]

userRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})
userRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  response.json(user)
})
userRouter.post('/', sanitizeInput, async (request, response) => {
  const errors = validationResult(request)

  if (!errors.isEmpty()) {
    return response.status(400).json(errors)
  }

  const input = request.body
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(input.password, saltRounds)

  const user = new User({
    username: input.username,
    name: input.name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

export default userRouter
