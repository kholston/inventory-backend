import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user'

const loginRouter = express.Router()

const sanitizeInput = [
  body('username')
    .notEmpty()
    .withMessage('username is required')
    .trim()
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .trim()
    .escape(),
]

loginRouter.post('/', sanitizeInput, async (request, response) => {
  const errors = validationResult(request)

  if (!errors.isEmpty()) {
    return response.status(401).json(errors)
  }
  const body = request.body

  const user = await User.findOne({ username: body.username }).exec()
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: 60 * 60 })

  response.status(200).json({ token, username: user.username, name: user.name })
})

export default loginRouter
