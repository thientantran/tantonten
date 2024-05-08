/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import databaseServices from '~/services/database.services'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const usersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic goes here
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  next()
}
export const loginValidator = validate(
  checkSchema(
    {
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
    },
    ['body']
  )
)
export const registerValidator = validate(
  checkSchema(
    {
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
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw { message: 'Authorization header is required', status: 401 }
              }
              const token = value.split(' ')[1]
              if (!token) {
                throw { message: 'Authorization header is required', status: 401 }
              }
              const decode_authorization = await verifyToken({ token, secretOrPublicKey: process.env.JWT_SECRET as string })
              req.decode_authorization = decode_authorization
              return true
            } catch (error) {
              throw { message: 'Invalid Authorization', status: 401 }
            }
          }
        }
      }
    },
    ['headers']
  )
)


export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        // notEmpty: {
        //   errorMessage: 'Refresh token is required'
        // },
        // tra ve loi 422, nhung muon tra ve loi 401
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw { message: 'Refresh is required', status: 401 }
              }
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_REFRESH_KEY as string }),
                databaseServices.refreshToken.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw { message: 'Refresh token does not exist', status: 401 }
                // chỗ này nó sẽ through 1 cái erro, thì nó sẽ xuống phần catch và trả về error mặc định trong đó, chứ ko phải là refresh token không tồn tại, do đó phải custome lại cái catch
              }
              req.decode_refresh_token = decode_refresh_token
              req.refresh_token = refresh_token
              return true
            } catch (error) {
              // throw { message: 'Invalid refresh token', status: 401 }
              if (error instanceof jwt.JsonWebTokenError) {
                throw { message: error.message, status: 401 }
              } else {
                throw error
              }
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailTokenValidator = validate(
  checkSchema(
    {
      email_verified_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw { message: 'Email verify token is required', status: 401 }
            }
            try {
              const decode_email_verify_token = await verifyToken({ token: value, secretOrPublicKey: process.env.JWT_EMAIL_KEY as string })
              req.decode_email_verify_token = decode_email_verify_token
              return true
            } catch (error) {
              if (error instanceof jwt.JsonWebTokenError) {
                throw { message: error.message, status: 401 }
              } else {
                throw { message: "Email verify token is invalid", status: 401 }
              }

            }

          }
        }
      }
    },
    ['query']
  )
)

export const emailValidator = validate(
  checkSchema(
    {
      email: {
        errorMessage: 'Invalid email',
        isEmail: {
          errorMessage: 'Invalid email'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseServices.users.findOne({ email: value })
            if (!user) {
              throw { message: 'Email is not exists', status: 404 }
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const ForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw { message: 'forgot password token is required', status: 401 }
            }
            try {
              const decode_forgot_password_token = await verifyToken({ token: value, secretOrPublicKey: process.env.JWT_FORGOTPASSWORD_KEY as string })
              const user = await databaseServices.users.findOne({ _id: new ObjectId(decode_forgot_password_token.userId) })
              if (!user) {
                return { message: 'User not found', status: 404 }
              }
              if (user.forgot_password_token !== value) {
                throw { message: 'Forgot Password token is invalid', status: 401 }
              }
              req.user = user
              return true
            } catch (error) {
              if (error instanceof jwt.JsonWebTokenError) {
                throw { message: error.message, status: 401 }
              } else {
                throw { message: "Forgot Password token is invalid", status: 401 }
              }
            }
          }
        }
      }
    },
    ['query']
  )
)