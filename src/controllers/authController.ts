import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  try {
    const response = await authService.register({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'USER'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: response
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  try {
    const response = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: response
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me/:userId
// @access  Public
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await authService.getMe(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile/:userId
// @access  Public
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName, username } = req.body;

  try {
    const response = await authService.updateProfile(userId, {
      firstName,
      lastName,
      username
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: response }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password/:userId
// @access  Public
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout/:userId
// @access  Public
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await authService.logout(userId);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});