import { Router } from 'express'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
import { wrapSync } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapSync(registerController))

// Define your routes here

export default usersRouter
