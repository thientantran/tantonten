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