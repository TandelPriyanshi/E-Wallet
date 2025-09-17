import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { ApiResponse } from '../utils/response';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: No token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return ApiResponse.unauthorized(res, 'Access token is required');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: number; email: string };
    req.user = decoded;
    logger.info('User authenticated successfully', { userId: decoded.id });
    next();
  } catch (error) {
    logger.warn('Authentication failed: Invalid token', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip
    });
    return ApiResponse.unauthorized(res, 'Invalid or expired token');
  }
};

