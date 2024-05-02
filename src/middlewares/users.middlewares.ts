import { NextFunction, Request, Response } from 'express'

const usersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic goes here
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  next()
}

export default usersMiddleware
