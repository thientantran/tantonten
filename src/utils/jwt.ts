import jwt from 'jsonwebtoken'
import { TokenType } from '~/models/schemas/User.schema'

// xử dụng bất đồng bộ, để khi generate 2 token cùng lúc, nó sẽ chạy song song
export async function generateAccessToken(userId: string): Promise<string> {
  const payload = {
    userId,
    token_type: TokenType.AccessToken
  }

  const options = {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
    algorithm: 'HS256' as const
  }

  // return jwt.sign(payload, secretKey, options)
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET as string, options, (err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token as string)
    })
  })
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const payload = {
    userId,
    token_type: TokenType.RefreshToken
  }

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    algorithm: 'HS256' as const
  }

  // return jwt.sign(payload, secretKey, options)
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET as string, options, (err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token as string)
    })
  })
}
