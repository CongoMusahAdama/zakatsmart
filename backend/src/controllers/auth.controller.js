import crypto from 'crypto';
import User from '../models/user.model.js';
import { createTokenPair, verifyRefreshToken } from '../utils/jwt.utils.js';
import { generateOTP, getOTPExpiry, generateSecureToken } from '../utils/otp.utils.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.utils.js';

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTER
//  POST /api/auth/register
//  Accepts the full 3-step payload in one call.
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
    try {
        const {
            fullName, gender, ageRange, employmentStatus,
            country, region, town,
            email, phone, password,
        } = req.body;

        // Check uniqueness
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(409).json({ success: false, message: 'Email is already registered.' });
            }
        }
        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(409).json({ success: false, message: 'Phone number is already registered.' });
            }
        }

        // Generate OTP for email/phone verification
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();
        const purpose = email ? 'email_verification' : 'phone_verification';

        const user = await User.create({
            fullName, gender, ageRange, employmentStatus,
            country, region: region || '', town: town || '',
            email, phone, password,
            otp: { code: otp, expiresAt: otpExpiry, purpose },
        });

        // Send OTP email (fire and don't block response)
        if (email) {
            sendOTPEmail({ to: email, name: fullName, otp, purpose }).catch(console.error);
        }

        // Issue tokens right away — user can use the app but features may be
        // gated until they verify their email/phone.
        const tokens = createTokenPair(user._id, user.role);

        // Store refresh token (hashed) in DB
        user.refreshToken = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
        await user.save({ validateBeforeSave: false });

        res.status(201).json({
            success: true,
            message: `Account created! A verification code has been sent to your ${email ? 'email' : 'phone'}.`,
            data: {
                user: user.toPublicJSON(),
                ...tokens,
                requiresVerification: true,
                verificationTarget: email || phone,
                verificationPurpose: purpose,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  VERIFY OTP
//  POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res, next) => {
    try {
        const { userId, otp, purpose } = req.body;

        const user = await User.findById(userId).select('+otp.code +otp.expiresAt +otp.purpose');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (
            !user.otp?.code ||
            user.otp.code !== otp ||
            user.otp.purpose !== purpose ||
            new Date() > user.otp.expiresAt
        ) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // Mark verified
        if (purpose === 'email_verification') user.isEmailVerified = true;
        if (purpose === 'phone_verification') user.isPhoneVerified = true;

        // Clear OTP
        user.otp = undefined;
        await user.save({ validateBeforeSave: false });

        // Send welcome email once verified
        if (purpose === 'email_verification' && user.email) {
            sendWelcomeEmail({ to: user.email, name: user.fullName }).catch(console.error);
        }

        res.json({
            success: true,
            message: 'Account verified successfully! Welcome to ZakatAid.',
            data: { user: user.toPublicJSON() },
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  RESEND OTP
//  POST /api/auth/resend-otp
// ─────────────────────────────────────────────────────────────────────────────
export const resendOTP = async (req, res, next) => {
    try {
        const { userId, purpose } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const otp = generateOTP();
        user.otp = { code: otp, expiresAt: getOTPExpiry(), purpose };
        await user.save({ validateBeforeSave: false });

        if (purpose === 'email_verification' && user.email) {
            await sendOTPEmail({ to: user.email, name: user.fullName, otp, purpose });
        }

        res.json({ success: true, message: 'A new OTP has been sent.' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        // Find by email OR phone
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { phone: identifier },
            ],
        }).select('+password +refreshToken');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
        }

        // Issue new token pair
        const tokens = createTokenPair(user._id, user.role);
        user.refreshToken = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Signed in successfully.',
            data: {
                user: user.toPublicJSON(),
                ...tokens,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  REFRESH TOKEN
//  POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────
export const refreshTokens = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token required.' });
        }

        const decoded = verifyRefreshToken(refreshToken);
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== hashedToken) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
        }

        const tokens = createTokenPair(user._id, user.role);
        user.refreshToken = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, data: tokens });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGOUT
//  POST /api/auth/logout  (protected)
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        res.json({ success: true, message: 'Signed out successfully.' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  FORGOT PASSWORD
//  POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return 200 to avoid user enumeration
        if (!user) {
            return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = generateSecureToken();
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save({ validateBeforeSave: false });

        const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail({ to: email, name: user.fullName, resetLink });

        res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  RESET PASSWORD
//  POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshToken = undefined; // Invalidate all sessions
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHANGE PASSWORD  (authenticated)
//  POST /api/auth/change-password
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET CURRENT USER  (authenticated)
//  GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: { user: user.toPublicJSON() } });
    } catch (err) {
        next(err);
    }
};
