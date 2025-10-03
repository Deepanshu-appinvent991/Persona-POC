import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Entity } from '../models/Entity';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === 'profilePhoto' ? 'photos' : 'documents';
    const fullPath = path.join(uploadDir, subDir);
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'application/pdf': true,
    'text/csv': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true
  };

  if (allowedTypes[file.mimetype as keyof typeof allowedTypes]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and CSV files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});

// Helper function to determine file type
const getFileType = (mimeType: string): 'PDF' | 'IMAGE' | 'CSV' | 'OTHER' => {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('csv') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'CSV';
  return 'OTHER';
};

// @desc    Upload profile photo
// @route   POST /api/files/profile-photo/:entityId
// @access  Private
export const uploadProfilePhoto = [
  upload.single('profilePhoto'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { entityId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Find the entity
    const entity = await Entity.findById(entityId);
    if (!entity) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    try {
      // Process image with sharp for optimization
      const processedImagePath = path.join(
        path.dirname(file.path),
        'processed-' + file.filename
      );

      await sharp(file.path)
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(processedImagePath);

      // Remove original file
      fs.unlinkSync(file.path);

      // Update entity with profile photo
      const photoDocument = {
        type: 'IMAGE' as const,
        filename: 'processed-' + file.filename,
        originalName: file.originalname,
        mimeType: 'image/jpeg',
        size: fs.statSync(processedImagePath).size,
        path: processedImagePath,
        uploadedAt: new Date()
      };

      entity.profilePhoto = photoDocument;
      await entity.save();

      res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          file: {
            filename: photoDocument.filename,
            originalName: photoDocument.originalName,
            size: photoDocument.size,
            url: `/uploads/photos/${photoDocument.filename}`
          }
        }
      });

    } catch (error) {
      // Clean up files on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  })
];

// @desc    Upload documents
// @route   POST /api/files/documents/:entityId
// @access  Private
export const uploadDocuments = [
  upload.array('documents', 10), // Max 10 files
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { entityId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Find the entity
    const entity = await Entity.findById(entityId);
    if (!entity) {
      // Clean up uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    try {
      const uploadedDocuments = files.map(file => ({
        type: getFileType(file.mimetype),
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date()
      }));

      // Add documents to entity
      entity.documents.push(...uploadedDocuments);
      await entity.save();

      const responseFiles = uploadedDocuments.map(doc => ({
        filename: doc.filename,
        originalName: doc.originalName,
        type: doc.type,
        size: doc.size,
        url: `/uploads/documents/${doc.filename}`
      }));

      res.status(200).json({
        success: true,
        message: `${files.length} document(s) uploaded successfully`,
        data: { files: responseFiles }
      });

    } catch (error) {
      // Clean up files on error
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      throw error;
    }
  })
];

// @desc    Get file
// @route   GET /api/files/:entityId/:filename
// @access  Private
export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const { entityId, filename } = req.params;

  // Find the entity to verify file belongs to it
  const entity = await Entity.findById(entityId);
  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  // Check if file exists in entity documents or profile photo
  let fileDocument = entity.documents.find(doc => doc.filename === filename);
  
  if (!fileDocument && entity.profilePhoto?.filename === filename) {
    fileDocument = entity.profilePhoto;
  }

  if (!fileDocument) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  const filePath = fileDocument.path;

  // Check if file exists on disk
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found on server'
    });
  }

  // Set appropriate headers
  res.setHeader('Content-Type', fileDocument.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${fileDocument.originalName}"`);

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// @desc    Delete file
// @route   DELETE /api/files/:entityId/:filename
// @access  Private
export const deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { entityId, filename } = req.params;

  // Find the entity
  const entity = await Entity.findById(entityId);
  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  let fileToDelete = null;
  let isProfilePhoto = false;

  // Check if it's a profile photo
  if (entity.profilePhoto?.filename === filename) {
    fileToDelete = entity.profilePhoto;
    isProfilePhoto = true;
  } else {
    // Check in documents
    const documentIndex = entity.documents.findIndex(doc => doc.filename === filename);
    if (documentIndex !== -1) {
      fileToDelete = entity.documents[documentIndex];
    }
  }

  if (!fileToDelete) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  try {
    // Delete file from disk
    if (fs.existsSync(fileToDelete.path)) {
      fs.unlinkSync(fileToDelete.path);
    }

    // Remove from entity
    if (isProfilePhoto) {
      entity.profilePhoto = undefined;
    } else {
      entity.documents = entity.documents.filter(doc => doc.filename !== filename);
    }

    await entity.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// @desc    Get entity files list
// @route   GET /api/files/:entityId
// @access  Private
export const getEntityFiles = asyncHandler(async (req: Request, res: Response) => {
  const { entityId } = req.params;

  const entity = await Entity.findById(entityId);
  if (!entity) {
    return res.status(404).json({
      success: false,
      message: 'Entity not found'
    });
  }

  const files = {
    profilePhoto: entity.profilePhoto ? {
      filename: entity.profilePhoto.filename,
      originalName: entity.profilePhoto.originalName,
      type: entity.profilePhoto.type,
      size: entity.profilePhoto.size,
      uploadedAt: entity.profilePhoto.uploadedAt,
      url: `/uploads/photos/${entity.profilePhoto.filename}`
    } : null,
    documents: entity.documents.map(doc => ({
      filename: doc.filename,
      originalName: doc.originalName,
      type: doc.type,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      url: `/uploads/documents/${doc.filename}`
    }))
  };

  res.status(200).json({
    success: true,
    data: { files }
  });
});
