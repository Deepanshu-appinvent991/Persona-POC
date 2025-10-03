import { Router } from 'express';
import {
  createEntity,
  getEntities,
  getEntity,
  updateEntity,
  deleteEntity,
  approveEntity,
  rejectEntity,
  getEntityStats
} from '../controllers/entityController';
import { handleValidationErrors } from '../middleware/validation';
import {
  createEntityValidation,
  updateEntityValidation,
  approveEntityValidation,
  rejectEntityValidation,
  mongoIdValidation,
  paginationValidation
} from '../utils/validation';

const router = Router();

// Entity CRUD operations (simplified - no auth required)
router.route('/')
  .get(paginationValidation, handleValidationErrors, getEntities)
  .post(createEntityValidation, handleValidationErrors, createEntity);

router.route('/stats')
  .get(getEntityStats);

router.route('/:id')
  .get(mongoIdValidation, handleValidationErrors, getEntity)
  .put(mongoIdValidation, updateEntityValidation, handleValidationErrors, updateEntity)
  .delete(mongoIdValidation, handleValidationErrors, deleteEntity);

// Approval/Rejection routes (simplified - no auth required)
router.route('/:id/approve')
  .put(
    mongoIdValidation,
    approveEntityValidation,
    handleValidationErrors,
    approveEntity
  );

router.route('/:id/reject')
  .put(
    mongoIdValidation,
    rejectEntityValidation,
    handleValidationErrors,
    rejectEntity
  );

export default router;
