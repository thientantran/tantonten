import express, { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import mediaRouter from './routes/media.route'
import usersRouter from './routes/users.route'
import databaseServices from './services/database.services'
import { initFolder } from './utils/file'

const app = express()
const port = 4000
databaseServices.connect()
initFolder()
app.use(express.json())
app.use('/api', usersRouter)
app.use('/media', mediaRouter)
app.get('/', (req, res) => {
  res.send('Hello, World!')
})
//error handling middleware phai de cuoi cung
app.use((error: any, req: Request, res: Response, next: NextFunction): void => {
  res.status(error.status || 500).json(omit(error, ['status']))
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
