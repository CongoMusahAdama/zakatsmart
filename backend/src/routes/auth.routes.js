import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
    register,
    verifyOTP,
    resendOTP,
    login,
    refreshTokens,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    getMe,
} from '../controllers/auth.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    registerFinalRules,
    loginRules,
    verifyOTPRules,
    forgotPasswordRules,
    resetPasswordRules,
    changePasswordRules,
} from '../validators/auth.validators.js';

const router = Router();

// ── Specific rate limiters for sensitive endpoints ────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 min
    max: 10,
    message: { success: false, message: 'Too many attempts. Please wait 15 minutes and try again.' },
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,   // 5 min
    max: 5,
    message: { success: false, message: 'Too many OTP requests. Please wait 5 minutes.' },
});

// ── Public routes ─────────────────────────────────────────────────────────────

// Register (full 3-step payload in one call)
router.post('/register', authLimiter, registerFinalRules, validate, register);

// OTP
router.post('/verify-otp', otpLimiter, verifyOTPRules, validate, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

// Login / Tokens
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', refreshTokens);

// Password recovery
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, resetPassword);

// ── Protected routes (require Bearer token) ───────────────────────────────────
router.use(protect);

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/change-password', changePasswordRules, validate, changePassword);

export default router;
