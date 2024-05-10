import dotenv from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import Followers from '~/models/schemas/Followers.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { User } from '~/models/schemas/User.schema'
dotenv.config()

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(process.env.DATABASE_URL || '')
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('connected')
    } finally {
      // await this.client.close()
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection('refresh_token')
  }

  get followers(): Collection<Followers> {
    return this.db.collection('followers')
  }
}

export default new DatabaseService()
