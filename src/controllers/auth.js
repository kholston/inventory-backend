import express from 'express'
import passport from 'passport'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import '../utils/auth'
import middleware from '../utils/middleware'

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
      message: 'Signup Successfully',
      user: request.user,
    })
  }
)

export default authRouter
