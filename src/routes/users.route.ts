import { Router } from 'express'
import {
  changePasswordController,
  emailVeryfiedController,
  followUserController,
  forgotPasswordController,
  getMeController,
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowUserController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/middleware'
import {
  ForgotPasswordTokenValidator,
  accessTokenValidator,
  emailTokenValidator,
  emailValidator,
  followerValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowerValidator,
  updateMeValidator,
  veryfiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapSync } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapSync(registerController))
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, logoutController)
usersRouter.get('/verify-email', emailTokenValidator, emailVeryfiedController)
usersRouter.post('/resend-email', accessTokenValidator, resendVerifyEmailController)
usersRouter.post('/forgot-password', emailValidator, forgotPasswordController)
usersRouter.get('/verify-forgot-password', ForgotPasswordTokenValidator, verifyForgotPasswordController)
usersRouter.post('/reset-password', resetPasswordValidator, resetPasswordController)
usersRouter.get('/me', accessTokenValidator, getMeController)
usersRouter.patch(
  '/me',
  accessTokenValidator,
  veryfiedUserValidator,
  updateMeValidator,
  filterMiddleware(['name', 'date_of_birth', 'avatar', 'username', 'cover_photo', 'bio', 'location']),
  updateMeController
)
usersRouter.get('/:username', getUserProfileController)
usersRouter.post('/follow', accessTokenValidator, veryfiedUserValidator, followerValidator, followUserController)
usersRouter.delete(
  '/follow/:followed_user_id',
  accessTokenValidator,
  veryfiedUserValidator,
  unfollowerValidator,
  unFollowUserController
)

usersRouter.patch('/changepassword', accessTokenValidator, veryfiedUserValidator, changePasswordController)
// Define your routes here

export default usersRouter
