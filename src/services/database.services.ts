import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config()

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(process.env.DATABASE_URL || '')
  }

  async connect() {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('connected')
    } finally {
      await this.client.close()
    }
  }
}

export default new DatabaseService()
