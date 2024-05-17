import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '..'
config()
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  // do formidable version3 bien dich theo es module, nhung code minh bien dich theo common js, nen phai dung dynamic import
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('upload'),
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 3 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.startsWith('image/'))
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
  form.parse(req, async (error, fields, files) => {
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
    const imageFiles = files.image
    const convertedImages = []

    for (const imageFile of imageFiles) {
      const inputPath = imageFile.filepath
      const outputPath = inputPath.replace(/\.[^/.]+$/, '') + '.jpeg'
      try {
        // loại bỏ metadata của ảnh, giảm dung lượng ảnh
        const buffer = await sharp(inputPath).jpeg({ quality: 90 }).toBuffer()
        await fs.promises.writeFile(outputPath, buffer)

        // Replace the original file path with the new JPEG file path
        imageFile.filepath = outputPath
        fs.unlink(inputPath, (err) => {
          if (err) {
            console.error(`Failed to delete original image at ${inputPath}:`, err)
          }
        })

        const imageName = path.basename(outputPath)
        convertedImages.push(imageName)
      } catch (err) {
        return next({ status: 500, message: 'Failed to convert image to JPEG' })
      }
    }

    res.json({
      files: convertedImages.map((imageName) => {
        return !isProduction ? `${process.env.HOST}/upload/${imageName}` : `http://localhost:4000/upload/${imageName}`
      })
    })
  })
  // const data = await handleUploadOneImage(req, res)
}

export const uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('upload'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.startsWith('video/'))
      console.log('mimetype', mimetype)
      if (!valid) {
        form.emit('error' as any, { status: 400, message: 'file is invalid' } as any)
      }
      return valid
    }
  })

  form.parse(req, (error, fields, files) => {
    if (error) {
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
    if (!files || !files.video) {
      return next({ status: 400, message: 'file is required' })
    }
    const videoFile = files.video[0] // Access the first element of the File[] array
    const videoName = path.basename(videoFile.filepath)
    res.json({
      file: !isProduction
        ? `${process.env.HOST}/media/video-stream/${videoName}`
        : `http://localhost:4000/media/video-stream/${videoName}`
    })
  })
}

// export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
//   const range = req.headers.range
//   if (!range) {
//     console.log('range', range)
//     return next({ status: 400, message: 'Range header is required' })
//   }

//   const { name } = req.params
//   const videoPath = path.resolve('upload', name)
//   const videoSize = fs.statSync(videoPath).size
//   const chunkSize = 10 ** 6
//   const start = Number(range.replace(/\D/g, ''))
//   const end = Math.min(start + chunkSize, videoSize)
//   const contentLength = 10 ** 6
//   console.log(start - end)
//   // const mime = (await import('mime')).default
//   const contentType = 'video/mp4'
//   const headers = {
//     'Content-Range': `bytes ${0}-${end}/${videoSize}`,
//     'Accept-Ranges': 'bytes',
//     'Content-Length': contentLength,
//     'Content-Type': contentType
//   }
//   console.log('headers', headers)
//   res.writeHead(206, headers)
//   const videoStream = fs.createReadStream(videoPath, { start, end })
//   videoStream.pipe(res)
// }
export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
  if (!range) {
    return next({ status: 400, message: 'Range header is required' })
  }

  const { name } = req.params
  const videoPath = path.resolve('upload', name)
  const videoSize = fs.statSync(videoPath).size

  const CHUNK_SIZE = 10 ** 6 // 1MB
  const parts = range.replace(/bytes=/, '').split('-')
  const start = parseInt(parts[0], 10)
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

  const contentLength = end - start + 1
  const mime = (await import('mime')).default
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(206, headers)

  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
