import { ObjectId } from 'mongodb'

enum UserVerifyStatus {
  Unverified, // chua xac thuc
  Verified,
  Banned
}

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verified_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus

  bio?: string
  location?: string
  avatar?: string
  cover_photo?: string
}

export class User {
  _id: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verified_token: string
  forgot_password_token: string
  verify: UserVerifyStatus

  bio: string
  location: string
  avatar: string
  cover_photo: string

  constructor(user: UserType) {
    this._id = user._id || new ObjectId()
    this.name = user.name
    this.email = user.email
    this.date_of_birth = user.date_of_birth
    this.password = user.password
    this.created_at = user.created_at || new Date()
    this.updated_at = user.updated_at || new Date()
    this.email_verified_token = user.email_verified_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}
