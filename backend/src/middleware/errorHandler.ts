import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.issues,
      },
    });
  }

  // Our explicit HTTP errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code ?? 'HTTP_ERROR',
        details: err.details,
      },
    });
  }

  // Unknown
  // Avoid leaking stack traces in production.
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err?.message ?? 'Internal server error');
  return res.status(500).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  });
};


