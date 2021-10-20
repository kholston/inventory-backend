import express from 'express'
import passport from 'passport'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import '../utils/auth'
import middleware from '../utils/middleware'
import { async } from 'regenerator-runtime'

const validate = middleware.validate

const authRouter = express.Router()

const sanitizeInput = [
  body('username')
    .notEmpty()
    .withMessage('`username` is required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be at least 3 characters')
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters')
    .trim()
    .escape(),
]

const sanitizeName = body('name')
  .notEmpty()
  .withMessage('name is required')
  .trim()
  .escape()

const sanitizeSignup = sanitizeInput.concat(sanitizeName)

authRouter.post(
  '/signup',
  sanitizeSignup,
  validate,
  passport.authenticate('signup', { session: false }),
  async (request, response, next) => {
    response.json({
      message: 'signup successful',
      user: request.user,
    })
  }
)

authRouter.post(
  '/login',
  sanitizeInput,
  validate,
  async (request, response, next) => {
    passport.authenticate('login', async (err, user, info) => {
      if (err || !user) {
        return response.status(400).json({ error: info.message })
      }

      request.login(user, { session: false }, async (error) => {
        if (error) return next(error)
        const body = { _id: user.id, name: user.name, admin: user.admin }
        const token = jwt.sign({ user: body }, process.env.SECRET)

        return response.json({ token, message: info.message })
      })
    })(request, response, next)
  }
)
export default authRouter
