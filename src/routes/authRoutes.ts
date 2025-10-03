import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController';
import { handleValidationErrors } from '../middleware/validation';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation
} from '../utils/validation';

const router = Router();

// Public routes (no authentication needed)
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);

// Simple routes with userId in params (no auth middleware)
router.get('/me/:userId', getMe);
router.put('/profile/:userId', updateProfile);
router.put('/change-password/:userId', changePasswordValidation, handleValidationErrors, changePassword);
router.post('/logout/:userId', logout);

export default router;
