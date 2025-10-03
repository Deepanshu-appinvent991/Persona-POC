import { Router } from 'express';
import {
  createEntityStep1,
  createEntityStep2,
  createEntityStep3,
  createEntityStep4,
  createEntityStep5,
  createEntityStep6,
  getEntityProgress,
  cancelEntityCreation
} from '../controllers/stepEntityController';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// Step-by-step validation schemas
const step1Validation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, and hyphens'),
  
  body('identificationNumber')
    .isLength({ min: 5, max: 50 })
    .withMessage('Identification number must be between 5 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Identification number can only contain letters, numbers, and hyphens')
];

const step2Validation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth in ISO format')
];

const step3Validation = [
  body('address.street')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('address.city')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('address.state')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  
  body('address.country')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  
  body('address.postalCode')
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters')
];

const tempEntityIdValidation = [
  param('tempEntityId')
    .matches(/^temp_entity_\d+_[a-z0-9]{9}$/)
    .withMessage('Invalid temporary entity ID format')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     StepEntityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             tempEntityId:
 *               type: string
 *             step:
 *               type: number
 *             nextStep:
 *               type: number
 *             entityData:
 *               type: object
 */

/**
 * @swagger
 * /api/step-entities/step1:
 *   post:
 *     summary: Create entity - Step 1 (Basic Information)
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - identificationNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               identificationNumber:
 *                 type: string
 *                 example: "ID123456789"
 *     responses:
 *       201:
 *         description: Step 1 completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StepEntityResponse'
 *       400:
 *         description: Validation error or entity already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/step1', step1Validation, handleValidationErrors, createEntityStep1);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/step2:
 *   post:
 *     summary: Create entity - Step 2 (Contact Information)
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Temporary entity ID from step 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *     responses:
 *       200:
 *         description: Step 2 completed successfully
 *       404:
 *         description: Temporary entity data not found or expired
 */
router.post('/:tempEntityId/step2', tempEntityIdValidation, step2Validation, handleValidationErrors, createEntityStep2);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/step3:
 *   post:
 *     summary: Create entity - Step 3 (Address Information)
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Step 3 completed successfully
 */
router.post('/:tempEntityId/step3', tempEntityIdValidation, step3Validation, handleValidationErrors, createEntityStep3);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/step4:
 *   post:
 *     summary: Create entity - Step 4 (Profile Photo)
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhotoData:
 *                 $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: Step 4 completed successfully
 */
router.post('/:tempEntityId/step4', tempEntityIdValidation, handleValidationErrors, createEntityStep4);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/step5:
 *   post:
 *     summary: Create entity - Step 5 (Documents)
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: Step 5 completed successfully
 */
router.post('/:tempEntityId/step5', tempEntityIdValidation, handleValidationErrors, createEntityStep5);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/step6:
 *   post:
 *     summary: Create entity - Step 6 (Final Submission)
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               additionalData:
 *                 type: object
 *                 description: Any additional data for the entity
 *     responses:
 *       201:
 *         description: Entity created successfully
 *       404:
 *         description: Temporary entity data not found or expired
 */
router.post('/:tempEntityId/step6', tempEntityIdValidation, handleValidationErrors, createEntityStep6);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/progress:
 *   get:
 *     summary: Get entity creation progress
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *       404:
 *         description: Progress data not found or expired
 */
router.get('/:tempEntityId/progress', tempEntityIdValidation, handleValidationErrors, getEntityProgress);

/**
 * @swagger
 * /api/step-entities/{tempEntityId}/cancel:
 *   delete:
 *     summary: Cancel entity creation process
 *     tags: [Step Entity Creation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tempEntityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entity creation cancelled successfully
 */
router.delete('/:tempEntityId/cancel', tempEntityIdValidation, handleValidationErrors, cancelEntityCreation);

export default router;
