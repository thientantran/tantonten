import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapSync } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapSync(registerController))
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/logout', accessTokenValidator, logoutController)
// Define your routes here

export default usersRouter
