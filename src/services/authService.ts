import { User } from '../models/User';
import { setCache, getCache, deleteCache } from '../config/redis';
import bcrypt from 'bcrypt';

class AuthService {

  // Register new user
  async register(userData: any) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }]
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create user
    const user = await User.create(userData);

    // Cache user data for 30 minutes
    await setCache(`user:${user._id}`, user.toJSON(), 1800);

    return { user: user.toJSON() };
  }

  // Login user
  async login(email: string, password: string) {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Cache user data for 30 minutes
    await setCache(`user:${user._id}`, user.toJSON(), 1800);

    return { user: user.toJSON() };
  }

  // Get current user
  async getMe(userId: string) {
    // Try to get user from cache first
    let user = await getCache(`user:${userId}`);
    
    if (!user) {
      // If not in cache, get from database and cache it
      user = await User.findById(userId);
      if (user) {
        await setCache(`user:${userId}`, user.toJSON(), 1800);
      }
    }

    return user;
  }

  // Update profile
  async updateProfile(userId: string, updateData: any) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if username is already taken by another user
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }

    user.firstName = updateData.firstName || user.firstName;
    user.lastName = updateData.lastName || user.lastName;
    user.username = updateData.username || user.username;

    await user.save();

    // Update cache
    await setCache(`user:${userId}`, user.toJSON(), 1800);

    return user.toJSON();
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }

  // Logout user
  async logout(userId: string) {
    // Remove user from cache
    await deleteCache(`user:${userId}`);
  }
}

export const authService = new AuthService();
