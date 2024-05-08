import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatus from '~/constants/httpStatus'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      // if there are no errors, continue to the next middleware
      return next()
    }
    const errorsObject = errors.mapped()

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (!!msg.status && msg.status !== httpStatus.UNPRCESSABLE_ENTITY) {
        console.log(errorsObject)
        return next(msg)
      }
    }
    // cái chỗ này có thể tạo class rồi chỉ cần add thông tin vào class thôi
    const errorMessages = {
      status: httpStatus.UNPRCESSABLE_ENTITY,
      message: 'Validation errors',
      errors: errors.mapped()
    }
    next(errorMessages)
  }
}
