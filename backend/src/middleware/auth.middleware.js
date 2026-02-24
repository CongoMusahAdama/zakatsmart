import { verifyAccessToken } from '../utils/jwt.utils.js';
import User from '../models/user.model.js';

/**
 * Protect routes — requires a valid Bearer access token.
 */
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please sign in.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        // Verify the user still exists and is active
        const user = await User.findById(decoded.id).select('+isActive');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists or has been deactivated.',
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token. Please sign in.' });
    }
};

/**
 * Restrict to specific roles.
 * Usage: restrict('admin') or restrict('admin', 'org')
 */
export const restrict = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}.`,
            });
        }
        next();
    };
};
