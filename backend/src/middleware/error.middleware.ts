import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific database errors
  if (err.message.includes('duplicate key value')) {
    return ApiResponse.conflict(res, 'Resource already exists');
  }

  if (err.message.includes('violates foreign key constraint')) {
    return ApiResponse.badRequest(res, 'Invalid reference to related resource');
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = isDevelopment 
    ? { message, stack: err.stack }
    : { message: statusCode >= 500 ? 'Internal Server Error' : message };

  return res.status(statusCode).json({
    success: false,
    ...errorResponse,
    timestamp: new Date().toISOString()
  });
};

export const notFound = (req: Request, res: Response) => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};
