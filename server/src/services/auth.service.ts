import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Define the TokenPayload interface
export interface TokenPayload {
    userId: string;
    role: string;
}

class AuthService {
    /**
     * Generates an Access Token for a user.
     * @param user - The user object (must implement IUser interface).
     */
    generateAccessToken(user: IUser): string {
        const payload: TokenPayload = {
            userId: user._id.toString(), // Ensure `user._id` is a string
            role: user.role
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in the environment variables.");
        }

        return jwt.sign(payload, secret, {
            expiresIn: '15m' // Access token expires in 15 minutes
        });
    }

    /**
     * Generates a Refresh Token for a user.
     * @param user - The user object.
     */
    generateRefreshToken(user: IUser): string {
        const payload: TokenPayload = {
            userId: user._id.toString(), // Fixed typo (`toString`)
            role: user.role
        };

        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            throw new Error("JWT_REFRESH_SECRET is not defined in the environment variables.");
        }

        return jwt.sign(payload, refreshSecret, {
            expiresIn: '7d' // Refresh token expires in 7 days
        });
    }

    /**
     * Verifies the Access Token and returns the payload if valid.
     * @param token - The token string to verify.
     * @returns The extracted TokenPayload or `null` if invalid.
     */
    verifyAccessToken(token: string): TokenPayload | null {
        try {
            const secret = process.env.JWT_SECRET || 'secret';
            return jwt.verify(token, secret) as TokenPayload;
        } catch (error : any) {
            console.error("Invalid Access Token:", error.message);
            return null;
        }
    }

    /**
     * Verifies the Refresh Token and returns the payload if valid.
     * @param token - The token string to verify.
     * @returns The extracted TokenPayload or `null` if invalid.
     */
    verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
            return jwt.verify(token, refreshSecret) as TokenPayload;
        } catch (error : any) {
            console.error("Invalid Refresh Token:", error.message);
            return null;
        }
    }
}

// Export an instance of the AuthService class
export default new AuthService();