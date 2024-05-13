import fs from 'fs'
import path from 'path'
export const initFolder = () => {
  const uploadFolderPath = path.resolve('upload')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true
    })
  }
}

// tạo cái hàm để dùng wrapsync, tào lao
export const handleUploadOneImage = async (req: any, res: any) => {
  // do formidable version3 bien dich theo es module, nhung code minh bien dich theo common js, nen phai dung dynamic import
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('upload'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 3 * 1024
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error)
      }
      resolve({ fields, files })
    })
  })
}
