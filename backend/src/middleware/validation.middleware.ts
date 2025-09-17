import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from '../utils/response';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const validationErrors = errors.map(error => {
          return {
            property: error.property,
            constraints: error.constraints
          };
        });

        return ApiResponse.badRequest(res, 'Validation failed', validationErrors);
      }

      req.body = dto;
      next();
    } catch (error) {
      return ApiResponse.internalError(res, 'Validation error occurred');
    }
  };
};
