import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
export function errorHandler(error, req, res, next) {
  let status = error.status || error.statusCode || 500;
  let message = error.message || 'Something went wrong';
  let details = error.details;

  if (error.name === 'ValidationError' && error.errors) {
    status = 400;
    message = 'Validation failed';
    details = Object.entries(error.errors).map(([field, issue]) => ({
      field,
      message: issue.message,
    }));
  }

  if (error.name === 'CastError') {
    status = 400;
    message = 'Malformed identifier';
    details = undefined;
  }

  if (error.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
    details = Object.keys(error.keyValue || {}).map((field) => ({
      field,
      message: `${field} must be unique`,
    }));
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File is too large';
  }

  if (status >= 500) {
    console.error('[error]', error);
    if (env.isProduction) message = 'Something went wrong';
  }

  res.status(status).json({
    error: { message, ...(details ? { details } : {}) },
  });
}
