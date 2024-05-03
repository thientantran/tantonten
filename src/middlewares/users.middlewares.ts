import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const usersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic goes here
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      errorMessage: 'Invalid name',
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true,
      isString: true
    },
    email: {
      errorMessage: 'Invalid email',
      notEmpty: true,
      isEmail: true,
      trim: true
    },
    password: {
      errorMessage: 'Invalid password',
      notEmpty: true,
      isLength: {
        options: { min: 6, max: 100 }
      },
      isString: true
      // isStrongPassword: true
    },
    confirm_password: {
      errorMessage: 'Passwords do not match',
      notEmpty: true,
      isLength: {
        options: { min: 6, max: 100 }
      },
      isString: true,
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            // value is confirm_password
            throw new Error('Passwords do not match')
          }
          return true
        }
      }
      // isStrongPassword: true
    },
    date_of_birth: {
      errorMessage: 'Invalid date of birth',
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
