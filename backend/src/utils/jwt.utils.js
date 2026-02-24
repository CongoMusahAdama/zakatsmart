import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate a short-lived access token.
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate a long-lived refresh token.
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
};

/**
 * Verify an access token. Throws if invalid / expired.
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify a refresh token. Throws if invalid / expired.
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * Build both tokens and return them together with expiry metadata.
 */
export const createTokenPair = (userId, role = 'user') => {
    const payload = { id: userId, role };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
        expiresIn: JWT_EXPIRES_IN,
    };
};
