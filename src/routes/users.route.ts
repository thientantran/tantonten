import { Router } from 'express'
import {
  emailVeryfiedController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailTokenValidator,
  emailValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapSync } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapSync(registerController))
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController)
usersRouter.get('/verify-email', emailTokenValidator, emailVeryfiedController)
usersRouter.post('/resend-email', accessTokenValidator, resendVerifyEmailController)
usersRouter.post('/forgot-password', emailValidator, forgotPasswordController)
// Define your routes here

export default usersRouter
