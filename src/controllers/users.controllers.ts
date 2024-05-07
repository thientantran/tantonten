import { createHash } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import * as core from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { User } from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'
import { generateAccessToken, generateRefreshToken } from '~/utils/jwt'
// functions for hasing password, can use bcryptjs instead
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_HASH)
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, date_of_birth } = req.body
  const hashedPassword = hashPassword(password)
  const newUser = new User({ email, password: hashedPassword, name, date_of_birth })

  const response = await databaseServices.users.insertOne(newUser)
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(response.insertedId.toString()),
    generateRefreshToken(response.insertedId.toString())
  ])
  await databaseServices.refreshToken.insertOne(new RefreshToken({ user_id: response.insertedId, token: refreshToken }))
  return res.json({
    message: 'User created successfully',
    data: {
      ...newUser,
      access_token: accessToken,
      refresh_token: refreshToken,
      _id: response.insertedId
    }
  })
}
export const loginController = async (req: Request, res: Response) => {
  const { user }: any = req
  const { password } = req.body
  if (user.password !== hashPassword(password)) {
    return res.status(401).json({ message: 'Wrong password' })
  }
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user._id.toString()),
    generateRefreshToken(user._id.toString())
  ])
  // chú ý source code hiện tại mỗi lần login thì sẽ tao ra 1 refresh token mới, và lưu vào db, nên khi logout thì sẽ xóa refresh token đó đi, login 2 lần có 2 lần refresh token, logout 1 lần thì xóa 1 cái refresh token ==> login nhiều máy tính, nên thêm 1 tính năng là logout hết máy thì có 1 button, click thì sẽ xoá hết các refresh token
  await databaseServices.refreshToken.insertOne(
    new RefreshToken({ user_id: new ObjectId(user._id), token: refreshToken })
  )
  return res.json({
    message: 'Login successful',
    data: {
      ...user,
      access_token: accessToken,
      refresh_token: refreshToken
    }
  })
}

interface LogoutReqBody {
  refresh_token: string
}
export const logoutController = async (req: Request<core.ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { decode_authorization, decode_refresh_token }: any = req
  const { refresh_token } = req.body
  const result = await databaseServices.refreshToken.deleteOne({
    user_id: new ObjectId(decode_authorization.userId),
    token: refresh_token
  })

  console.log(result)
  return res.json({ message: 'Logout success' })
}
