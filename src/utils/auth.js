import passport from 'passport'
import { Strategy as localStrategy } from 'passport-local'
import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt'
import { validationResult } from 'express-validator'
import { async } from 'regenerator-runtime'
import User from '../models/user'

/** Creates user and tries to save it to database */
passport.use(
  'signup',
  new localStrategy(
    {
      passReqToCallback: true,
    },
    async function (request, username, password, done) {
      try {
        const user = new User({
          username,
          name: request.body.name,
          passwordHash: password,
        })

        const savedUser = await user.save()
        return done(null, savedUser)
      } catch (error) {
        done(error)
      }
    }
  )
)

passport.use(
  'login',
  new localStrategy({ passReqToCallback: true }, async function (
    request,
    username,
    password,
    done
  ) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      return done(errors)
    }

    try {
      const user = await User.findOne({ username }).exec()

      if (!user) {
        return done(null, false, { message: 'user not found' })
      }

      const validate = await user.isValidPassword(password)

      if (!validate) {
        return done(null, false, { message: 'incorrect password' })
      }

      return done(null, user, { message: 'logged in successfully' })
    } catch (error) {
      return done(error)
    }
  })
)

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.SECRET,
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('user_token'),
    },
    async (token, done) => {
      try {
        return done(null, token.user)
      } catch (error) {
        done(error)
      }
    }
  )
)