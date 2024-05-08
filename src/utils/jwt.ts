import jwt, { Secret } from 'jsonwebtoken'
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
    jwt.sign(payload, process.env.JWT_REFRESH_KEY as string, options, (err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token as string)
    })
  })
}
export async function generateEmailToken(userId: string): Promise<string> {
  const payload = {
    userId,
    token_type: TokenType.EmailVerifiedToken
  }

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    algorithm: 'HS256' as const
  }

  // return jwt.sign(payload, secretKey, options)
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_EMAIL_KEY as string, options, (err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token as string)
    })
  })
}

export async function generateForgotPasswordToken(userId: string): Promise<string> {
  const payload = {
    userId,
    token_type: TokenType.ForgotPasswordToken
  }

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    algorithm: 'HS256' as const
  }

  // return jwt.sign(payload, secretKey, options)
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_FORGOTPASSWORD_KEY as string, options, (err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey as Secret, (err, decoded) => {
      if (err) {
        // nễu để như vậy sẽ trả về 422,  chuyển như dưới sẽ trả về 401, nhưng có cả verify 2 loại token, nên cứ để vậy, rồi qua bên validate sẽ xử lý cho từng loại token
        return reject(err)
        // throw { message: 'Invalid Authorization', status: 401 }
      }
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
