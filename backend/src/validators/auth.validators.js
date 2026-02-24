import { body } from 'express-validator';

// ── Registration: Step 1 — Personal Details ───────────────────────────────────
export const registerStep1Rules = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['male', 'female']).withMessage('Gender must be male or female'),

    body('ageRange')
        .notEmpty().withMessage('Age range is required'),

    body('employmentStatus')
        .notEmpty().withMessage('Employment status is required'),
];

// ── Registration: Step 2 — Location ──────────────────────────────────────────
export const registerStep2Rules = [
    body('country')
        .trim()
        .notEmpty().withMessage('Country is required'),

    body('region')
        .optional()
        .trim(),

    body('town')
        .optional()
        .trim(),
];

// ── Registration: Step 3 — Security (final submit) ────────────────────────────
export const registerFinalRules = [
    // Personal (carried over)
    ...registerStep1Rules,
    ...registerStep2Rules,

    // At least one of email or phone
    body('email')
        .if((value, { req }) => !req.body.phone)
        .notEmpty().withMessage('Either email or phone number is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('phone')
        .if((value, { req }) => !req.body.email)
        .notEmpty().withMessage('Either phone or email is required')
        .matches(/^\+?[1-9]\d{6,14}$/).withMessage('Please enter a valid phone number'),

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginRules = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Email or phone number is required'),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ── Forgot password ───────────────────────────────────────────────────────────
export const forgotPasswordRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
];

// ── Reset password ────────────────────────────────────────────────────────────
export const resetPasswordRules = [
    body('token')
        .notEmpty().withMessage('Reset token is required'),

    body('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

// ── OTP verify ────────────────────────────────────────────────────────────────
export const verifyOTPRules = [
    body('userId')
        .notEmpty().withMessage('User ID is required'),

    body('otp')
        .trim()
        .notEmpty().withMessage('OTP code is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers'),

    body('purpose')
        .notEmpty().withMessage('Purpose is required')
        .isIn(['email_verification', 'phone_verification', 'password_reset'])
        .withMessage('Invalid OTP purpose'),
];

// ── Change password (authenticated) ──────────────────────────────────────────
export const changePasswordRules = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Must contain at least one number'),
];
