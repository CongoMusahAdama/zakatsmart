import User from '../models/user.model.js';
import { createError } from '../middleware/error.middleware.js';

// ─────────────────────────────────────────────────────────────────────────────
//  GET OWN PROFILE
//  GET /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return next(createError(404, 'User not found.'));
        res.json({ success: true, data: { user: user.toPublicJSON() } });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE OWN PROFILE
//  PATCH /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
    try {
        // Only allow safe fields to be updated — never password/role here
        const allowed = ['fullName', 'gender', 'ageRange', 'employmentStatus', 'country', 'region', 'town'];
        const updates = {};
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json({ success: true, message: 'Profile updated.', data: { user: user.toPublicJSON() } });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DEACTIVATE OWN ACCOUNT
//  DELETE /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
export const deactivateAccount = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isActive: false, refreshToken: null });
        res.json({ success: true, message: 'Account deactivated. Contact support to re-enable.' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN — LIST ALL USERS
//  GET /api/users  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find().skip(skip).limit(limit).lean(),
            User.countDocuments(),
        ]);

        res.json({
            success: true,
            data: {
                users: users.map((u) => ({
                    id: u._id,
                    fullName: u.fullName,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    isActive: u.isActive,
                    isEmailVerified: u.isEmailVerified,
                    country: u.country,
                    createdAt: u.createdAt,
                })),
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    } catch (err) {
        next(err);
    }
};
