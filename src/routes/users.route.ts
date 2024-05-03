import { Router } from 'express'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()
// usersRouter.use(usersMiddleware)

usersRouter.post('/register', registerValidator, registerController)

// Define your routes here

export default usersRouter
