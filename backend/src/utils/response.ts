import { Response } from 'express';
import logger from './logger';

interface ApiResponseFormat {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
  timestamp: string;
}

export class ApiResponse {
  private static formatResponse(
    success: boolean, 
    message: string, 
    data?: any, 
    errors?: any
  ): ApiResponseFormat {
    return {
      success,
      message,
      data,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  static success(res: Response, message: string, data?: any, statusCode: number = 200) {
    const response = this.formatResponse(true, message, data);
    logger.info(`Success Response: ${message}`, { statusCode, data });
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, errors?: any, statusCode: number = 400) {
    const response = this.formatResponse(false, message, undefined, errors);
    logger.error(`Error Response: ${message}`, { statusCode, errors });
    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message: string = 'Bad Request', errors?: any) {
    return this.error(res, message, errors, 400);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, undefined, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, undefined, 403);
  }

  static notFound(res: Response, message: string = 'Not Found') {
    return this.error(res, message, undefined, 404);
  }

  static conflict(res: Response, message: string = 'Conflict') {
    return this.error(res, message, undefined, 409);
  }

  static internalError(res: Response, message: string = 'Internal Server Error') {
    return this.error(res, message, undefined, 500);
  }
}
