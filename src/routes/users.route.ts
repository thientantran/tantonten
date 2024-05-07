import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapSync } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapSync(registerController))
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController)
// Define your routes here

export default usersRouter
