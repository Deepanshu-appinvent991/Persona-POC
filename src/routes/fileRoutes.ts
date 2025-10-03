import { Router } from 'express';
import {
  uploadProfilePhoto,
  uploadDocuments,
  getFile,
  deleteFile,
  getEntityFiles
} from '../controllers/fileController';
import { handleValidationErrors } from '../middleware/validation';
import { entityIdValidation } from '../utils/validation';

const router = Router();

// File upload routes (no auth required)
router.post(
  '/profile-photo/:entityId',
  entityIdValidation,
  handleValidationErrors,
  uploadProfilePhoto
);

router.post(
  '/documents/:entityId',
  entityIdValidation,
  handleValidationErrors,
  uploadDocuments
);

// File management routes (no auth required)
router.get(
  '/:entityId',
  entityIdValidation,
  handleValidationErrors,
  getEntityFiles
);

router.get(
  '/:entityId/:filename',
  entityIdValidation,
  handleValidationErrors,
  getFile
);

router.delete(
  '/:entityId/:filename',
  entityIdValidation,
  handleValidationErrors,
  deleteFile
);

export default router;
