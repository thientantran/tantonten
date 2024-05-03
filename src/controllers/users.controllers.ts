import { Request, Response } from 'express'
import { User } from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'
export const loginController = (req: Request, res: Response) => {
  res.json({
    data: [{ id: 1, text: 'Hello, World Successfully!' }]
  })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const newUser = new User({ email, password })
  try {
    const response = await databaseServices.users.insertOne(newUser)
    console.log(response)
    return res.json({ ...newUser, _id: response.insertedId })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
