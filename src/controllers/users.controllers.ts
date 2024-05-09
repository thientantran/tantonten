import { createHash } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import * as core from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { User, UserVerifyStatus } from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'
import { generateAccessToken, generateEmailToken, generateForgotPasswordToken, generateRefreshToken } from '~/utils/jwt'
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
  const user_id = new ObjectId()
  const [accessToken, refreshToken, email_verified_token] = await Promise.all([
    generateAccessToken({ userId: user_id.toString(), verify: UserVerifyStatus.Unverified }),
    generateRefreshToken({ userId: user_id.toString(), verify: UserVerifyStatus.Unverified }),
    generateEmailToken({ userId: user_id.toString(), verify: UserVerifyStatus.Unverified })
  ])
  const newUser = new User({ _id: user_id, email, password: hashedPassword, name, date_of_birth, email_verified_token })

  const response = await databaseServices.users.insertOne(newUser)

  await databaseServices.users.updateOne(
    { _id: response.insertedId },
    { $set: { email_verified_token: email_verified_token } }
  )
  // ko can tao accesstoken hay refreshtoken khi dang ky, chi can verify email
  return res.json({
    message: 'User created successfully',
    data: {
      ...newUser,
      access_token: accessToken,
      refresh_token: refreshToken
      // _id: response.insertedId
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
    generateAccessToken({ userId: user._id.toString(), verify: user.verify }),
    generateRefreshToken({ userId: user._id.toString(), verify: user.verify })
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

export const emailVeryfiedController = async (req: Request, res: Response) => {
  const { decode_email_verify_token }: any = req
  // console.log(token)
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(decode_email_verify_token.userId)
  })
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  if (user.email_verified_token === '') {
    return res.json({ message: 'Email already verified' })
  }
  try {
    const result = await databaseServices.users.updateOne(
      { _id: new ObjectId(decode_email_verify_token.userId) },
      { $set: { email_verified_token: '', verify: UserVerifyStatus.Verified }, $currentDate: { updated_at: true } }
    )
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({ userId: user._id.toString(), verify: UserVerifyStatus.Verified }),
      generateRefreshToken({ userId: user._id.toString(), verify: UserVerifyStatus.Verified })
    ])
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user._id), token: refreshToken })
    )
    return res.json({
      message: 'Email verified',
      data: {
        ...user,
        email_verified_token: '',
        verify: UserVerifyStatus.Verified,
        access_token: accessToken,
        refresh_token: refreshToken
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { decode_authorization }: any = req
  console.log(decode_authorization)
  const { userId } = decode_authorization
  console.log('user_id', userId)
  const user = await databaseServices.users.findOne({ _id: new ObjectId(userId) })
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: 'Email already verified' })
  }
  const email_verified_token = await generateEmailToken({ userId: userId, verify: UserVerifyStatus.Unverified })
  await databaseServices.users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { email_verified_token: email_verified_token }, $currentDate: { updated_at: true } }
  )
  return res.json({ message: 'Resend verify email success' })
}
export const forgotPasswordController = async (req: Request, res: Response) => {
  const { user }: any = req
  const forgot_password_token = await generateForgotPasswordToken({ userId: user._id, verify: user.verify })
  await databaseServices.users.updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { forgot_password_token: forgot_password_token }, $currentDate: { updated_at: true } }
  )
  console.log("Send email to user's email")
  return res.json({
    message: 'Sent email. Please check your email',
    data: { forgot_password_token: forgot_password_token }
  })
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  const { user }: any = req
  return res.json({ message: 'Verify forgot password success' })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { password, confirm_password, forgot_password_token } = req.body
  const { user }: any = req
  const newPassword = hashPassword(password)
  await databaseServices.users.updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { password: newPassword, forgot_password_token: '' }, $currentDate: { updated_at: true } }
  )
  return res.json({ message: 'Reset password success' })
}

export const getMeController = async (req: Request, res: Response) => {
  const { decode_authorization }: any = req
  const user = await databaseServices.users.findOne(
    { _id: new ObjectId(decode_authorization.userId) },
    {
      projection: {
        password: 0,
        email_verified_token: 0,
        forgot_password_token: 0
      }
    }
  )
  return res.json({ message: 'Get me success', data: user })
}
export const updateMeController = async (req: Request, res: Response) => {
  // verify ở đây cũng được, nhưng hơi tôns công viết mỗi khi cần, do đó lấy middleware gắn ở route là nhanh
  // const { decode_authorization }: any = req
  // const { verify } = decode_authorization
  // if (verify !== UserVerifyStatus.Verified) {
  //   return res.status(403).json({ message: 'Email is not verified' })
  // }
  return res.json({ message: 'Update me success' })
}
