import { Router, Request, Response, NextFunction } from 'express';
import { getEntities } from '../controllers/entityController';
import { handleValidationErrors } from '../middleware/validation';
import { paginationValidation } from '../utils/validation';

const router = Router();

// Get entities pending approval (no auth required)
router.get(
  '/pending',
  paginationValidation,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) => {
    req.query.status = 'PENDING';
    next();
  },
  getEntities
);

// Get entities under review (no auth required)
router.get(
  '/under-review',
  paginationValidation,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) => {
    req.query.status = 'UNDER_REVIEW';
    next();
  },
  getEntities
);

// Get approved entities (no auth required)
router.get(
  '/approved',
  paginationValidation,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) => {
    req.query.status = 'APPROVED';
    next();
  },
  getEntities
);

// Get rejected entities (no auth required)
router.get(
  '/rejected',
  paginationValidation,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) => {
    req.query.status = 'REJECTED';
    next();
  },
  getEntities
);

export default router;
