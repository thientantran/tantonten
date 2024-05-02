import express from 'express'
import usersRouter from './routes/users.route'
import databaseServices from './services/database.services'

const app = express()
const port = 3000
databaseServices.connect()
app.use(express.json())
app.use('/api', usersRouter)

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
