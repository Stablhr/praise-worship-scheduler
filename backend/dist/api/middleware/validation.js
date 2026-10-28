"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validate = void 0;
const error_1 = require("../utils/error");
const errorCodes_1 = require("../constants/errorCodes");
/** The first useful message Zod found, in the shape the app shows. */
function validationError(error) {
    const flattened = error.flatten();
    const firstFieldError = Object.values(flattened.fieldErrors)
        .flat()
        .filter(Boolean)[0];
    const firstFormError = flattened.formErrors.filter(Boolean)[0];
    const message = firstFieldError ?? firstFormError ?? 'Invalid request';
    return new error_1.ApiError(400, errorCodes_1.ErrorCodes.VALIDATION_ERROR, message, flattened);
}
/** Validates the request body. */
const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return next(validationError(result.error));
    }
    next();
};
exports.validate = validate;
/** Validates the query string and hands the parsed values to the handler. */
const validateQuery = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        return next(validationError(result.error));
    }
    req.query = result.data;
    next();
};
exports.validateQuery = validateQuery;
