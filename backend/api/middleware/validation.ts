import {z} from 'zod';
import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';

/** The first useful message Zod found, in the shape the app shows. */
function validationError(error: z.ZodError) {
  const flattened = error.flatten();
  const firstFieldError = Object.values(flattened.fieldErrors)
    .flat()
    .filter(Boolean)[0];
  const firstFormError = flattened.formErrors.filter(Boolean)[0];
  const message = firstFieldError ?? firstFormError ?? 'Invalid request';

  return new ApiError(400, ErrorCodes.VALIDATION_ERROR, message, flattened);
}

/** Validates the request body. */
export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(validationError(result.error));
    }

    next();
  };

/** Validates the query string and hands the parsed values to the handler. */
export const validateQuery =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(validationError(result.error));
    }

    req.query = result.data;
    next();
  };
