import { Request, Response } from 'express'
export const loginController = (req: Request, res: Response) => {
  res.json({
    data: [{ id: 1, text: 'Hello, World Successfully!' }]
  })
}
