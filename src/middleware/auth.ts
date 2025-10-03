import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

// Simple authentication middleware (just checks if user exists)
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User ID required in headers' 
      });
    }

    const user = await User.findById(userId).select('-password'); 
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Authentication error' 
    });
  }
};

// Simple authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. Not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions' 
      });
    }

    next();
  };
};