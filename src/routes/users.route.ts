import { Router } from 'express'
import { loginController } from '~/controllers/users.controllers'
import usersMiddleware from '~/middlewares/users.middlewares'

const usersRouter = Router()
// usersRouter.use(usersMiddleware)

usersRouter.post('/tweets', usersMiddleware, loginController)

usersRouter.get('/tweets2', (req, res) => {
  res.json({
    data: [{ id: 1, text: 'Hello, World 2!' }]
  })
})

// Define your routes here

export default usersRouter
