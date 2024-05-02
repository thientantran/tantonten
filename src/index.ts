import express from 'express'
import usersRouter from './routes/users.route'
const app = express()
const port = 3000
app.use(express.json())
app.use('/api', usersRouter)

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
