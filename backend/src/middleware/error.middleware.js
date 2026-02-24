/**
 * 404 — route not found
 */
export const notFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

/**
 * Global error handler — must have 4 params for Express to recognise it.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
    console.error('💥  Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const fields = Object.fromEntries(
            Object.entries(err.errors).map(([k, v]) => [k, v.message])
        );
        return res.status(422).json({ success: false, message: 'Validation error', errors: fields });
    }

    // Mongoose duplicate key (e.g. unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return res.status(409).json({
            success: false,
            message: `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} is already in use.`,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired.' });
    }

    // Default
    const status = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production' && status === 500
        ? 'An unexpected error occurred.'
        : err.message || 'Internal Server Error';

    res.status(status).json({ success: false, message });
};

/**
 * Convenience: create an error with a status code attached.
 */
export const createError = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};
