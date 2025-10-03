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

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Profile photo uploaded successfully"
 *         data:
 *           type: object
 *           properties:
 *             file:
 *               type: object
 *               properties:
 *                 filename:
 *                   type: string
 *                   example: "processed-profilePhoto-1635123456789-123456789.jpg"
 *                 originalName:
 *                   type: string
 *                   example: "profile.jpg"
 *                 size:
 *                   type: number
 *                   example: 245760
 *                 url:
 *                   type: string
 *                   example: "/uploads/photos/processed-profilePhoto-1635123456789-123456789.jpg"
 *     
 *     MultipleFileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "3 document(s) uploaded successfully"
 *         data:
 *           type: object
 *           properties:
 *             files:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                     example: "documents-1635123456789-123456789.pdf"
 *                   originalName:
 *                     type: string
 *                     example: "contract.pdf"
 *                   type:
 *                     type: string
 *                     enum: [PDF, IMAGE, CSV, OTHER]
 *                     example: "PDF"
 *                   size:
 *                     type: number
 *                     example: 1024000
 *                   url:
 *                     type: string
 *                     example: "/uploads/documents/documents-1635123456789-123456789.pdf"
 *     
 *     EntityFilesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             files:
 *               type: object
 *               properties:
 *                 profilePhoto:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "processed-profilePhoto-1635123456789.jpg"
 *                     originalName:
 *                       type: string
 *                       example: "profile.jpg"
 *                     type:
 *                       type: string
 *                       example: "IMAGE"
 *                     size:
 *                       type: number
 *                       example: 245760
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-25T10:30:00.000Z"
 *                     url:
 *                       type: string
 *                       example: "/uploads/photos/processed-profilePhoto-1635123456789.jpg"
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         example: "documents-1635123456789.pdf"
 *                       originalName:
 *                         type: string
 *                         example: "contract.pdf"
 *                       type:
 *                         type: string
 *                         enum: [PDF, IMAGE, CSV, OTHER]
 *                         example: "PDF"
 *                       size:
 *                         type: number
 *                         example: 1024000
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-25T10:30:00.000Z"
 *                       url:
 *                         type: string
 *                         example: "/uploads/documents/documents-1635123456789.pdf"
 */

/**
 * @swagger
 * /api/files/profile-photo/{entityId}:
 *   post:
 *     summary: Upload profile photo for an entity
 *     tags: [File Management]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: No file uploaded or validation error
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
router.post(
  '/profile-photo/:entityId',
  entityIdValidation,
  handleValidationErrors,
  uploadProfilePhoto
);

/**
 * @swagger
 * /api/files/documents/{entityId}:
 *   post:
 *     summary: Upload documents for an entity
 *     tags: [File Management]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document files (PDF, images, CSV, Excel files)
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 *       400:
 *         description: No files uploaded or validation error
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
router.post(
  '/documents/:entityId',
  entityIdValidation,
  handleValidationErrors,
  uploadDocuments
);

/**
 * @swagger
 * /api/files/{entityId}:
 *   get:
 *     summary: Get all files associated with an entity
 *     tags: [File Management]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityFilesResponse'
 *       404:
 *         description: Entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:entityId',
  entityIdValidation,
  handleValidationErrors,
  getEntityFiles
);

/**
 * @swagger
 * /api/files/{entityId}/{filename}:
 *   get:
 *     summary: Download/view a specific file
 *     tags: [File Management]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename to retrieve
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Entity or file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a specific file
 *     tags: [File Management]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
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
 *                   example: "File deleted successfully"
 *       404:
 *         description: Entity or file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error deleting file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Combined route for both GET and DELETE operations
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
