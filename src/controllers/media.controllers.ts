import { NextFunction, Request, Response } from 'express'
import path from 'path'
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  // do formidable version3 bien dich theo es module, nhung code minh bien dich theo common js, nen phai dung dynamic import
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('upload'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.startsWith('image/'))
      console.log('originalFilename', originalFilename)
      if (!valid) {
        form.emit('error' as any, { status: 400, message: 'file is invalid' } as any)
      }
      return valid
    }
  })
  // files khi nhận được dù là 1 hay bao nhiêu files thì cũng là 1 mảng, nó sẽ filter và trả về mảng files mới, rỗng hoặc những files đat yêu cầu
  // nếu không thoả các conditions thì sẽ return files = rỗng,
  // nếu 2 files, 1 file thoả điều kiện, 1 file ko thoả điều kiện của filter, cũng trả về rỗng,

  // tuy nhiên thực tế, filter sẽ lọc từng item trong files, nếu phần tử đầu tiên nó thoả nó vẫn nhảy vào parse như thường, mặc dùng files là rỗng
  // rất tào lao
  form.parse(req, (error, fields, files) => {
    console.log('fiels', files)
    if (error) {
      // return next({ status: 400, message: 'file too big' })
      if (error.code === 1009) {
        // This is the error code for 'maxTotalFileSize exceeded'
        return next({ status: 413, message: 'file too big' })
      }
      if (error.code === 1015) {
        return next({ status: 400, message: 'Please upload 1 file' })
      }
      if (error.httpCode) {
        error.status = error.httpCode
      }
      return next(error)
    }
    if (!files || !files.image) {
      return next({ status: 400, message: 'file is required' })
    }
    res.json({ fields, files })
  })
  // const data = await handleUploadOneImage(req, res)
}
