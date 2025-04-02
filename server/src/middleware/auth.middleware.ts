import {Request,Response , NextFunction} from 'express';

import AuthService from '../services/auth.service';
import User from '../models/User';


declare global {
    namespace Express {
      interface Request {
        user?: {
          _id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
          avatar?: string;
        }; // Replace this with the actual type of your user object
      }
    }
  }

  
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        res.status(401).json({
          message: 'Authentication required. Please provide the token in the Authorization header.',
        });
        return; // Ensure no value is returned
      }
  
      const token = authHeader.split(' ')[1];
      const payload = AuthService.verifyAccessToken(token);
      if (!payload) {
        res.status(401).json({
          message: 'Invalid or expired token. Please regenerate.',
        });
        return; // Ensure no value is returned
      }
  
      const user = await User.findById(payload.userId).select('-password');
      if (!user) {
        res.status(401).json({
          message: 'User not found.',
        });
        return; // Ensure no value is returned
      }
  
      req.user = {
        _id: user._id.toString(), // Convert ObjectId to string
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      };
  
      next(); // Pass control to the next middleware
    } catch (error: any) {
      console.error(`Auth middleware error:`, error);
      res.status(500).json({
        message: 'Server error.',
      });
    }
  };


// role based authorization
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          message: 'Authentication required.',
        });
        return; // Ensure no value is returned
      }
  
      // Check if the user's role is included in the allowed roles
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          message: 'Access forbidden.',
        });
        return; // Ensure no value is returned
      }
  
      next(); // Pass control to the next middleware
    };
  };