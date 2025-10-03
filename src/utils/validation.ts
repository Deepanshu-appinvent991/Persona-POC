import { body, param, query } from 'express-validator';

// Auth validation schemas
export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('role')
    .optional()
    .isIn(['USER', 'APPROVER', 'ADMIN'])
    .withMessage('Role must be USER, APPROVER, or ADMIN')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Entity validation schemas
export const createEntityValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, and hyphens'),
  
  body('identificationNumber')
    .isLength({ min: 5, max: 50 })
    .withMessage('Identification number must be between 5 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Identification number can only contain letters, numbers, and hyphens'),
  
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
    .withMessage('Please provide a valid date of birth in ISO format'),
  
  // Address validation
  body('address.street')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('address.city')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('City can only contain letters, spaces, dots, and hyphens'),
  
  body('address.state')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('State can only contain letters, spaces, dots, and hyphens'),
  
  body('address.country')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('Country can only contain letters, spaces, dots, and hyphens'),
  
  body('address.postalCode')
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Postal code can only contain letters, numbers, spaces, and hyphens')
];

export const updateEntityValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, and hyphens'),
  
  body('email')
    .optional()
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
    .withMessage('Please provide a valid date of birth in ISO format'),
  
  // Address validation (optional fields)
  body('address.street')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('address.city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('City can only contain letters, spaces, dots, and hyphens'),
  
  body('address.state')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('State can only contain letters, spaces, dots, and hyphens'),
  
  body('address.country')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('Country can only contain letters, spaces, dots, and hyphens'),
  
  body('address.postalCode')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Postal code can only contain letters, numbers, spaces, and hyphens')
];

export const approveEntityValidation = [
  body('approvalNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Approval notes must not exceed 500 characters')
];

export const rejectEntityValidation = [
  body('rejectionReason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
];

// Common validation schemas
export const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

export const entityIdValidation = [
  param('entityId')
    .isMongoId()
    .withMessage('Invalid entity ID format')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'status', 'email'])
    .withMessage('Sort field must be one of: createdAt, updatedAt, name, status, email'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'])
    .withMessage('Status must be one of: PENDING, APPROVED, REJECTED, UNDER_REVIEW'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];
