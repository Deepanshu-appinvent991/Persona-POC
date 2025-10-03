import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: 'value' in error ? error.value : undefined
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: formattedErrors
    });
  }
  
  next();
};
