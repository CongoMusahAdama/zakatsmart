import crypto from 'crypto';

/**
 * Generate a numeric OTP of given length (default 6 digits).
 */
export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        otp += digits[bytes[i] % 10];
    }
    return otp;
};

/**
 * Return an expiry Date `minutes` from now.
 */
export const getOTPExpiry = (minutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Generate a secure random token (for password reset links, etc.).
 */
export const generateSecureToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
