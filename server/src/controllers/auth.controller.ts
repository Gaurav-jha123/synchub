import { Request, Response } from 'express';
import User from '../models/User';
import AuthService from '../services/auth.service';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        isEmailVerified: true,
      });

      await user.save();

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      user.lastLogin = new Date();
      await user.save();

      return res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const payload = AuthService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

      const user = await User.findById(payload.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const accessToken = AuthService.generateAccessToken(user);

      return res.status(200).json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = req.user;

      return res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new AuthController();