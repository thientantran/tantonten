import { NextFunction, Request, Response } from 'express'
import path from 'path'
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  // do formidable version3 bien dich theo es module, nhung code minh bien dich theo common js, nen phai dung dynamic import
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('upload'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024
  })
  form.parse(req, (error, fields, files) => {
    if (error) {
      return next(error)
    }
    console.log('fields', fields)
    console.log('files', files)
    res.json({ fields, files })
  })
}
