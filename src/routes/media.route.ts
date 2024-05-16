import { Router } from 'express'
import { uploadImage, uploadVideo } from '~/controllers/media.controllers'

const mediaRouter = Router()

// mediaRouter.post('/upload-image', wrapSync(uploadImage))
mediaRouter.post('/upload-image', uploadImage)
mediaRouter.post('/upload-video', uploadVideo)
export default mediaRouter
