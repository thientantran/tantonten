import { createHash } from 'crypto'
import { Request, Response } from 'express'
import { User } from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'
import { generateAccessToken, generateRefreshToken } from '~/utils/jwt'
export const loginController = (req: Request, res: Response) => {
  res.json({
    data: [{ id: 1, text: 'Hello, World Successfully!' }]
  })
}

// functions for hasing password, can use bcryptjs instead
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_HASH)
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name, date_of_birth } = req.body
  const hashedPassword = hashPassword(password)
  const newUser = new User({ email, password: hashedPassword, name, date_of_birth })
  try {
    const response = await databaseServices.users.insertOne(newUser)
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(response.insertedId.toString()),
      generateRefreshToken(response.insertedId.toString())
    ])
    return res.json({
      message: 'User created successfully',
      data: {
        ...newUser,
        access_token: accessToken,
        refresh_token: refreshToken,
        _id: response.insertedId
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
