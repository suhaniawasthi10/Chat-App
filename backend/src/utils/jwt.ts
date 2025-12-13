import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};

export const verifyToken = (token: string): { userId: string } => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
