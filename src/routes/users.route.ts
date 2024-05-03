import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import usersMiddleware from '~/middlewares/users.middlewares'

const usersRouter = Router()
// usersRouter.use(usersMiddleware)

usersRouter.post('/login', usersMiddleware, loginController)

usersRouter.post('/register', registerController)

// Define your routes here

export default usersRouter
