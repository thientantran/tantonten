import { Router } from 'express'
import { uploadImage } from '~/controllers/media.controllers'

const mediaRouter = Router()

mediaRouter.post('/upload-image', uploadImage)

export default mediaRouter
