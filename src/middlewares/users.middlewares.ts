import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import databaseServices from '~/services/database.services'
import { validate } from '~/utils/validation'

export const usersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic goes here
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  next()
}
export const loginValidator = validate(
  checkSchema({
    email: {
      errorMessage: 'Invalid email',
      notEmpty: {
        errorMessage: 'Email is required'
      },
      isEmail: {
        errorMessage: 'Invalid email'
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseServices.users.findOne({ email: value })
          if (!user) {
            throw { message: 'User does not exist ', status: 401 }
          }
          req.user = user
          return true
        }
      }
    },
    password: {
      errorMessage: 'Invalid password',
      notEmpty: {
        errorMessage: 'Password is required'
      },
      isString: true
    }
  })
)
export const registerValidator = validate(
  checkSchema({
    name: {
      errorMessage: 'Invalid name',
      notEmpty: {
        errorMessage: 'Name is required'
      },
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true,
      isString: true
    },
    email: {
      errorMessage: 'Invalid email',
      notEmpty: {
        errorMessage: 'Email is required'
      },
      isEmail: {
        errorMessage: 'Invalid email'
      },
      trim: true,
      custom: {
        options: (value) => {
          return databaseServices.users.findOne({ email: value }).then((user) => {
            if (user) {
              throw { message: 'Email already exists', status: 401 }
            }
            return true
          })
        }
      }
    },
    password: {
      errorMessage: 'Invalid password',
      notEmpty: { errorMessage: 'Password is required' },
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: 'Password must be at least 6 characters'
      },
      isString: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0
        },
        errorMessage:
          'Password must be at least 6 characters and contain at least 1 lowercase letter, 1 uppercase letter, and 1 number'
      }
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
