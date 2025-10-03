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

/**
 * @swagger
 * components:
 *   schemas:
 *     EntityRequest:
 *       type: object
 *       required:
 *         - name
 *         - identificationNumber
 *         - email
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *           description: "Entity name"
 *         identificationNumber:
 *           type: string
 *           example: "ID123456789"
 *           description: "Unique identification number"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *           description: "Entity email address"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *           description: "Phone number"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *           description: "Date of birth"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         profilePhoto:
 *           $ref: '#/components/schemas/Document'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Document'
 *     
 *     EntityUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *     
 *     ApprovalRequest:
 *       type: object
 *       properties:
 *         approvalNotes:
 *           type: string
 *           example: "All documents verified and approved"
 *           description: "Optional approval notes"
 *     
 *     RejectionRequest:
 *       type: object
 *       required:
 *         - rejectionReason
 *       properties:
 *         rejectionReason:
 *           type: string
 *           example: "Missing required documents"
 *           description: "Reason for rejection"
 *     
 *     EntityListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             entities:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Entity'
 *             pagination:
 *               type: object
 *               properties:
 *                 totalDocs:
 *                   type: number
 *                   example: 100
 *                 limit:
 *                   type: number
 *                   example: 10
 *                 totalPages:
 *                   type: number
 *                   example: 10
 *                 page:
 *                   type: number
 *                   example: 1
 *                 hasPrevPage:
 *                   type: boolean
 *                   example: false
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 prevPage:
 *                   type: number
 *                   nullable: true
 *                   example: null
 *                 nextPage:
 *                   type: number
 *                   nullable: true
 *                   example: 2
 *     
 *     EntityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Entity created successfully"
 *         data:
 *           type: object
 *           properties:
 *             entity:
 *               $ref: '#/components/schemas/Entity'
 *     
 *     EntityStatsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             stats:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 100
 *                 pending:
 *                   type: number
 *                   example: 25
 *                 approved:
 *                   type: number
 *                   example: 60
 *                 rejected:
 *                   type: number
 *                   example: 10
 *                 underReview:
 *                   type: number
 *                   example: 5
 */

/**
 * @swagger
 * /api/entities:
 *   get:
 *     summary: Get all entities with pagination and filtering
 *     tags: [Entities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, UNDER_REVIEW]
 *         description: Filter by entity status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, identification number, or inquiry ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Entities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityListResponse'
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new entity
 *     tags: [Entities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntityRequest'
 *     responses:
 *       201:
 *         description: Entity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/')
  .get(paginationValidation, handleValidationErrors, getEntities)
  .post(createEntityValidation, handleValidationErrors, createEntity);

/**
 * @swagger
 * /api/entities/stats:
 *   get:
 *     summary: Get entity statistics
 *     tags: [Entities]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityStatsResponse'
 */
router.route('/stats')
  .get(getEntityStats);

/**
 * @swagger
 * /api/entities/{id}:
 *   get:
 *     summary: Get a single entity by ID
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Entity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     entity:
 *                       $ref: '#/components/schemas/Entity'
 *       404:
 *         description: Entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update an entity
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntityUpdateRequest'
 *     responses:
 *       200:
 *         description: Entity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityResponse'
 *       400:
 *         description: Validation error or entity cannot be updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete an entity (Admin only)
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Entity deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Entity deleted successfully"
 *       404:
 *         description: Entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id')
  .get(mongoIdValidation, handleValidationErrors, getEntity)
  .put(mongoIdValidation, updateEntityValidation, handleValidationErrors, updateEntity)
  .delete(mongoIdValidation, handleValidationErrors, deleteEntity);

/**
 * @swagger
 * /api/entities/{id}/approve:
 *   put:
 *     summary: Approve an entity (Approver/Admin only)
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalRequest'
 *     responses:
 *       200:
 *         description: Entity approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityResponse'
 *       400:
 *         description: Entity already approved or rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id/approve')
  .put(
    mongoIdValidation,
    approveEntityValidation,
    handleValidationErrors,
    approveEntity
  );

/**
 * @swagger
 * /api/entities/{id}/reject:
 *   put:
 *     summary: Reject an entity (Approver/Admin only)
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectionRequest'
 *     responses:
 *       200:
 *         description: Entity rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityResponse'
 *       400:
 *         description: Rejection reason required or entity already approved/rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/:id/reject')
  .put(
    mongoIdValidation,
    rejectEntityValidation,
    handleValidationErrors,
    rejectEntity
  );

export default router;
