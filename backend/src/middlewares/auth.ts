
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthRequest extends Request {
    userId?: string;
    user?: any;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        // Verify user exists and attach to request
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        // Update last active timestamp
        user.lastActive = new Date();
        await user.save();

        req.userId = decoded.userId; // Keep userId for backward compatibility if needed
        req.user = user; // Attach the full user object to the request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
